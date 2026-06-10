import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';

// 前台页面懒加载
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
// 独立栏目页面（有专属模板）
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CasesPage = lazy(() => import('./pages/CasesPage'));
const CaseDetailPage = lazy(() => import('./pages/CaseDetailPage'));
const TechnologyPage = lazy(() => import('./pages/TechnologyPage'));
const CooperationPage = lazy(() => import('./pages/CooperationPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NewsListPage = lazy(() => import('./pages/NewsListPage'));
const CoreAdvantagesPage = lazy(() => import('./pages/CoreAdvantagesPage'));

// 后台页面懒加载
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCases = lazy(() => import('./pages/admin/AdminCases'));
const AdminTeam = lazy(() => import('./pages/admin/AdminTeam'));
const AdminCertificates = lazy(() => import('./pages/admin/AdminCertificates'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminNavCategories = lazy(() => import('./pages/admin/AdminNavCategories'));
const AdminArticles = lazy(() => import('./pages/admin/AdminArticles'));
const AdminNews = lazy(() => import('./pages/admin/AdminNews'));
const AdminHeroSlides = lazy(() => import('./pages/admin/AdminHeroSlides'));

const Loading = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <CircularProgress color="primary" />
  </Box>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* 前台路由 - 使用 Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              {/* 有专属模板的独立栏目页面 */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cases" element={<CasesPage />} />
              <Route path="/cases/:id" element={<CaseDetailPage />} />
              <Route path="/technology" element={<TechnologyPage />} />
              <Route path="/cooperation" element={<CooperationPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/news" element={<NewsListPage />} />
              <Route path="/core-advantages" element={<CoreAdvantagesPage />} />
              {/* 通用动态栏目路由 - 所有分类页面统一由此匹配，useParams 可获取 :slug */}
              <Route path="/:slug" element={<CategoryPage />} />
              <Route path="/:slug/:subSlug" element={<CategoryPage />} />
              <Route path="/:slug/:subSlug/:id" element={<ArticleDetailPage />} />
            </Route>

            {/* 后台路由 */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="nav-categories" element={<AdminNavCategories />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="cases" element={<AdminCases />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="certificates" element={<AdminCertificates />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="hero-slides" element={<AdminHeroSlides />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;
