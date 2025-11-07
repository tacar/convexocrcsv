import React from 'react';
import { Copy, Trash2 } from 'lucide-react';

interface OCRResultCardProps {
  image: {
    _id: string;
    fileName: string;
    imageUrl: string | null | undefined;
    ocrResult: string;
    createdAt: number;
  };
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}

export const OCRResultCard: React.FC<OCRResultCardProps> = ({ image, onDelete, onCopy }) => {
  return (
    <div className="bg-white rounded-lg shadow border p-4">
      {image.imageUrl && (
        <img
          src={image.imageUrl}
          alt={image.fileName}
          className="w-full h-48 object-cover rounded mb-3"
        />
      )}
      <div className="mb-3">
        <p className="text-sm text-gray-500 mb-1">{image.fileName}</p>
        <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{image.ocrResult}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onCopy(image.ocrResult)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          <Copy size={14} />
          コピー
        </button>
        <button
          onClick={() => onDelete(image._id)}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
