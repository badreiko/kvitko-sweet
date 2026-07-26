// src/pages/ResetPassword.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("Odkaz pro obnovení hesla byl odeslán na váš e-mail");
    } catch (error: any) {
      let errorMessage = "Nepodařilo se odeslat e-mail pro obnovení hesla";
      if (error.code === "auth/invalid-email") {
        errorMessage = "Neplatný formát e-mailu";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Uživatel s tímto e-mailem nebyl nalezen";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Příliš mnoho pokusů. Zkuste to prosím později";
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-custom py-16 max-w-md mx-auto">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-serif font-bold mb-2">Obnovení hesla</h1>
            <p className="text-muted-foreground mb-6">
              Zadejte svůj e-mail a my vám pošleme odkaz pro obnovení hesla.
            </p>

            {sent ? (
              <div className="space-y-4">
                <p className="text-sm">
                  Pokud účet s e-mailem <strong>{email}</strong> existuje, brzy
                  obdržíte zprávu s odkazem pro obnovení hesla. Zkontrolujte
                  i složku spam.
                </p>
                <Button asChild className="w-full">
                  <Link to="/login">Zpět na přihlášení</Link>
                </Button>
              </div>
            ) : (
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Odesílám..." : "Odeslat odkaz"}
                </Button>
                <div className="text-center text-sm">
                  <Link to="/login" className="text-primary hover:underline">
                    Zpět na přihlášení
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
