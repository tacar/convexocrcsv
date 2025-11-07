import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Plus, ArrowLeft, Share2, Trash2, Edit2, User, Crown, X, LogOut, Smartphone, Monitor, List, Info, Folder } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { detectPlatform, getRecommendedLink } from '../lib/platform';

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [platformInfo] = useState(() => detectPlatform());
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    dangerous?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // listsは削除されました - カテゴリ自体がTODOリストです
  const lists: any[] = []; // 一時的なダミー

  const categoryWithMembers = useQuery(
    api.promptCategories.getCategoryWithMembers,
    userId && categoryId ? { categoryId: categoryId as Id<'prompt_categories'>, userId } : 'skip'
  );

  // listsは削除されました - 以下は一時的なダミー
  const createList = async (_args: any) => {};
  const updateList = async (_args: any) => {};
  const deleteList = async (_args: any) => {};
  const generateInvite = useMutation(api.promptCategories.generateInviteToken);
  const removeMember = useMutation(api.promptCategories.removeMember);
  const leaveCategory = useMutation(api.promptCategories.leaveCategory);

  const handleCreateList = async () => {
    if (!newListTitle.trim() || !userId || !categoryId) return;
    await createList({
      categoryId: categoryId as Id<'prompt_categories'>,
      title: newListTitle,
      userId,
    });
    setNewListTitle('');
    setIsCreating(false);
  };

  const handleUpdateList = async (id: any) => {
    if (!editingTitle.trim() || !userId) return;
    await updateList({ id, title: editingTitle, userId });
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDeleteList = async (id: any) => {
    if (!userId) return;
    if (confirm('リストと関連するすべてのアイテムが削除されます。よろしいですか？')) {
      await deleteList({ id, userId });
    }
  };

  const handleGenerateInvite = async () => {
    if (!userId || !categoryId) return;
    const token = await generateInvite({
      categoryId: categoryId as Id<'prompt_categories'>,
      userId,
    });
    const recommendedLink = getRecommendedLink(token, platformInfo);
    setInviteToken(recommendedLink.primary);
    setShowInvite(true);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteToken);
    showSuccess(
      '招待リンクをコピーしました',
      platformInfo.isMobile
        ? 'アプリとWebの両方に対応したスマートリンクです'
        : 'どのデバイスでも開けるユニバーサルリンクです'
    );
  };

  const handleRemoveMember = (member: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'メンバー除名',
      message: `${member.displayName}をこのカテゴリから除名しますか？`,
      onConfirm: async () => {
        try {
          if (userId && categoryId) {
            await removeMember({
              categoryId: categoryId as Id<'prompt_categories'>,
              targetUserId: member._id,
              executorUserId: userId,
            });
            showSuccess(
              'メンバーを除名しました',
              `${member.displayName}をカテゴリから除名しました`
            );
          }
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error('除名エラー:', error);
          showError('除名に失敗しました', error instanceof Error ? error.message : '不明なエラーが発生しました');
        }
      },
      dangerous: true,
    });
  };

  const handleLeaveCategory = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'カテゴリ脱退',
      message: 'このカテゴリから脱退しますか？今後アクセスできなくなります。',
      onConfirm: async () => {
        try {
          if (userId && categoryId) {
            await leaveCategory({
              categoryId: categoryId as Id<'prompt_categories'>,
              userId,
            });
            showSuccess(
              'カテゴリから脱退しました',
              '今後このカテゴリにはアクセスできません'
            );
            // 少し遅らせてからリダイレクト（通知を見せるため）
            setTimeout(() => navigate('/'), 1500);
          }
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error('脱退エラー:', error);
          showError('脱退に失敗しました', error instanceof Error ? error.message : '不明なエラーが発生しました');
        }
      },
      dangerous: true,
    });
  };

  if (!userId || !categoryId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Folder size={14} />
                  <span>プロジェクト</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  {categoryWithMembers?.name || 'プロジェクト'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  このプロジェクトのTODOリストを管理
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {categoryWithMembers && categoryWithMembers.ownerId !== userId && (
                <button
                  onClick={handleLeaveCategory}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  <LogOut size={16} />
                  脱退する
                </button>
              )}
              <button
                onClick={handleGenerateInvite}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
              >
                <Share2 size={16} />
                メンバーを招待
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {categoryWithMembers && categoryWithMembers.members && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">メンバー一覧</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categoryWithMembers.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                >
                  {member.isOwner ? (
                    <Crown size={16} className="text-yellow-500" />
                  ) : (
                    <User size={16} className="text-gray-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.isOwner && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                        オーナー
                      </span>
                    )}
                    {categoryWithMembers && categoryWithMembers.ownerId === userId && !member.isOwner && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="メンバーを除名"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showInvite && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              {platformInfo.isMobile ? (
                <Smartphone size={16} className="text-blue-600" />
              ) : (
                <Monitor size={16} className="text-blue-600" />
              )}
              <p className="text-sm font-medium text-blue-700">スマート招待リンク</p>
            </div>

            <p className="text-xs text-blue-600 mb-3">
              {platformInfo.isMobile
                ? '📱 アプリがあれば自動で起動、なければWebで開きます'
                : '🌐 Webブラウザで開きます'
              }
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={inviteToken}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              />
              <button
                onClick={handleCopyInvite}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                📋 コピー
              </button>
            </div>

            {/* 詳細リンク情報 */}
            <details className="text-xs text-blue-600">
              <summary className="cursor-pointer hover:text-blue-800 mb-2">
                📋 その他のリンク形式
              </summary>
              <div className="bg-white rounded p-2 space-y-1">
                <div>
                  <span className="font-medium">🌐 Web:</span> {inviteToken}
                </div>
                <div>
                  <span className="font-medium">📱 アプリ:</span> kaumono://invite/{inviteToken.split('/').pop()}
                </div>
              </div>
            </details>

            <div className="flex justify-end mt-3">
              <button
                onClick={() => setShowInvite(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* 説明カード */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">TODOリストとは？</h3>
            <p className="text-sm text-blue-800">
              TODOリストごとに複数のアイテムを管理できます。買い物リスト、やることリストなど、用途に応じて作成しましょう。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists?.map((list) => (
            <div
              key={list._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200"
            >
              {editingId === list._id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateList(list._id)}
                      className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingTitle('');
                      }}
                      className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <List className="text-purple-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-xl font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                        onClick={() => navigate(`/list/${list._id}`)}
                      >
                        {list.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">クリックしてアイテムを表示</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setEditingId(list._id);
                        setEditingTitle(list.title);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteList(list._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {isCreating ? (
            <div className="bg-white rounded-xl shadow-md p-6 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <List className="text-purple-600" size={20} />
                <h3 className="font-semibold text-gray-900">新しいTODOリスト</h3>
              </div>
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="リスト名を入力（例: 買い物リスト、やることリスト）"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateList}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  作成
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewListTitle('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 flex flex-col items-center justify-center group"
            >
              <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200 transition-colors">
                <Plus size={32} className="text-purple-600" />
              </div>
              <span className="text-lg font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                新しいTODOリストを作成
              </span>
              <span className="text-sm text-gray-500 mt-1">クリックして開始</span>
            </button>
          )}
        </div>
      </main>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        confirmText="実行"
        cancelText="キャンセル"
        dangerous={confirmDialog.dangerous}
      />
    </div>
  );
};