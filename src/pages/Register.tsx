// src/pages/Register.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

export default function Register() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка паролей
    if (password !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }
    
    // Проверка согласия с условиями
    if (!acceptTerms) {
      toast.error("Необходимо принять условия использования");
      return;
    }
    
    setLoading(true);
    
    try {
      await register(email, password, displayName);
      toast.success("Регистрация прошла успешно");
      navigate("/");
    } catch (error: any) {
      // Обработка разных типов ошибок
      let errorMessage = "Не удалось зарегистрироваться";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Этот email уже используется";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Неверный формат электронной почты";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Слишком слабый пароль";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container-custom py-12 flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Регистрация</h1>
                <p className="text-muted-foreground mt-2">Создайте аккаунт для доступа к расширенным возможностям</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Имя</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Введите ваше имя"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Электронная почта</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите вашу почту"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Минимум 6 символов
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторите пароль"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms} 
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} 
                  />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    Я принимаю{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      условия использования
                    </Link>{" "}
                    и{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      политику конфиденциальности
                    </Link>
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || !acceptTerms}
                >
                  {loading ? "Регистрация..." : "Зарегистрироваться"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Уже есть аккаунт?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Войти
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}