// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Získání URL pro přesměrování po přihlášení
  const from = location.state?.from?.pathname || "/";
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success("Přihlášení úspěšné");
      navigate(from, { replace: true });
    } catch (error: any) {
      // Zpracování různých typů chyb
      let errorMessage = "Přihlášení se nezdařilo";
      
      if (error.code === "auth/invalid-email") {
        errorMessage = "Neplatný formát e-mailu";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Nesprávný e-mail nebo heslo";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Příliš mnoho pokusů o přihlášení. Zkuste to prosím později";
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
                <h1 className="text-2xl font-bold">Přihlášení</h1>
                <p className="text-muted-foreground mt-2">Přihlaste se pro přístup ke svému účtu</p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 mb-4"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await loginWithGoogle();
                    toast.success("Přihlášení přes Google úspěšné");
                    navigate(from, { replace: true });
                  } catch (error: any) {
                    toast.error("Google přihlášení se nezdařilo");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <FcGoogle size={22} />
                Přihlásit se přes Google
              </Button>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Zadejte svůj e-mail"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Heslo</Label>
                    <Link to="/reset-password" className="text-sm text-primary hover:underline">
                      Zapomenuté heslo?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Zadejte své heslo"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Přihlašuji..." : "Přihlásit se"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Nemáte ještě účet?{" "}
                  <Link to="/register" className="text-primary hover:underline">
                    Zaregistrujte se
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