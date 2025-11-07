import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArrowLeft, Trash2, Shield, Globe, AlertTriangle, Plus, Edit2, X } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';

const ADMIN_EMAIL = 'tacarz@gmail.com';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userId } = useAuth();
  const [activeTab, setActiveTab] = useState<'prompts' | 'reports' | 'users'>('prompts');

  // 追加・編集用の状態
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isShared: true,
    authorName: 'Rei', // デフォルトの投稿者名
  });

  // 管理者チェック
  const isAdmin = user?.email === ADMIN_EMAIL;

  // 共有プロンプト一覧を取得
  const sharedPrompts = useQuery(
    api.promptItems.getSharedItems,
    userId ? { userId } : 'skip'
  );

  // カテゴリ一覧を取得
  const categories = useQuery(
    api.promptCategories.getByUser,
    userId ? { userId } : 'skip'
  );

  // 通報一覧を取得（管理者のみ）
  const reports = useQuery(
    api.promptItems_admin.getReportedPrompts,
    isAdmin && user?.uid ? { adminUserId: user.uid } : 'skip'
  );

  // ミューテーション
  const createPromptWithAuthor = useMutation(api.promptItems_admin_create.createWithAuthor);
  const updatePromptWithAuthor = useMutation(api.promptItems_admin_create.updateWithAuthor);
  const deletePrompt = useMutation(api.promptItems.remove);
  const updateSharedStatus = useMutation(api.promptItems_admin.updateSharedStatus);

  // 管理者でない場合はアクセス拒否
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <Shield size={24} />
            <h2 className="text-xl font-bold">アクセス拒否</h2>
          </div>
          <p className="text-gray-700 mb-4">
            この管理画面にアクセスする権限がありません。
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  // プロンプト追加
  const handleAddPrompt = async () => {
    if (!user?.uid || !categories || categories.length === 0) {
      alert('カテゴリがありません。先にカテゴリを作成してください。');
      return;
    }
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('タイトルと内容を入力してください');
      return;
    }
    if (!formData.authorName.trim()) {
      alert('投稿者名を入力してください');
      return;
    }

    try {
      // 最初のカテゴリを使用
      const categoryId = categories[0]._id as Id<'prompt_categories'>;

      await createPromptWithAuthor({
        categoryId,
        title: formData.title,
        content: formData.content,
        isShared: formData.isShared,
        authorName: formData.authorName,
        adminUserId: user.uid,
      });

      alert('プロンプトを追加しました');
      setFormData({ title: '', content: '', isShared: true, authorName: 'Rei' });
      setIsAdding(false);
    } catch (error) {
      console.error('追加エラー:', error);
      alert('追加に失敗しました');
    }
  };

  // プロンプト編集
  const handleEditPrompt = async () => {
    if (!user?.uid || !editingId) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('タイトルと内容を入力してください');
      return;
    }
    if (!formData.authorName.trim()) {
      alert('投稿者名を入力してください');
      return;
    }

    try {
      await updatePromptWithAuthor({
        id: editingId as Id<'prompt_items'>,
        title: formData.title,
        content: formData.content,
        isShared: formData.isShared,
        authorName: formData.authorName,
        adminUserId: user.uid,
      });

      alert('プロンプトを更新しました');
      setFormData({ title: '', content: '', isShared: true, authorName: 'Rei' });
      setEditingId(null);
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました');
    }
  };

  // 編集開始
  const startEdit = (item: any) => {
    setFormData({
      title: item.title,
      content: item.content || '',
      isShared: item.isShared || false,
      authorName: item.createdByName || 'Rei',
    });
    setEditingId(item._id);
    setIsAdding(false);
  };

  // キャンセル
  const handleCancel = () => {
    setFormData({ title: '', content: '', isShared: true, authorName: 'Rei' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDeletePrompt = async (promptId: any, createdBy: any) => {
    if (!userId) return;
    if (!confirm('このプロンプトを削除しますか？')) return;

    try {
      await deletePrompt({ id: promptId, userId: createdBy });
      alert('削除しました');
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const handleToggleShared = async (promptId: any, currentStatus: boolean) => {
    if (!user?.uid) return;
    if (!confirm(`このプロンプトを${currentStatus ? '非公開' : '公開'}にしますか？`)) return;

    try {
      await updateSharedStatus({
        promptItemId: promptId,
        isShared: !currentStatus,
        adminUserId: user.uid
      });
      alert('更新しました');
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <Shield size={24} className="text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">管理画面</h1>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* タブメニュー */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-4 py-2 rounded-t font-medium ${
                activeTab === 'prompts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe size={16} />
                共有プロンプト
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-t font-medium ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                通報一覧
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 編集モーダル */}
        {editingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  プロンプトを編集
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    投稿者名
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="投稿者の表示名"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    この名前でプロンプトが投稿されます（例: Rei）
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイトル
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="プロンプトのタイトル"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    内容
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border rounded h-64"
                    placeholder="プロンプトの内容"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isSharedModal"
                    checked={formData.isShared}
                    onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isSharedModal" className="text-sm text-gray-700 cursor-pointer">
                    みんなのリストで公開する
                  </label>
                </div>
              </div>
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-2 border-t">
                <button
                  onClick={handleEditPrompt}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  更新
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 共有プロンプト管理 */}
        {activeTab === 'prompts' && (
          <div className="space-y-4">
            {/* 追加フォーム */}
            {isAdding && (
              <div className="bg-white rounded shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    新規プロンプトを追加
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      投稿者名
                    </label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="投稿者の表示名"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      この名前でプロンプトが投稿されます（例: Rei）
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="プロンプトのタイトル"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      内容
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-3 py-2 border rounded h-40"
                      placeholder="プロンプトの内容"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isShared"
                      checked={formData.isShared}
                      onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="isShared" className="text-sm text-gray-700 cursor-pointer">
                      みんなのリストで公開する
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddPrompt}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      追加
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* プロンプト一覧 */}
            <div className="bg-white rounded shadow">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">共有プロンプト一覧</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    全ユーザーが投稿した共有プロンプトを管理できます
                  </p>
                </div>
                {!isAdding && !editingId && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    新規追加
                  </button>
                )}
              </div>
              <div className="divide-y">
                {sharedPrompts?.map((item) => (
                  <div key={item._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                          {item.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>投稿者: {item.createdByName}</span>
                          <span>カテゴリ: {item.categoryName}</span>
                          <span>{new Date(item.createdAt).toLocaleString('ja-JP')}</span>
                          <span>使用回数: {item.usageCount || 0}回</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="編集"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleShared(item._id, item.isShared || false)}
                          className={`px-3 py-1 text-xs rounded ${
                            item.isShared
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {item.isShared ? '公開中' : '非公開'}
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(item._id, item.createdBy)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="削除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!sharedPrompts || sharedPrompts.length === 0) && (
                  <div className="p-8 text-center text-gray-400">
                    共有プロンプトがありません
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 通報管理 */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">通報一覧</h2>
              <p className="text-sm text-gray-500 mt-1">
                ユーザーから通報されたプロンプトを確認できます
              </p>
            </div>
            <div className="divide-y">
              {reports?.map((item) => {
                if (!item || !item.prompt) return null;
                return (
                  <div key={item.report._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.prompt.title}</h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {item.prompt.content}
                        </p>
                        <div className="mt-2 p-2 bg-red-50 rounded">
                          <p className="text-xs font-medium text-red-800">
                            通報理由: {item.report.reason}
                          </p>
                          {item.report.details && (
                            <p className="text-xs text-red-700 mt-1">
                              詳細: {item.report.details}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>投稿者: {item.prompt.createdByName}</span>
                          <span>通報日時: {new Date(item.report.createdAt).toLocaleString('ja-JP')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleShared(item.prompt._id, item.prompt.isShared || false)}
                          className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                        >
                          非公開にする
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(item.prompt._id, item.prompt.createdBy)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!reports || reports.length === 0) && (
                <div className="p-8 text-center text-gray-400">
                  <AlertTriangle size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>未処理の通報はありません</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
