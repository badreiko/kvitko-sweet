import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "./Dashboard";

import { useState } from "react";

export default function AdminIndex() {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Проверка авторизации и прав администратора
  const [pupdVerified, setPupdVerified] = useState(false);
  const [pupdInput, setPupdInput] = useState("");
  const [pupdError, setPupdError] = useState("");
  const PUPD_CODE = "2024admin"; // Можно вынести в env или в firebase

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

  // Обработчик подтверждения пупд
  const handlePupdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pupdInput === PUPD_CODE) {
      setPupdVerified(true);
      setPupdError("");
    } else {
      setPupdError("Неверный дополнительный код доступа");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Если не пройдена дополнительная авторизация — показываем форму
  if (!pupdVerified) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-muted">
        <form onSubmit={handlePupdSubmit} className="bg-white p-8 rounded shadow-md w-80">
          <h2 className="text-xl font-bold mb-4">Дополнительная авторизация</h2>
          <input
            type="password"
            placeholder="Введите дополнительный код"
            value={pupdInput}
            onChange={e => setPupdInput(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-primary"
            autoFocus
          />
          {pupdError && <div className="text-red-500 text-sm mb-2">{pupdError}</div>}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition"
          >
            Войти
          </button>
        </form>
      </div>
    );
  }

  // Если все проверки пройдены, показываем дашборд
  return <Dashboard />;
}