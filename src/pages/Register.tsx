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
    
    // Kontrola hesel
    if (password !== confirmPassword) {
      toast.error("Hesla se neshodují");
      return;
    }
    
    // Kontrola souhlasu s podmínkami
    if (!acceptTerms) {
      toast.error("Je nutné souhlasit s obchodními podmínkami");
      return;
    }
    
    setLoading(true);
    
    try {
      await register(email, password, displayName);
      toast.success("Registrace proběhla úspěšně");
      navigate("/");
    } catch (error: any) {
      // Zpracování různých typů chyb
      let errorMessage = "Registrace se nezdařila";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Tento e-mail je již používán";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Neplatný formát e-mailu";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Příliš slabé heslo";
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
                <h1 className="text-2xl font-bold">Registrace</h1>
                <p className="text-muted-foreground mt-2">Vytvořte si účet pro přístup k rozšířeným funkcím</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Jméno</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Zadejte své jméno"
                    required
                  />
                </div>
                
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
                  <Label htmlFor="password">Heslo</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Zadejte heslo"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimálně 6 znaků
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potvrďte heslo</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Zopakujte heslo"
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
                    Souhlasím s{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      obchodními podmínkami
                    </Link>{" "}
                    a{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      zásadami ochrany osobních údajů
                    </Link>
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || !acceptTerms}
                >
                  {loading ? "Registruji..." : "Zaregistrovat se"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Už máte účet?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Přihlásit se
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