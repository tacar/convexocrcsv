import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArrowLeft, Globe, Check } from 'lucide-react';

export const SharedListPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();

  // 共有アイテムを取得
  const sharedItems = useQuery(
    api.promptItems.getSharedItems,
    userId ? { userId } : 'skip'
  );

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Globe size={20} className="text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  みんなのリスト
                </h1>
                <p className="text-xs text-gray-500">
                  共有されているTODOを閲覧できます
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white rounded shadow">
          <div className="divide-y">
            {sharedItems?.map((item) => (
              <div
                key={item._id}
                className="px-3 py-2 hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                      item.done
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {item.done && <Check size={14} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`${
                        item.done
                          ? 'line-through text-gray-400'
                          : 'text-gray-900'
                      }`}
                    >
                      {item.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500">
                        作成: {item.createdByName}
                      </p>
                      <p className="text-xs text-gray-500">
                        カテゴリ: {item.categoryName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Globe size={14} className="text-green-600" />
                  </div>
                </div>
              </div>
            ))}
            {(!sharedItems || sharedItems.length === 0) && (
              <div className="p-8 text-center text-gray-400">
                <Globe size={48} className="mx-auto mb-3 text-gray-300" />
                <p>共有されているTODOがありません</p>
                <p className="text-xs mt-2">
                  TODOの地球アイコンをクリックすると、他の人と共有できます
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
