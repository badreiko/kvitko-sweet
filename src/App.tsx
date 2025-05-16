import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import CustomBouquet from "./pages/CustomBouquet";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import ErrorPage from "./pages/ErrorPage";
import Product from "./components/admin/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Delivery from "./pages/Delivery";
import ProtectedRoute from "./components/ProtectedRoute";

// Административная панель
import AdminIndex from "./components/admin/AdminIndex";
import Products from "./components/admin/Products";
import ProductForm from "./components/admin/ProductForm";
import Orders from "./components/admin/Orders";
import Users from "./components/admin/Users";
import Settings from "./components/admin/Settings";
import Reports from "./components/admin/Reports";

// Создаем клиент для React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <BrowserRouter>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/:category" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/custom-bouquet" element={<CustomBouquet />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/delivery" element={<Delivery />} />
              
              {/* Защищенные маршруты (требуют авторизации) */}
              <Route 
                path="/account" 
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <div>Checkout Page (В разработке)</div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Административные маршруты */}
              <Route path="/admin" element={<AdminIndex />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/products/new" element={<ProductForm />} />
              <Route path="/admin/products/edit/:id" element={<ProductForm />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/reports" element={<Reports />} />
              
              {/* Обработка 404 */}
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}