// src/components/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Пока проверяем аутентификацию, показываем загрузку
  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mb-4"></div>
            <p className="text-lg">Проверка авторизации...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Если не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверка прав администратора
  if (adminOnly && !user?.isAdmin) {
    return (
      <Layout>
        <div className="container-custom py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
          <p className="text-muted-foreground mb-6">
            У вас нет прав для доступа к этой странице.
          </p>
          <Button asChild>
            <Link to="/">Вернуться на главную</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Если все проверки пройдены, рендерим содержимое
  return <>{children}</>;
}