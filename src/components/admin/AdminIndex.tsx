import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "./Dashboard";

export default function AdminIndex() {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Проверка авторизации и прав администратора
  useEffect(() => {
    const checkAdmin = async () => {
      if (!loading) {
        if (!isAuthenticated) {
          // Пользователь не авторизован
          navigate("/login", { state: { from: "/admin" } });
        } else if (!user?.isAdmin) {
          // Пользователь авторизован, но не администратор
          navigate("/");
        }
      }
    };

    checkAdmin();
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Если все проверки пройдены, показываем дашборд
  return <Dashboard />;
}