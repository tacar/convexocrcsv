import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, firebaseSignInAnonymously, linkWithPopup } from '../lib/firebase';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface AuthContextType {
  user: User | null;
  userId: Id<'prompt_users'> | null;
  loading: boolean;
  isAnonymous: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  linkAnonymousWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<Id<'prompt_users'> | null>(null);
  const [loading, setLoading] = useState(true);

  const getOrCreateUser = useMutation(api.promptUsers.getOrCreateUser);
  const getUserByExternalId = useQuery(
    api.promptUsers.getUserByExternalId,
    user ? { externalId: user.uid } : 'skip'
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      console.log('===== AuthContext syncUser =====');
      console.log('user:', user);
      console.log('getUserByExternalId:', getUserByExternalId);

      if (user && !getUserByExternalId) {
        console.log('Creating new user in Convex...');
        const result = await getOrCreateUser({
          externalId: user.uid,
          displayName: user.displayName || 'ユーザー',
          email: user.email || '',
        });
        console.log('New userId:', result.userId);
        setUserId(result.userId);
      } else if (getUserByExternalId) {
        console.log('Existing userId:', getUserByExternalId._id);
        setUserId(getUserByExternalId._id);
      } else {
        console.log('No user or still loading...');
      }
      console.log('================================');
    };

    syncUser();
  }, [user, getUserByExternalId, getOrCreateUser]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  };

  const signInAnonymously = async () => {
    try {
      await firebaseSignInAnonymously(auth);
    } catch (error) {
      console.error('匿名ログインエラー:', error);
      throw error;
    }
  };

  const linkAnonymousWithGoogle = async () => {
    try {
      if (!user || !user.isAnonymous) {
        throw new Error('匿名ユーザーではありません');
      }

      const result = await linkWithPopup(user, googleProvider);

      // Convexのユーザー情報を更新
      if (userId) {
        await getOrCreateUser({
          externalId: result.user.uid,
          displayName: result.user.displayName || 'ユーザー',
          email: result.user.email || '',
        });
      }
    } catch (error) {
      console.error('アカウントリンクエラー:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserId(null);
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        loading,
        isAnonymous: user?.isAnonymous || false,
        signInWithGoogle,
        signInAnonymously,
        linkAnonymousWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};