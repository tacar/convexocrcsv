import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Handle image upload to R2
  if (url.pathname === '/api/upload' && request.method === 'POST') {
    return handleImageUpload(request);
  }

  // Handle image retrieval from R2
  if (url.pathname.startsWith('/images/')) {
    return handleImageGet(url);
  }

  // Handle API requests - proxy to Convex
  if (url.pathname.startsWith('/api/')) {
    return handleAPIProxy(request, url);
  }

  // Handle Apple App Site Association for Universal Links
  if (url.pathname === '/.well-known/apple-app-site-association') {
    return handleAASA();
  }

  // Handle invite links for smart linking
  if (url.pathname.startsWith('/invite/')) {
    return handleInviteRoute(event, url);
  }

  try {
    // 静的ファイルを返す
    return await getAssetFromKV(event, {
      mapRequestToAsset: req => {
        const url = new URL(req.url);
        if (url.pathname === '/') {
          return new Request(`${url.origin}/index.html`, req);
        }
        return req;
      }
    });
  } catch (e) {
    // 404の場合はindex.htmlを返す（SPA対応）
    try {
      const notFoundResponse = await getAssetFromKV(event, {
        mapRequestToAsset: req => new Request(`${url.origin}/index.html`, req),
      });
      return new Response(notFoundResponse.body, { ...notFoundResponse, status: 200 });
    } catch (e) {
      console.log('Asset not found:', e);
    }

    return new Response('Not Found', { status: 404 });
  }
}

async function handleAPIProxy(request, url) {
  try {
    // Convex deployment URL
    const CONVEX_URL = 'https://brazen-anteater-770.convex.site';

    // Build the target URL
    const targetUrl = new URL(url.pathname + url.search, CONVEX_URL);

    console.log('[Worker] API Proxy Request:', {
      method: request.method,
      originalUrl: url.toString(),
      targetUrl: targetUrl.toString(),
    });

    // Create new request with same method, headers, and body
    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    // Forward the request to Convex
    const response = await fetch(proxyRequest);

    console.log('[Worker] API Proxy Response:', {
      status: response.status,
      statusText: response.statusText,
    });

    // Return the response with CORS headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return newResponse;
  } catch (error) {
    console.error('[Worker] API Proxy Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

function handleAASA() {
  const aasa = {
    "applinks": {
      "apps": [],
      "details": [
        {
          "appID": "YLW4RRJG34.com.tacar.kaimono",
          "paths": ["/invite/*"]
        },
        {
          "appID": "36684D66Q5.com.tacar.kaimono",
          "paths": ["/invite/*"]
        }
      ]
    }
  };

  return new Response(JSON.stringify(aasa), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

async function handleImageUpload(request) {
  try {
    console.log('[Worker] Image upload request started');

    console.log('[Worker] Reading formData...');
    const formData = await request.formData();
    const file = formData.get('image');

    console.log('[Worker] File info:', {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
    });

    if (!file) {
      console.error('[Worker] No image file provided');
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomStr}.${extension}`;

    console.log('[Worker] Uploading to R2:', filename);
    console.log('[Worker] R2 binding available:', typeof PROMPT_IMAGES !== 'undefined');

    // Upload to R2 using global binding
    await PROMPT_IMAGES.put(filename, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Generate Worker-based URL (no DNS configuration needed)
    const imageUrl = `https://prompt.tacarz.workers.dev/images/${filename}`;

    console.log('[Worker] Image uploaded successfully:', { filename, imageUrl });

    return new Response(JSON.stringify({ url: imageUrl, filename }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Worker] Image upload error:', error);
    console.error('[Worker] Error stack:', error.stack);
    console.error('[Worker] Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause,
    });
    return new Response(JSON.stringify({
      error: error.message,
      details: error.stack,
      name: error.name,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

async function handleImageGet(url) {
  try {
    console.log('[Worker] Image get request started');

    // Extract filename from path
    const filename = url.pathname.replace('/images/', '');
    console.log('[Worker] Retrieving image:', filename);

    if (!filename) {
      console.error('[Worker] No filename provided');
      return new Response('No filename provided', { status: 400 });
    }

    // Retrieve image from R2
    const object = await PROMPT_IMAGES.get(filename);

    if (!object) {
      console.error('[Worker] Image not found:', filename);
      return new Response('Image not found', { status: 404 });
    }

    console.log('[Worker] Image found, returning with content type:', object.httpMetadata?.contentType);

    // Return image with proper headers
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Worker] Image get error:', error);
    console.error('[Worker] Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    return new Response(JSON.stringify({
      error: 'Error retrieving image',
      details: error.message,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

async function handleInviteRoute(event, url) {
  const request = event.request;
  const userAgent = request.headers.get('User-Agent') || '';
  const token = url.pathname.split('/')[2];

  // Platform detection
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid;

  // App scheme URLs
  const appUrl = `kaumono://invite/${token}`;
  const appStoreUrl = 'https://apps.apple.com/jp/app/id6744750539';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.tacar.kaimono';

  // Smart app redirect page for mobile devices
  if (isMobile) {
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kaumono - カテゴリ招待</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
        }
        .container {
            text-align: center;
            max-width: 400px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px 20px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }
        p {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: scale(1.05);
        }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        #status {
            margin-top: 20px;
            font-size: 14px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📋</div>
        <h1>Kaumonoカテゴリへの招待</h1>
        <p>アプリを開いています...</p>
        <div class="spinner"></div>
        <div id="status">アプリが開かない場合は、下のボタンをタップしてください</div>
        <a href="${isIOS ? appStoreUrl : playStoreUrl}" class="btn" id="storeBtn" style="display: none;">
            ${isIOS ? 'App Storeで開く' : 'Google Playで開く'}
        </a>
    </div>
    <script>
        // Try to open the app immediately
        window.location.href = '${appUrl}';

        // If app doesn't open after 2 seconds, show the App Store button
        setTimeout(function() {
            document.querySelector('.spinner').style.display = 'none';
            document.querySelector('#storeBtn').style.display = 'inline-block';
            document.querySelector('#status').textContent = 'アプリがインストールされていない場合';
        }, 2000);

        // If the user comes back to this page (app not installed), redirect to store after 3 seconds
        let hidden = false;
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                hidden = true;
            } else if (hidden) {
                // User came back, app probably not installed
                setTimeout(function() {
                    window.location.href = '${isIOS ? appStoreUrl : playStoreUrl}';
                }, 500);
            }
        });
    </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  // For desktop, serve the web app
  try {
    const notFoundResponse = await getAssetFromKV(event, {
      mapRequestToAsset: req => new Request(`${url.origin}/index.html`, req),
    });
    return new Response(notFoundResponse.body, { ...notFoundResponse, status: 200 });
  } catch (e) {
    return new Response('Invite page not found', { status: 404 });
  }
}
