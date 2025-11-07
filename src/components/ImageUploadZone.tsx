import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({ onUpload, loading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        await onUpload(file);
      } else {
        alert('JPEG または PNG 形式の画像のみアップロード可能です');
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await onUpload(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
      } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Upload size={48} className="mx-auto mb-4 text-gray-400" />
      {loading ? (
        <p className="text-gray-600">OCR処理中...</p>
      ) : (
        <>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            画像をドラッグ&ドロップ
          </p>
          <p className="text-sm text-gray-500">または、クリックして選択</p>
          <p className="text-xs text-gray-400 mt-2">JPEG, PNG対応</p>
        </>
      )}
    </div>
  );
};
