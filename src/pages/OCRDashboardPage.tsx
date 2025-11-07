import React, { useState } from 'react';
import { useOCRAuth } from '../contexts/OCRAuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Plus, LogOut, Trash2, Edit2, User, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OCRDashboardPage: React.FC = () => {
  const { user, userId, isAnonymous, linkAnonymousWithGoogle, logout } = useOCRAuth();
  const navigate = useNavigate();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const categories = useQuery(api.ocrcsvCategories.getByUser, userId ? { userId } : 'skip');
  const createCategory = useMutation(api.ocrcsvCategories.create);
  const updateCategory = useMutation(api.ocrcsvCategories.update);
  const deleteCategory = useMutation(api.ocrcsvCategories.remove);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !userId) return;
    await createCategory({ name: newCategoryName, userId });
    setNewCategoryName('');
    setIsCreating(false);
  };

  const handleUpdateCategory = async (id: any) => {
    if (!editingName.trim() || !userId) return;
    await updateCategory({ id, name: editingName, userId });
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteCategory = async (id: any) => {
    if (!userId) return;
    if (confirm('カテゴリと関連するすべての画像が削除されます。よろしいですか？')) {
      await deleteCategory({ id, userId });
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  const handleLinkAccount = async () => {
    try {
      await linkAnonymousWithGoogle();
      alert('アカウントを作成しました！データは引き継がれています。');
    } catch (error: any) {
      console.error('アカウントリンクエラー:', error);
      alert('アカウント作成に失敗しました: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon size={24} />
                OCR CSV
              </h1>
              <p className="text-sm text-gray-500 mt-1">画像から文字を抽出・管理</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                <User size={14} />
                <span>{user?.displayName || user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                <LogOut size={14} />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {isAnonymous && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800">
                  匿名ユーザーとしてログイン中
                </h3>
                <p className="text-xs text-yellow-700 mt-1">
                  Googleアカウントを作成すると、複数端末でデータを同期できます。
                </p>
              </div>
              <button
                onClick={handleLinkAccount}
                className="ml-4 px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                アカウントを作成
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {categories?.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded border hover:shadow transition-shadow"
            >
              {editingId === category._id ? (
                <div className="p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory(category._id)}
                      className="flex-1 px-3 py-2 border rounded"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateCategory(category._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName('');
                      }}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/category/${category._id}`)}
                    >
                      <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">クリックして画像を管理</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingId(category._id);
                          setEditingName(category.name);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isCreating ? (
            <div className="bg-white rounded border p-3">
              <h3 className="font-semibold text-gray-900 mb-2">新しいカテゴリ</h3>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                placeholder="カテゴリ名を入力"
                className="w-full px-3 py-2 border rounded mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateCategory}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  作成
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewCategoryName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full bg-white rounded border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 p-6 flex flex-col items-center justify-center transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-full mb-2">
                <Plus size={24} className="text-blue-600" />
              </div>
              <span className="font-semibold text-gray-700">新しいカテゴリを作成</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
