import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.tsx';
import { StorefrontLayout } from './components/StorefrontLayout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { PromotionsPage } from './pages/PromotionsPage.tsx';
import { ArticlesPage } from './pages/ArticlesPage.tsx';
import { ArticleDetailPage } from './pages/ArticleDetailPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.tsx';
import { AdminLayout } from './pages/admin/AdminLayout.tsx';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage.tsx';
import { AdminProductsPage } from './pages/admin/AdminProductsPage.tsx';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.tsx';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.tsx';
import { AdminArticlesPage } from './pages/admin/AdminArticlesPage.tsx';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage.tsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.tsx';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Customer Storefront */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:slug" element={<ArticleDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>

          {/* Admin Auth & Dashboard */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="articles" element={<AdminArticlesPage />} />
            <Route path="testimonials" element={<AdminTestimonialsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
