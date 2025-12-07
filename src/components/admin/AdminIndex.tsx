import Dashboard from "./Dashboard";

export default function AdminIndex() {
  // Все проверки авторизации уже выполняются в ProtectedRoute в App.tsx
  return <Dashboard />;
}