import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Container, Box, IconButton, Button,
  useMediaQuery, useTheme, Divider, Fade,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import InquiryDialog from './InquiryDialog';
import MobileDrawer from './MobileDrawer';
import ScrollToTop from './ScrollToTop';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';
import { useI18n } from '../contexts/I18nContext';
import { navCategoryApi } from '../api/navigation';
import { getSettings } from '../api/settings';
import type { NavCategory } from '../api/navigation';

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { setLang, t, isZh } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const [hoveredNav, setHoveredNav] = useState<number | null>(null);
  const [footerSettings, setFooterSettings] = useState<Record<string, string>>({});

  // 静态 fallback 导航 — API 不可用时使用，与本地数据库 nav_categories / nav_subcategories 严格一致
  const fallbackNavCategories: NavCategory[] = [
    { id: 1, name: '首页', name_en: 'Home', slug: 'home', icon: null, banner_image: null, sort_order: 1, status: 1, created_at: '', updated_at: '', subcategories: [] },
    { id: 2, name: '关于我们', name_en: 'About Us', slug: 'about', icon: null, banner_image: null, sort_order: 2, status: 1, created_at: '', updated_at: '', subcategories: [
      { id: 7, parent_id: 2, name: '公司简介', name_en: 'Company Profile', slug: 'company-profile', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'single', sort_order: 1, status: 1, created_at: '', updated_at: '' },
      { id: 8, parent_id: 2, name: '股东与背景', name_en: 'Shareholders', slug: 'shareholders-background', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'single', sort_order: 2, status: 1, created_at: '', updated_at: '' },
      { id: 9, parent_id: 2, name: '科学家+工程师团队', name_en: 'Team', slug: 'scientist-engineer-team', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'single', sort_order: 3, status: 1, created_at: '', updated_at: '' },
      { id: 10, parent_id: 2, name: '资质荣誉', name_en: 'Honors', slug: 'qualifications-honors', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'list', sort_order: 4, status: 1, created_at: '', updated_at: '' },
    ] },
    { id: 3, name: '新闻动态', name_en: 'News', slug: 'news', icon: null, banner_image: null, sort_order: 3, status: 1, created_at: '', updated_at: '', subcategories: [
      { id: 11, parent_id: 3, name: '公司新闻', name_en: 'Company News', slug: 'company-news', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'list', sort_order: 1, status: 1, created_at: '', updated_at: '' },
      { id: 12, parent_id: 3, name: '行业资讯', name_en: 'Industry News', slug: 'industry-news', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
      { id: 13, parent_id: 3, name: '技术文章', name_en: 'Tech Articles', slug: 'technical-articles', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'list', sort_order: 3, status: 1, created_at: '', updated_at: '' },
    ] },
    { id: 4, name: '产品系列', name_en: 'Products', slug: 'products', icon: null, banner_image: null, sort_order: 4, status: 1, created_at: '', updated_at: '', subcategories: [
      { id: 14, parent_id: 4, name: '土壤水蚀监测系列', name_en: 'Soil Water Erosion', slug: 'soil-water-erosion-series', description: null, description_en: null, icon: null, content_type: 'product', display_mode: 'list', sort_order: 1, status: 1, created_at: '', updated_at: '' },
      { id: 15, parent_id: 4, name: '风蚀监测系列', name_en: 'Wind Erosion', slug: 'wind-erosion-series', description: null, description_en: null, icon: null, content_type: 'product', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
      { id: 16, parent_id: 4, name: '生态气象监测系列', name_en: 'Eco Meteorology', slug: 'eco-meteorology-series', description: null, description_en: null, icon: null, content_type: 'product', display_mode: 'list', sort_order: 3, status: 1, created_at: '', updated_at: '' },
      { id: 17, parent_id: 4, name: '水力侵蚀监测系列', name_en: 'Hydraulic Erosion', slug: 'hydraulic-erosion-series', description: null, description_en: null, icon: null, content_type: 'product', display_mode: 'list', sort_order: 4, status: 1, created_at: '', updated_at: '' },
      { id: 18, parent_id: 4, name: '智慧水保云平台', name_en: 'Smart Platform', slug: 'smart-cloud-platform', description: null, description_en: null, icon: null, content_type: 'product', display_mode: 'list', sort_order: 5, status: 1, created_at: '', updated_at: '' },
      { id: 19, parent_id: 4, name: '盐碱地监测系列', name_en: 'Saline-alkali', slug: 'saline-alkali-series', description: null, description_en: null, icon: null, content_type: 'product', display_mode: 'list', sort_order: 6, status: 1, created_at: '', updated_at: '' },
    ] },
    { id: 8, name: '核心优势', name_en: 'Core Advantages', slug: 'core-advantages', icon: null, banner_image: null, sort_order: 5, status: 1, created_at: '', updated_at: '', subcategories: [] },
    { id: 5, name: '成果转化', name_en: 'Achievements', slug: 'achievements', icon: null, banner_image: null, sort_order: 6, status: 1, created_at: '', updated_at: '', subcategories: [
      { id: 20, parent_id: 5, name: '合作单位', name_en: 'Partners', slug: 'partner-institutions', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'single', sort_order: 1, status: 1, created_at: '', updated_at: '' },
      { id: 21, parent_id: 5, name: '总体应用情况', name_en: 'Overview', slug: 'overall-application', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'single', sort_order: 2, status: 1, created_at: '', updated_at: '' },
      { id: 22, parent_id: 5, name: '典型案例', name_en: 'Typical Cases', slug: 'typical-cases', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'list', sort_order: 3, status: 1, created_at: '', updated_at: '' },
      { id: 23, parent_id: 5, name: '未来发展', name_en: 'Future', slug: 'future-development', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'single', sort_order: 4, status: 1, created_at: '', updated_at: '' },
    ] },
    { id: 6, name: '合作加盟', name_en: 'Cooperation', slug: 'cooperation', icon: null, banner_image: null, sort_order: 7, status: 1, created_at: '', updated_at: '', subcategories: [
      { id: 24, parent_id: 6, name: '合伙人制度', name_en: 'Partnership', slug: 'partnership-system', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'single', sort_order: 1, status: 1, created_at: '', updated_at: '' },
      { id: 25, parent_id: 6, name: '招募对象与优势', name_en: 'Recruitment', slug: 'recruitment-advantages', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'single', sort_order: 2, status: 1, created_at: '', updated_at: '' },
      { id: 26, parent_id: 6, name: '在线申请', name_en: 'Apply', slug: 'online-application', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'form', sort_order: 3, status: 1, created_at: '', updated_at: '' },
    ] },
    { id: 7, name: '联系我们', name_en: 'Contact', slug: 'contact', icon: null, banner_image: null, sort_order: 8, status: 1, created_at: '', updated_at: '', subcategories: [
      { id: 27, parent_id: 7, name: '联系方式', name_en: 'Contact Info', slug: 'contact-info', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'single', sort_order: 1, status: 1, created_at: '', updated_at: '' },
    ] },
  ];

  useEffect(() => {
    loadNav();
    loadSettings();
  }, []);

  const loadNav = async () => {
    try {
      const res = await navCategoryApi.getAll();
      const cats: NavCategory[] = res.data?.data || [];
      if (cats.length > 0) {
        // 加载每个一级栏目的二级栏目
        const withSubs = await Promise.all(
          cats.map(async (cat) => {
            try {
              const subRes = await navCategoryApi.getSubcategories(cat.id);
              return { ...cat, subcategories: subRes.data?.data || [] };
            } catch { return { ...cat, subcategories: [] }; }
          })
        );
        setNavCategories(withSubs);
      } else {
        setNavCategories(fallbackNavCategories);
      }
    } catch (err) {
      console.error('Failed to load nav, using fallback:', err);
      setNavCategories(fallbackNavCategories);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await getSettings();
      if (res.data?.data) {
        setFooterSettings(res.data.data);
      }
    } catch {
      // API 失败时使用 fallback
    }
  };

  const scrollY = useScrollPosition();
  const isHomePage = location.pathname === '/';
  const isScrolled = scrollY > MOTION.SCROLL_THRESHOLD;
  const isHeroTransparent = isHomePage && !isScrolled;
  const appBarBg = isHeroTransparent ? 'rgba(8,27,48,0.75)' : V2_COLORS.primary.dark;
  const appBarShadow = isHeroTransparent ? 0 : 4;
  const appBarBorder = isHeroTransparent ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.2)';
  const appBarBlur = isHeroTransparent ? 'blur(20px)' : 'none';

  const isActive = (slug: string) => {
    if (slug === 'home') return location.pathname === '/';
    return location.pathname.startsWith(`/${slug}`);
  };

  const getName = (cat: NavCategory) => isZh ? cat.name : (cat.name_en || cat.name);

  const getCatPath = (slug: string) => `/${slug}`;

  const handleNavClick = (cat: NavCategory) => {
    if (cat.slug === 'home') {
      navigate('/');
    } else {
      navigate(getCatPath(cat.slug));
    }
    setHoveredNav(null);
  };

  const handleSubClick = (cat: NavCategory, sub: any) => {
    // 新闻子栏目 → NewsListPage 带 Tab 参数
    if (cat.slug === 'news') {
      const tabIndex = ((cat as any).subcategories || []).findIndex((s: any) => s.id === sub.id) + 1;
      navigate(`/news?tab=${tabIndex}`);
    } else if (cat.slug === 'products') {
      // 产品子栏目 → ProductsPage 带分类过滤
      navigate(`/products?category=${sub.slug}`);
    } else {
      navigate(`${getCatPath(cat.slug)}/${sub.slug}`);
    }
    setHoveredNav(null);
  };

  // 移动端导航项目（含二级栏目）
  const mobileNavItems = navCategories.map(cat => ({
    label: getName(cat),
    path: cat.slug === 'home' ? '/' : getCatPath(cat.slug),
    children: (cat as any).subcategories?.map((sub: any) => ({
      label: isZh ? sub.name : (sub.name_en || sub.name),
      path: `${getCatPath(cat.slug)}/${sub.slug}`,
    })) || [],
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="fixed" elevation={appBarShadow} sx={{
        bgcolor: appBarBg, borderBottom: appBarBorder,
        backdropFilter: appBarBlur, WebkitBackdropFilter: appBarBlur,
        transition: MOTION.NAV_TRANSITION,
        borderRadius: 0,
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: 3 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="三智科技"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                sx={{
                  height: 42,
                  width: 'auto',
                  display: 'block',
                  flexShrink: 0,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
                }}
              />
            </Box>

            {/* PC Navigation with Dropdown */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'nowrap', overflow: 'visible', flexGrow: 1 }}>
                {navCategories.map((cat) => (
                  <Box
                    key={cat.id}
                    onMouseEnter={() => setHoveredNav(cat.id)}
                    onMouseLeave={() => setHoveredNav(null)}
                    sx={{ position: 'relative' }}
                  >
                    <Button
                      onClick={() => handleNavClick(cat)}
                      sx={{
                        color: isActive(cat.slug) ? V2_COLORS.accent.light : 'rgba(255,255,255,0.85)',
                        fontWeight: isActive(cat.slug) ? 600 : 500,
                        fontSize: '0.95rem', px: 1.5, py: 0.5, minWidth: 'auto',
                        borderRadius: 1.5, position: 'relative', transition: 'all 0.3s ease',
                        letterSpacing: 0.8,
                        whiteSpace: 'nowrap',
                        '&::after': isActive(cat.slug) ? {
                          content: '""', position: 'absolute', bottom: 2, left: '50%',
                          transform: 'translateX(-50%)', width: '50%', height: 2,
                          bgcolor: V2_COLORS.accent.main, borderRadius: 1,
                          boxShadow: `0 0 8px ${V2_COLORS.accent.main}40`,
                        } : {},
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: '#fff' },
                      }}
                    >
                      {getName(cat)}
                    </Button>
                    {/* Dropdown for subcategories */}
                    {cat.slug !== 'home' && cat.subcategories && cat.subcategories.length > 0 && hoveredNav === cat.id && (
                      <Fade in={hoveredNav === cat.id}>
                        <Box sx={{
                          position: 'absolute', top: '100%', left: 0, zIndex: 1300,
                          minWidth: 200, py: 1, borderRadius: 2,
                          bgcolor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                          border: '1px solid rgba(0,0,0,0.06)',
                          '&::before': {
                            content: '""', position: 'absolute', top: -6, left: 20,
                            width: 12, height: 12, bgcolor: '#fff',
                            transform: 'rotate(45deg)', borderLeft: '1px solid rgba(0,0,0,0.06)',
                            borderTop: '1px solid rgba(0,0,0,0.06)',
                          },
                        }}>
                          {cat.subcategories.map((sub) => (
                            <Typography
                              key={sub.id}
                              component="div"
                              onClick={() => handleSubClick(cat, sub)}
                              sx={{
                                px: 2.5, py: 1, fontSize: '0.875rem', cursor: 'pointer',
                                color: '#333', transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'rgba(15,43,71,0.06)', color: V2_COLORS.primary.dark },
                              }}
                            >
                              {isZh ? sub.name : (sub.name_en || sub.name)}
                            </Typography>
                          ))}
                        </Box>
                      </Fade>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* 右侧操作区 */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <Button
                  onClick={() => setLang(isZh ? 'en' : 'zh')}
                  startIcon={<LanguageIcon sx={{ fontSize: '1rem !important' }} />}
                  sx={{
                    color: 'rgba(255,255,255,0.75)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    letterSpacing: 1,
                    textTransform: 'none',
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.18)',
                    minWidth: 0,
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#fff',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.4)',
                    },
                  }}
                >
                  {isZh ? 'EN' : '中文'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setInquiryOpen(true)}
                  startIcon={<PhoneIcon />}
                  sx={{
                    bgcolor: V2_COLORS.accent.main, color: '#fff', fontWeight: 600,
                    borderRadius: 2, px: 3, boxShadow: '0 2px 12px rgba(212,134,42,0.3)',
                    '&:hover': { bgcolor: V2_COLORS.accent.dark, boxShadow: '0 4px 20px rgba(212,134,42,0.4)' },
                  }}
                >
                  {t('立即咨询', 'Contact Us')}
                </Button>
              </Box>
            )}

            {/* Mobile Menu */}
            {isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  onClick={() => setLang(isZh ? 'en' : 'zh')}
                  startIcon={<LanguageIcon sx={{ fontSize: '0.95rem !important' }} />}
                  sx={{
                    color: 'rgba(255,255,255,0.75)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: 1,
                    textTransform: 'none',
                    px: 1.2,
                    py: 0.5,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.18)',
                    minWidth: 0,
                    '&:hover': {
                      color: '#fff',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {isZh ? 'EN' : '中文'}
                </Button>
                <Button variant="contained" size="small" onClick={() => setInquiryOpen(true)}
                  sx={{ bgcolor: V2_COLORS.accent.main, color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>
                  {t('咨询', 'Ask')}
                </Button>
                <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                  <MenuIcon />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} items={mobileNavItems} />

      <Box component="main" sx={{ flex: 1, pt: `${64}px` }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{
        background: `linear-gradient(180deg, ${V2_COLORS.primary.dark} 0%, #040F1A 100%)`,
        color: '#fff', pt: 8, pb: 2, position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, ${V2_COLORS.accent.main}, ${V2_COLORS.secondary.light}, ${V2_COLORS.success.main}, ${V2_COLORS.accent.main})`,
        },
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }, gap: 4, mb: 5 }}>
            <Box>
              <Typography variant="h6" sx={{
                fontWeight: 700, mb: 2, letterSpacing: 2,
                background: 'linear-gradient(90deg, #fff, #4a90d9)', WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', fontSize: '1.2rem',
              }}>
                {t('杨凌三智科技', 'YANGLING SANZHI TECH')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 2, mb: 2 }}>
                {t(
                  '专注水土保持智能监测领域，提供从传感器到云平台的全链条解决方案。以科技创新守护绿水青山，助力生态文明建设。',
                  'Focused on intelligent soil & water conservation monitoring, providing full-chain solutions from sensors to cloud platforms.'
                )}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[t('水土保持', 'Soil Conservation'), t('智能监测', 'Smart Monitoring'), t('生态修复', 'Eco Restoration')].map((tag) => (
                  <Box key={tag} sx={{
                    px: 1.5, py: 0.3, borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)',
                  }}>
                    {tag}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* 快捷导航 - 从API动态 */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                {t('快捷导航', 'Quick Links')}
              </Typography>
              {navCategories.filter(c => c.slug !== 'home').map((cat) => (
                <Typography key={cat.id} component={Link} to={getCatPath(cat.slug)} sx={{
                  display: 'block', color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                  py: 0.4, fontSize: '0.875rem', transition: 'color 0.2s',
                  '&:hover': { color: V2_COLORS.secondary.light },
                }}>
                  {getName(cat)}
                </Typography>
              ))}
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                {t('产品服务', 'Products')}
              </Typography>
              {[
                { label: t('径流泥沙监测', 'Runoff Monitoring'), to: '/products?category=soil-water-erosion-series' },
                { label: t('全自动气象站', 'Weather Station'), to: '/products?category=eco-meteorology-series' },
                { label: t('风蚀监测', 'Wind Erosion'), to: '/products?category=wind-erosion-series' },
                { label: t('盐碱地治理', 'Saline-alkali'), to: '/products?category=saline-alkali-series' },
                { label: t('智慧水保云平台', 'Smart Platform'), to: '/products?category=smart-cloud-platform' },
              ].map(({ label, to }) => (
                <Typography key={label} component={Link} to={to} sx={{
                  display: 'block', color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                  py: 0.4, fontSize: '0.875rem', transition: 'color 0.2s',
                  '&:hover': { color: V2_COLORS.secondary.light },
                }}>
                  {label}
                </Typography>
              ))}
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                {t('联系我们', 'Contact')}
              </Typography>
              {[
                { label: t('地址', 'Addr'), value: footerSettings['contact_address'] || t('陕西省杨凌示范区', 'Yangling, Shaanxi, China') },
                { label: t('电话', 'Tel'), value: footerSettings['contact_phone'] || '029-87012345' },
                { label: t('邮箱', 'Email'), value: footerSettings['contact_email'] || 'info@sanzhi-tech.com' },
                { label: t('工作日', 'Hours'), value: t('周一至周五 9:00-18:00', 'Mon-Fri 9:00-18:00') },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', gap: 1, mb: 0.8 }}>
                  <Typography variant="body2" sx={{ color: V2_COLORS.secondary.light, fontSize: '0.8rem', whiteSpace: 'nowrap', minWidth: 32 }}>{label}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
              &copy; {new Date().getFullYear()} {t('杨凌三智科技有限公司 版权所有', 'Yangling Sanzhi Technology Co., Ltd. All Rights Reserved')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
              陕ICP备XXXXXXXX号-1
            </Typography>
          </Box>
        </Container>
      </Box>

      <InquiryDialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <ScrollToTop />
    </Box>
  );
}
