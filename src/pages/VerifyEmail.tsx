// src/pages/VerifyEmail.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { auth } from "@/firebase/config";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmail() {
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResendEmail = async () => {
        if (!auth.currentUser) {
            toast.error("Uživatel není přihlášen");
            return;
        }

        setResending(true);
        try {
            await sendEmailVerification(auth.currentUser);
            setResent(true);
            toast.success("Ověřovací e-mail byl znovu odeslán");
        } catch (error: any) {
            if (error.code === "auth/too-many-requests") {
                toast.error("Příliš mnoho požadavků. Zkuste to později.");
            } else {
                toast.error("Nepodařilo se odeslat e-mail");
            }
        } finally {
            setResending(false);
        }
    };

    return (
        <Layout>
            <div className="container-custom py-12 flex items-center justify-center min-h-[70vh]">
                <div className="w-full max-w-md">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="bg-primary/10 p-4 rounded-full">
                                    <Mail className="h-12 w-12 text-primary" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold mb-2">Ověřte svůj e-mail</h1>
                            <p className="text-muted-foreground mb-6">
                                Na vaši e-mailovou adresu jsme odeslali ověřovací odkaz.
                                Klikněte na něj pro dokončení registrace.
                            </p>

                            <div className="bg-muted p-4 rounded-lg mb-6">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Tip:</strong> Zkontrolujte také složku spam nebo nevyžádaná pošta.
                                </p>
                            </div>

                            {resent ? (
                                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                                    <CheckCircle className="h-5 w-5" />
                                    <span>E-mail byl odeslán znovu</span>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={handleResendEmail}
                                    disabled={resending}
                                    className="mb-4"
                                >
                                    {resending ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Odesílání...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Odeslat e-mail znovu
                                        </>
                                    )}
                                </Button>
                            )}

                            <div className="mt-6 pt-6 border-t">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Po ověření e-mailu se můžete přihlásit
                                </p>
                                <Link to="/login">
                                    <Button className="w-full">Přejít na přihlášení</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
