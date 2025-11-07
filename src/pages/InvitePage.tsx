import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, userId, signInWithGoogle } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const hasProcessed = useRef(false);

  const acceptInvite = useMutation(api.promptCategories.acceptInvite);

  useEffect(() => {
    const handleAcceptInvite = async () => {
      if (userId && token && !processing && !hasProcessed.current) {
        hasProcessed.current = true;
        setProcessing(true);
        try {
          const categoryId = await acceptInvite({ token, userId });
          showSuccess(
            'TODOリストに参加しました',
            '新しいTODOリストにアクセスできるようになりました'
          );
          setTimeout(() => navigate(`/list/${categoryId}`), 1500);
        } catch (error) {
          const errorMessage = '無効な招待リンクです';
          setError(errorMessage);
          showError('参加に失敗しました', errorMessage);
        }
        setProcessing(false);
      }
    };

    handleAcceptInvite();
  }, [userId, token]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            招待を受け入れる
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            まずGoogleアカウントでログインしてください
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <button
              onClick={signInWithGoogle}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Googleでログイン
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-red-600 text-center mb-4">{error}</div>
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              ダッシュボードへ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center text-gray-600">
            招待を処理中...
          </div>
        </div>
      </div>
    </div>
  );
};