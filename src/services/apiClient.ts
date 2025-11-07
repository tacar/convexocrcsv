/**
 * 統一的なAPIクライアント
 * URL、リクエストボディ、レスポンスをログ出力します
 */

export interface ApiClientConfig {
  baseUrl?: string;
  enableLogging?: boolean;
  headers?: Record<string, string>;
}

export interface ApiRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  blob?: Blob;
  status: number;
  statusText: string;
  headers: Headers;
}

class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      enableLogging: true, // デフォルトでログを有効化
      ...config,
    };
  }

  /**
   * ログ出力
   */
  private log(type: 'request' | 'response' | 'error', data: unknown) {
    if (!this.config.enableLogging) return;

    const timestamp = new Date().toISOString();
    const prefix = `[API Client ${type.toUpperCase()}] ${timestamp}`;

    console.group(prefix);
    console.log(data);
    console.groupEnd();
  }

  /**
   * 汎用リクエストメソッド
   */
  async request<T = unknown>(
    request: ApiRequest,
    responseType: 'json' | 'blob' | 'text' = 'json'
  ): Promise<ApiResponse<T>> {
    const { url, method, body, headers } = request;
    const fullUrl = this.config.baseUrl ? `${this.config.baseUrl}${url}` : url;

    // リクエストログ
    this.log('request', {
      method,
      url: fullUrl,
      headers: { ...this.config.headers, ...headers },
      body: body ? JSON.stringify(body, null, 2) : undefined,
    });

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // レスポンスログ（基本情報）
      this.log('response', {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
        contentType: response.headers.get('content-type'),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.log('error', {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }

      let result: ApiResponse<T>;

      if (responseType === 'blob') {
        const blob = await response.blob();
        result = {
          blob,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } else if (responseType === 'text') {
        const text = await response.text();
        this.log('response', { bodyText: text });
        result = {
          data: text as T,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } else {
        const data = await response.json();
        this.log('response', { body: data });
        result = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      }

      return result;
    } catch (error) {
      this.log('error', {
        url: fullUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * GETリクエスト
   */
  async get<T = unknown>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'GET', headers });
  }

  /**
   * POSTリクエスト
   */
  async post<T = unknown>(
    url: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'POST', body, headers });
  }

  /**
   * PUTリクエスト
   */
  async put<T = unknown>(
    url: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PUT', body, headers });
  }

  /**
   * PATCHリクエスト
   */
  async patch<T = unknown>(
    url: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PATCH', body, headers });
  }

  /**
   * DELETEリクエスト
   */
  async delete<T = unknown>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', headers });
  }

  /**
   * 画像やファイルなどBlobとして取得
   */
  async getBlob(url: string, headers?: Record<string, string>): Promise<Blob> {
    const response = await this.request({ url, method: 'GET', headers }, 'blob');
    if (!response.blob) {
      throw new Error('Blobデータの取得に失敗しました');
    }
    return response.blob;
  }

  /**
   * POSTでBlobを取得
   */
  async postBlob(
    url: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<Blob> {
    const response = await this.request({ url, method: 'POST', body, headers }, 'blob');
    if (!response.blob) {
      throw new Error('Blobデータの取得に失敗しました');
    }
    return response.blob;
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient();

// Convex API用のクライアント（本番環境のURL）
export const convexApiClient = new ApiClient({
  baseUrl: 'https://brazen-anteater-770.convex.site',
  enableLogging: true,
});

// 画像生成API用のクライアント
export const imageApiClient = new ApiClient({
  baseUrl: 'https://imgproxy.tacarz.workers.dev',
  enableLogging: true,
});

// テキスト生成API用のクライアント
export const textApiClient = new ApiClient({
  baseUrl: 'https://aip.tacarz.workers.dev',
  enableLogging: true,
});

export default apiClient;
