import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { BlogProvider } from "./context/BlogContext";
import SmoothScroll from "./components/SmoothScroll";
import ErrorBoundary from "./components/ErrorBoundary";
import { StickyMobileCTA } from "./components/StickyMobileCTA";
import Home from "./pages/Home";
import Catalog from "@/pages/Catalog";
import BlogPage from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import ErrorPage from "./pages/ErrorPage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import Delivery from "./pages/Delivery";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import ProtectedRoute from "./components/ProtectedRoute";

// Тяжёлые публичные страницы — lazy.
const CustomBouquet = lazy(() => import("./pages/CustomBouquet"));
const Account = lazy(() => import("./pages/Account"));
const Checkout = lazy(() => import("./pages/Checkout"));

// Вся админка — отдельным чанком, не попадает в bundle публики.
const AdminIndex = lazy(() => import("./components/admin/AdminIndex"));
const Products = lazy(() => import("./components/admin/Products"));
const ProductForm = lazy(() => import("./components/admin/ProductForm"));
const Orders = lazy(() => import("./components/admin/Orders"));
const Users = lazy(() => import("./components/admin/Users"));
const Settings = lazy(() => import("./components/admin/Settings"));
const Reports = lazy(() => import("./components/admin/Reports"));
const SlugMigration = lazy(() => import("@/components/admin/SlugMigration"));
const Categories = lazy(() => import("./components/admin/Categories"));
const Flowers = lazy(() => import("./components/admin/Flowers"));
const BouquetFlowers = lazy(() => import("./components/admin/BouquetFlowers"));
const Blog = lazy(() => import("./components/admin/Blog"));
const BlogPosts = lazy(() => import("./components/admin/BlogPosts"));
const BlogTags = lazy(() => import("./components/admin/BlogTags"));
const BlogComments = lazy(() => import("./components/admin/BlogComments"));
const BlogAnalytics = lazy(() => import("./components/admin/BlogAnalytics"));
const Testimonials = lazy(() => import("./components/admin/Testimonials"));
const DeliverySettings = lazy(() => import("./components/admin/DeliverySettings"));
const Stores = lazy(() => import("./components/admin/Stores"));

// Создаем клиент для React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      retry: 1,
    },
  },
});

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

const router = (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:category" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/custom-bouquet" element={<CustomBouquet />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminIndex /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute adminOnly><Products /></ProtectedRoute>} />
        <Route path="/admin/products/new" element={<ProtectedRoute adminOnly><ProductForm /></ProtectedRoute>} />
        <Route path="/admin/products/edit/:id" element={<ProtectedRoute adminOnly><ProductForm /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
        <Route path="/admin/flowers" element={<ProtectedRoute adminOnly><Flowers /></ProtectedRoute>} />
        <Route path="/admin/bouquet-flowers" element={<ProtectedRoute adminOnly><BouquetFlowers /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute adminOnly><Orders /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
        <Route path="/admin/blog" element={<ProtectedRoute adminOnly><Blog /></ProtectedRoute>} />
        <Route path="/admin/blog/posts" element={<ProtectedRoute adminOnly><BlogPosts /></ProtectedRoute>} />
        <Route path="/admin/blog/tags" element={<ProtectedRoute adminOnly><BlogTags /></ProtectedRoute>} />
        <Route path="/admin/blog/comments" element={<ProtectedRoute adminOnly><BlogComments /></ProtectedRoute>} />
        <Route path="/admin/blog/analytics" element={<ProtectedRoute adminOnly><BlogAnalytics /></ProtectedRoute>} />
        <Route path="/admin/testimonials" element={<ProtectedRoute adminOnly><Testimonials /></ProtectedRoute>} />
        <Route path="/admin/delivery-settings" element={<ProtectedRoute adminOnly><DeliverySettings /></ProtectedRoute>} />
        <Route path="/admin/stores" element={<ProtectedRoute adminOnly><Stores /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
        <Route path="/admin/migrate" element={<ProtectedRoute adminOnly><SlugMigration /></ProtectedRoute>} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
    {/* StickyMobileCTA использует useLocation → должен быть внутри
        BrowserRouter. Раньше стоял снаружи в App, что рушило рендер. */}
    <StickyMobileCTA />
  </BrowserRouter>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll>
        <AuthProvider>
          <CartProvider>
            <BlogProvider>
              <ErrorBoundary>
                <Toaster position="top-right" />
                {router}
              </ErrorBoundary>
            </BlogProvider>
          </CartProvider>
        </AuthProvider>
      </SmoothScroll>
    </QueryClientProvider>
  );
}
