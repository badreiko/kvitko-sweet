// src/pages/Cart.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartContext } from '@/hooks/use-cart';
import Layout from "@/components/layout/Layout";
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCartContext();
  
  if (cart.length === 0) {
    return (
      <Layout>
        <div className="container-custom py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Váš košík je prázdný</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Vypadá to, že jste si zatím nic nevybrali. Prozkoumejte náš katalog a objevte krásné květiny.
          </p>
          <Button asChild>
            <Link to="/catalog">
              Prozkoumat katalog
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8">Nákupní košík</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b border-border pb-6">
                  <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-muted-foreground">{item.price} Kč</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="min-w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  
                  <div className="text-right min-w-24">
                    <p className="font-semibold">{item.price * item.quantity} Kč</p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Odstranit položku"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={clearCart}>
                Vyprázdnit košík
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/catalog">
                  Pokračovat v nákupu
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Souhrn objednávky</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{getTotal()} Kč</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doprava:</span>
                  <span>Vypočteno v dalším kroku</span>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Celkem:</span>
                  <span>{getTotal()} Kč</span>
                </div>
              </div>
              
              <Button className="w-full mt-6" asChild>
                <Link to="/checkout">
                  Pokračovat k pokladně
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
