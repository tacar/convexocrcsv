import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArrowLeft, Plus, Trash2, Edit2, User, Users, Share2, Check, Globe } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';

export const ListPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemShared, setNewItemShared] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [inviteToken, setInviteToken] = useState('');

  // カテゴリ情報とメンバーを取得
  const categoryWithMembers = useQuery(
    api.promptCategories.getCategoryWithMembers,
    userId && listId ? { categoryId: listId as Id<'prompt_categories'>, userId } : 'skip'
  );

  // アイテムを取得
  const items = useQuery(
    api.promptItems.getByCategory,
    userId && listId ? { categoryId: listId as Id<'prompt_categories'>, userId } : 'skip'
  );

  const createItem = useMutation(api.promptItems.create);
  const toggleDone = useMutation(api.promptItems.toggleDone);
  const toggleShared = useMutation(api.promptItems.toggleShared);
  const updateItem = useMutation(api.promptItems.update);
  const deleteItem = useMutation(api.promptItems.remove);
  const generateInvite = useMutation(api.promptCategories.generateInviteToken);

  // デバッグログ
  React.useEffect(() => {
    console.log('===== ListPage Debug =====');
    console.log('items:', items);
    if (items && items.length > 0) {
      console.log('items details:', items.map(item => ({
        id: item._id,
        title: item.title,
        done: item.done,
        isShared: item.isShared
      })));
    }
    console.log('============================');
  }, [items]);

  const handleCreateItem = async () => {
    if (!newItemTitle.trim() || !userId || !listId) return;

    console.log('[ListPage] Creating item:', {
      title: newItemTitle,
      isShared: newItemShared,
      categoryId: listId,
      userId
    });

    await createItem({
      categoryId: listId as Id<'prompt_categories'>,
      title: newItemTitle,
      isShared: newItemShared,
      userId,
    });

    console.log('[ListPage] Item created successfully');
    setNewItemTitle('');
    setNewItemShared(false);
  };

  const handleToggleDone = async (id: any) => {
    if (!userId) return;
    await toggleDone({ id, userId });
  };

  const handleToggleShared = async (id: any) => {
    if (!userId) return;

    console.log('[ListPage] Toggling shared:', {
      itemId: id,
      userId
    });

    try {
      await toggleShared({ id, userId });
      console.log('[ListPage] Shared toggled successfully');
    } catch (error) {
      console.error('[ListPage] Error toggling shared:', error);
    }
  };

  const handleUpdateItem = async (id: any) => {
    if (!editingTitle.trim() || !userId) return;

    await updateItem({
      id,
      title: editingTitle,
      userId,
    });
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDeleteItem = async (id: any) => {
    if (!userId) return;
    await deleteItem({ id, userId });
  };

  const handleGenerateInvite = async () => {
    if (!userId || !listId) return;
    try {
      const token = await generateInvite({
        categoryId: listId as Id<'prompt_categories'>,
        userId,
      });
      setInviteToken(token);
      setShowInviteLink(true);
    } catch (error) {
      console.error('招待リンク生成エラー:', error);
    }
  };

  const copyInviteLink = () => {
    const link = `https://conprompt.mylastwork.net/invite/${inviteToken}`;
    navigator.clipboard.writeText(link);
    alert('招待リンクをコピーしました');
  };

  if (!listId) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {categoryWithMembers?.name || 'TODOリスト'}
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Users size={12} />
                  <span>{categoryWithMembers?.members?.length || 0}人</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateInvite}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              <Share2 size={14} />
              共有
            </button>
          </div>

          {/* メンバー一覧 */}
          {categoryWithMembers?.members && categoryWithMembers.members.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {categoryWithMembers.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                >
                  <User size={12} />
                  <span>{member.displayName}</span>
                </div>
              ))}
            </div>
          )}

          {/* 招待リンク */}
          {showInviteLink && inviteToken && (
            <div className="mt-3 p-3 bg-blue-50 rounded">
              <p className="text-xs font-medium text-gray-700 mb-2">招待リンク:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`https://conprompt.mylastwork.net/invite/${inviteToken}`}
                  readOnly
                  className="flex-1 px-2 py-1 bg-white border rounded text-xs"
                />
                <button
                  onClick={copyInviteLink}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  コピー
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white rounded shadow">
          {/* 新規追加フォーム */}
          <div className="p-3 border-b">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateItem()}
                placeholder="新しいTODOを追加..."
                className="flex-1 px-3 py-2 border rounded"
              />
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer px-3 py-2 border rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={newItemShared}
                  onChange={(e) => setNewItemShared(e.target.checked)}
                  className="w-4 h-4"
                />
                <Globe size={14} className={newItemShared ? 'text-green-600' : 'text-gray-400'} />
                <span>共有</span>
              </label>
              <button
                onClick={handleCreateItem}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                追加
              </button>
            </div>
          </div>

          {/* TODOリスト */}
          <div>
            {items?.map((item) => (
              <div
                key={item._id}
                className="px-3 py-2 border-b hover:bg-gray-50 last:border-b-0"
              >
                {editingId === item._id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateItem(item._id)}
                      className="flex-1 px-2 py-1 border rounded"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateItem(item._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingTitle('');
                      }}
                      className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleDone(item._id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.done
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {item.done && <Check size={14} className="text-white" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`${
                            item.done
                              ? 'line-through text-gray-400'
                              : 'text-gray-900'
                          }`}
                        >
                          {item.title}
                        </p>
                        {item.isShared && (
                          <Globe size={12} className="text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        作成: {item.createdByName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center cursor-pointer" title="共有">
                        <input
                          type="checkbox"
                          checked={item.isShared || false}
                          onChange={() => handleToggleShared(item._id)}
                          className="w-4 h-4"
                        />
                      </label>
                      <button
                        onClick={() => {
                          setEditingId(item._id);
                          setEditingTitle(item.title);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {(!items || items.length === 0) && (
              <div className="p-8 text-center text-gray-400">
                TODOがありません
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
