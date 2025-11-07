import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOCRAuth } from '../contexts/OCRAuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArrowLeft } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';
import { ImageUploadZone } from '../components/ImageUploadZone';
import { OCRResultCard } from '../components/OCRResultCard';

export const OCRCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { userId } = useOCRAuth();
  const { showSuccess, showError } = useNotification();
  const [uploading, setUploading] = useState(false);

  const images = useQuery(
    api.ocrcsvImages.getByCategoryId,
    categoryId ? { categoryId: categoryId as Id<'ocrcsv_categories'> } : 'skip'
  );
  const generateUploadUrl = useMutation(api.ocrcsvImages.generateUploadUrl);
  const createImage = useMutation(api.ocrcsvImages.create);
  const deleteImage = useMutation(api.ocrcsvImages.remove);

  const handleUpload = async (file: File) => {
    if (!userId || !categoryId) return;

    try {
      setUploading(true);

      // 1. ファイルをBase64に変換
      const base64 = await fileToBase64(file);

      // 2. OCR APIを呼び出し
      const ocrResult = await callOCRAPI(base64, file.type);

      // 3. Convex Storageにアップロード
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResult.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      const { storageId } = await uploadResult.json();

      // 4. DBに保存
      await createImage({
        categoryId: categoryId as Id<'ocrcsv_categories'>,
        fileName: file.name,
        imageStorageId: storageId,
        ocrResult,
        mimeType: file.type,
        userId,
      });

      showSuccess('画像をアップロードしました', 'OCR処理が完了しました');
    } catch (error) {
      console.error('アップロードエラー:', error);
      showError('アップロードに失敗しました', error instanceof Error ? error.message : '不明なエラー');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    if (!confirm('この画像を削除しますか？')) return;

    try {
      await deleteImage({ id: id as Id<'ocrcsv_images'>, userId });
      showSuccess('画像を削除しました', '');
    } catch (error) {
      console.error('削除エラー:', error);
      showError('削除に失敗しました', error instanceof Error ? error.message : '不明なエラー');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('コピーしました', 'クリップボードにコピーしました');
  };

  if (!userId || !categoryId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">画像管理</h1>
              <p className="text-sm text-gray-500 mt-1">画像をアップロードしてOCR処理</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <ImageUploadZone onUpload={handleUpload} loading={uploading} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images?.map((image) => (
            <OCRResultCard
              key={image._id}
              image={image}
              onDelete={handleDelete}
              onCopy={handleCopy}
            />
          ))}
        </div>

        {images && images.length === 0 && !uploading && (
          <div className="text-center py-12 text-gray-500">
            <p>まだ画像がアップロードされていません</p>
            <p className="text-sm mt-2">上のエリアから画像をアップロードしてください</p>
          </div>
        )}
      </main>
    </div>
  );
};

// ヘルパー関数: ファイルをBase64に変換
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/jpeg;base64, の部分を除去
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ヘルパー関数: OCR APIを呼び出し
async function callOCRAPI(base64Image: string, mimeType: string): Promise<string> {
  const response = await fetch('https://ait.tacarz.workers.dev/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image,
      mimeType: mimeType,
    }),
  });

  if (!response.ok) {
    throw new Error(`OCR API エラー: ${response.status}`);
  }

  const data = await response.json();
  return data.text || data.result || JSON.stringify(data);
}
