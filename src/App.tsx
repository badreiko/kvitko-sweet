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
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Catalog from "@/pages/Catalog";
import CustomBouquet from "./pages/CustomBouquet";
import BlogPage from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import ErrorPage from "./pages/ErrorPage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
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
import SlugMigration from "@/components/admin/SlugMigration";
import Categories from "./components/admin/Categories";
import Flowers from "./components/admin/Flowers";
import BouquetFlowers from "./components/admin/BouquetFlowers";
import Blog from "./components/admin/Blog";
import BlogPosts from "./components/admin/BlogPosts";
import BlogTags from "./components/admin/BlogTags";
import BlogComments from "./components/admin/BlogComments";
import BlogAnalytics from "./components/admin/BlogAnalytics";
import Testimonials from "./components/admin/Testimonials";
import DeliverySettings from "./components/admin/DeliverySettings";
import Stores from "./components/admin/Stores";

// Создаем клиент для React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      retry: 1,
    },
  },
});

const router = (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
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
      <Route path="/delivery" element={<Delivery />} />
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
  </BrowserRouter>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}