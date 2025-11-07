import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ListPage } from './pages/ListPage';
import { SharedListPage } from './pages/SharedListPage';
import { InvitePage } from './pages/InvitePage';
import { AdminPage } from './pages/AdminPage';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const PrivateRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/invite/:token",
    element: <InvitePage />
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: "list/:listId",
        element: <ListPage />
      },
      {
        path: "shared",
        element: <SharedListPage />
      },
      {
        path: "admin",
        element: <AdminPage />
      }
    ]
  }
]);

function App() {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>
    </ConvexProvider>
  );
}

export default App;