import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: ""
      });
    }, 1500);
  };
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-muted py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Kontaktujte nás</h1>
          <p className="text-muted-foreground max-w-2xl">
            Máte dotaz nebo chcete objednat květiny? Neváhejte nás kontaktovat.
          </p>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Napište nám</h2>
                  
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Check className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Zpráva byla odeslána</h3>
                      <p className="text-muted-foreground mb-6">
                        Děkujeme za vaši zprávu. Budeme vás kontaktovat co nejdříve.
                      </p>
                      <Button onClick={() => setIsSubmitted(false)}>
                        Odeslat další zprávu
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Jméno a příjmení</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Předmět zprávy</Label>
                        <RadioGroup 
                          value={formData.subject} 
                          onValueChange={handleRadioChange}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="general" id="general" />
                            <Label htmlFor="general">Obecný dotaz</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="order" id="order" />
                            <Label htmlFor="order">Objednávka</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom">Vlastní kytice</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Jiné</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Zpráva</Label>
                        <Textarea 
                          id="message" 
                          name="message" 
                          rows={5} 
                          value={formData.message} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Odesílání...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Odeslat zprávu
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Kontaktní informace</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Adresa</h3>
                          <p className="text-muted-foreground">Květinová 123</p>
                          <p className="text-muted-foreground">110 00 Praha 1</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Telefon</h3>
                          <p className="text-muted-foreground">
                            <a href="tel:+420123456789" className="hover:text-primary transition-colors">
                              +420 123 456 789
                            </a>
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">E-mail</h3>
                          <p className="text-muted-foreground">
                            <a href="mailto:info@kvitkos.cz" className="hover:text-primary transition-colors">
                              info@kvitkos.cz
                            </a>
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Otevírací doba</h3>
                          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                            <span>Pondělí - Pátek:</span>
                            <span>9:00 - 19:00</span>
                            <span>Sobota:</span>
                            <span>9:00 - 17:00</span>
                            <span>Neděle:</span>
                            <span>10:00 - 15:00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Map */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Kde nás najdete</h2>
                <Card className="overflow-hidden">
                  <div className="aspect-video w-full">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.9058953816!2d14.4194153!3d50.0874654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b94e9e08e3b33%3A0x7acff08b90e9352!2sWenceslas%20Square!5e0!3m2!1sen!2scz!4v1651234567890!5m2!1sen!2scz" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mapa"
                    ></iframe>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-12 bg-muted">
        <div className="container-custom">
          <h2 className="text-2xl font-semibold text-center mb-10">Často kladené otázky</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Jak dlouho dopředu je třeba objednat květiny?</h3>
                <p className="text-muted-foreground">
                  Pro běžné objednávky doporučujeme objednat alespoň 24 hodin předem. 
                  Pro větší události, jako jsou svatby, doporučujeme objednat několik týdnů až měsíců dopředu.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Jaké jsou možnosti doručení?</h3>
                <p className="text-muted-foreground">
                  Nabízíme doručení po celé Praze a okolí. Můžete si také vyzvednout objednávku osobně v naší prodejně.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Mohu si objednat květiny na konkrétní čas?</h3>
                <p className="text-muted-foreground">
                  Ano, nabízíme doručení v konkrétním časovém rozmezí za příplatek. 
                  Kontaktujte nás pro více informací.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Jak dlouho vydrží vaše květiny?</h3>
                <p className="text-muted-foreground">
                  Naše květiny jsou vždy čerstvé a při správné péči vydrží 7-14 dní. 
                  Ke každé kytici přikládáme návod na péči.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}