import { imageApiClient, textApiClient } from './apiClient';

export interface GenerateImageParams {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface GenerateTextParams {
  prompt: string;
}

export const generateImage = async (params: GenerateImageParams): Promise<string> => {
  try {
    console.log('画像生成API呼び出し中...', params.prompt);

    const requestBody = {
      prompt: params.prompt,
      model: params.model || 'flux',
      width: params.width || 1024,
      height: params.height || 768,
      format: params.format || 'jpg'
    };

    // APIクライアントを使用してリクエスト（自動的にログ出力される）
    const response = await imageApiClient.request(
      {
        url: '/t2i',
        method: 'POST',
        body: requestBody,
      },
      'blob'
    );

    const contentType = response.headers.get('content-type');
    console.log('レスポンスContent-Type:', contentType);

    // 画像バイナリの直接レスポンスの場合（最も可能性が高い）
    if (response.blob) {
      const imageUrl = URL.createObjectURL(response.blob);
      console.log('画像生成成功（バイナリ形式）');
      return imageUrl;
    }

    // JSONレスポンスの場合
    if (contentType && contentType.includes('application/json') && response.data) {
      const data = response.data as Record<string, unknown>;
      console.log('JSONレスポンス:', data);

      // imageBase64プロパティの確認（最優先）
      if (data.imageBase64) {
        if (typeof data.imageBase64 === 'string' && data.imageBase64.startsWith('data:')) {
          return data.imageBase64;
        }
        if (typeof data.imageBase64 === 'string') {
          // 拡張子を判定（PNGのマジックナンバー: iVBORw0）
          const isPng = data.imageBase64.startsWith('iVBORw0');
          const mimeType = isPng ? 'image/png' : 'image/jpeg';
          return `data:${mimeType};base64,${data.imageBase64}`;
        }
      }

      if (data.image) {
        // Base64形式の場合
        if (typeof data.image === 'string' && data.image.startsWith('data:')) {
          return data.image;
        }
        // Base64データのみの場合
        if (typeof data.image === 'string') {
          return `data:image/jpeg;base64,${data.image}`;
        }
      }

      if (data.url && typeof data.url === 'string') {
        return data.url;
      }

      if (data.data) {
        // data プロパティにBase64が入っている可能性
        if (typeof data.data === 'string' && data.data.startsWith('data:')) {
          return data.data;
        }
        if (typeof data.data === 'string') {
          return `data:image/jpeg;base64,${data.data}`;
        }
      }

      console.error('JSONレスポンス内に画像データが見つかりません:', data);
      throw new Error('画像データが見つかりません');
    }

    throw new Error('画像データが見つかりません');
  } catch (error) {
    console.error('画像生成エラー:', error);
    throw error;
  }
};

export const generateText = async (prompt: string): Promise<string> => {
  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    // APIクライアントを使用してリクエスト（自動的にログ出力される）
    const response = await textApiClient.post<{
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    }>('/gemini', requestBody);

    const data = response.data;
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('テキスト生成エラー:', error);
    throw error;
  }
};

export const searchUnsplashImage = (query: string): string => {
  const encodedQuery = encodeURIComponent(query);
  return `https://source.unsplash.com/1024x768/?${encodedQuery}`;
};