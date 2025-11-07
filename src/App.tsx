import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { OCRAuthProvider, useOCRAuth } from './contexts/OCRAuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LoginPage } from './pages/LoginPage';
import { OCRDashboardPage } from './pages/OCRDashboardPage';
import { OCRCategoryPage } from './pages/OCRCategoryPage';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const OCRPrivateRoute: React.FC = () => {
  const { user, loading } = useOCRAuth();

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
    path: "/",
    element: <OCRPrivateRoute />,
    children: [
      {
        index: true,
        element: <OCRDashboardPage />
      },
      {
        path: "category/:categoryId",
        element: <OCRCategoryPage />
      }
    ]
  }
]);

function App() {
  return (
    <ConvexProvider client={convex}>
      <OCRAuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </OCRAuthProvider>
    </ConvexProvider>
  );
}

export default App;