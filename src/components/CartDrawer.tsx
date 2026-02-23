import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, X, Minus, Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
    children: React.ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
    const { cart, removeFromCart, updateQuantity, getTotal, getItemsCount } = useCart();
    const itemsCount = getItemsCount();

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background/95 backdrop-blur-xl border-l-white/20 shadow-2xl z-[100]">
                <SheetHeader className="pb-4 border-b border-border/50">
                    <SheetTitle className="flex items-center gap-2 text-2xl font-serif">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                        Váš košík
                        <span className="ml-auto text-sm font-sans font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                            {itemsCount} {itemsCount === 1 ? 'položka' : itemsCount > 1 && itemsCount < 5 ? 'položky' : 'položek'}
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 pr-2 -mr-2 scrollbar-thin">
                    <AnimatePresence mode="popLayout">
                        {cart.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center h-full text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-2">
                                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-medium">Košík je prázdný</h3>
                                <p className="text-muted-foreground max-w-[200px]">
                                    Vyberte si nádherné květiny z našeho katalogu
                                </p>
                                <SheetTrigger asChild>
                                    <Button asChild variant="outline" className="mt-4 rounded-full">
                                        <Link to="/catalog">Prozkoumat katalog</Link>
                                    </Button>
                                </SheetTrigger>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {cart.map((item) => (
                                    <motion.div
                                        layout
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        className="flex gap-4 group relative"
                                    >
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-border/50 shadow-sm relative">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        <div className="flex flex-col flex-1 justify-between py-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-medium leading-tight line-clamp-2">{item.name}</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="h-6 w-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 -mt-1 -mr-1"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <p className="font-semibold">{item.price} Kč</p>

                                                <div className="flex items-center h-8 bg-secondary/30 rounded-full border border-border/50">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        className="h-full w-8 rounded-l-full hover:bg-secondary/50"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="h-full w-8 rounded-r-full hover:bg-secondary/50"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {cart.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-6 border-t border-border/50 mt-auto"
                    >
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{getTotal()} Kč</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Doprava</span>
                                <span>Vypočteno v pokladně</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-xl font-serif font-bold">
                                <span>Celkem</span>
                                <span>{getTotal()} Kč</span>
                            </div>
                        </div>

                        <SheetTrigger asChild>
                            <Button asChild className="w-full h-14 rounded-full text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                                <Link to="/checkout" className="flex items-center justify-center gap-2">
                                    K pokladně <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                        </SheetTrigger>
                    </motion.div>
                )}
            </SheetContent>
        </Sheet>
    );
}
