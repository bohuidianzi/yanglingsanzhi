import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Grid, Typography, Button, Chip, Paper, Divider } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { getCategories, getProducts } from '../api/products';
import { articleApi } from '../api/navigation';
import type { Category, Product } from '../types/api';
import { V2_COLORS as C } from '../theme/colors';
import HeroCarousel from '../components/HeroCarousel';

// ─── 产品分类图标 ──────────────────────────────────
const catIcons = ['🌊', '💨', '🌤️', '🧪', '☁️'];
const catSlugMap: Record<number, string> = {
  1: 'soil-water-erosion-series', 2: 'wind-erosion-series', 3: 'eco-meteorology-series',
  4: 'saline-alkali-series', 5: 'smart-cloud-platform',
};
const catAccents = [C.primary.main, '#4A8A7A', C.accent.main, '#7B6B8D', C.success.main];

// ─── Fallback ─────────────────────────────────────
const fallbackCategories: Category[] = [
  { id: 1, name: '土壤水蚀监测', slug: 'soil-water-erosion', description: '模块化径流小区、径流泥沙自动监测仪', sort_order: 1, status: 1, created_at: '', updated_at: '' },
  { id: 2, name: '土壤风蚀监测', slug: 'soil-wind-erosion', description: '全自动风蚀监测系统', sort_order: 2, status: 1, created_at: '', updated_at: '' },
  { id: 3, name: '生态气象监测', slug: 'eco-meteorology', description: '全自动气象站、称重式雨量计', sort_order: 3, status: 1, created_at: '', updated_at: '' },
  { id: 4, name: '盐碱地监测治理', slug: 'saline-alkali', description: '盐碱地监测治理集成设备', sort_order: 4, status: 1, created_at: '', updated_at: '' },
  { id: 5, name: '智慧水保云平台', slug: 'smart-platform', description: '水土保持云数据平台', sort_order: 5, status: 1, created_at: '', updated_at: '' },
];

// ─── FadeIn ──────────────────────────────────────
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

// ─── Section Title ───────────────────────────────
function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <Box sx={{ textAlign: 'center', mb: 5 }}>
      <Typography sx={{ color: C.text.secondary, fontSize: '0.7rem', fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', mb: 1.5 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: C.primary.dark, fontSize: { xs: '1.5rem', md: '2rem' } }}>
        {title}
      </Typography>
    </Box>
  );
}

// ─── Main Component ──────────────────────────────
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [news, setNews] = useState<{ id: number; title: string; published_at: string }[]>([]);

  useEffect(() => {
    getProducts({ pageSize: 6 }).then(r => {
      if (r.data?.data?.list?.length) setProducts(r.data.data.list);
    }).catch(() => {});
    getCategories().then(r => {
      if (r.data?.data?.length) setCategories(r.data.data);
    }).catch(() => {});
    articleApi.getAll({ pageSize: 5, is_featured: 0 }).then(r => {
      if (r.data?.data?.list?.length) setNews(r.data.data.list);
    }).catch(() => {});
  }, []);

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) : '';

  return (
    <Box>
      {/* 1. Banner 轮播 — 较矮 */}
      <HeroCarousel />

      {/* 2. 推荐产品 — 具体产品卡片 */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F8F9FB' }}>
        <Container maxWidth="lg">
          <FadeIn><SectionHead label="RECOMMENDED PRODUCTS" title="推荐产品" /></FadeIn>
          <Grid container spacing={3}>
            {products.slice(0, 5).map((p, i) => (
              <Grid item xs={12} sm={6} md={4} lg key={p.id}>
                <FadeIn delay={i * 0.1}>
                  <Paper
                    component={Link} to={`/products/${p.id}`}
                    elevation={0}
                    sx={{
                      borderRadius: 3, overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column',
                      border: `1px solid ${C.divider}`, height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 36px rgba(15,43,71,0.1)',
                        borderColor: `${C.accent.main}40`,
                        '& .prod-img-wrap': { transform: 'scale(1.04)' },
                      },
                    }}
                  >
                    {/* 图片区 */}
                    <Box sx={{ height: 180, bgcolor: '#E8ECF1', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box className="prod-img-wrap" sx={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(135deg, ${C.primary.main}15 0%, ${C.primary.dark}30 100%)`,
                        transition: 'transform 0.4s ease',
                      }} />
                      <Box sx={{ position: 'relative', zIndex: 1, color: C.primary.dark, fontSize: '1.6rem', opacity: 0.5 }}>
                        {catIcons[i % catIcons.length]}
                      </Box>
                      {p.cover_image && (
                        <Box component="img" src={p.cover_image} alt={p.name}
                          onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
                      )}
                    </Box>
                    {/* 信息 */}
                    <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: C.primary.dark, mb: 0.5, lineHeight: 1.4 }}>
                        {p.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.6, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.summary || p.description || '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: C.accent.main, fontWeight: 600, mt: 1.5 }}>
                        查看详情 <ArrowRightAltIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                      </Typography>
                    </Box>
                  </Paper>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 3. 新闻动态 */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <FadeIn><SectionHead label="NEWS" title="新闻动态" /></FadeIn>
          <FadeIn delay={0.2}>
            <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${C.divider}`, overflow: 'hidden', maxWidth: 900, mx: 'auto' }}>
              {news.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>暂无新闻</Box>
              ) : news.map((item, i) => (
                <Box key={item.id}>
                  <Box component={Link} to={`/news?article=${item.id}`}
                    sx={{ px: 3, py: 2.2, display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none', transition: '0.2s', '&:hover': { bgcolor: `${C.primary.main}04` } }}>
                    <Typography sx={{ color: C.accent.main, fontWeight: 700, fontSize: '0.82rem', minWidth: 52, textAlign: 'center' }}>
                      {fmtDate(item.published_at)}
                    </Typography>
                    <Typography sx={{ color: C.primary.dark, fontWeight: 500, fontSize: '0.9rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </Typography>
                    <ArrowRightAltIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </Box>
                  {i < news.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>
          </FadeIn>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button component={Link} to="/news" endIcon={<ArrowRightAltIcon />}
              sx={{ color: C.primary.main, fontWeight: 600, '&:hover': { color: C.accent.main } }}>
              查看全部新闻
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 4. 品牌中心 = 产品大类 */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F8F9FB' }}>
        <Container maxWidth="lg">
          <FadeIn><SectionHead label="BRAND CENTER" title="品牌中心" /></FadeIn>
          <Grid container spacing={3}>
            {categories.slice(0, 5).map((cat, i) => {
              const accent = catAccents[i] || C.primary.main;
              return (
                <Grid item xs={12} sm={6} md={4} lg key={cat.id}>
                  <FadeIn delay={i * 0.1}>
                    <Paper
                      component={Link} to={`/products?category=${catSlugMap[cat.id] || cat.slug}`}
                      elevation={0}
                      sx={{
                        borderRadius: 3, overflow: 'hidden', textDecoration: 'none', height: '100%',
                        border: `1px solid ${C.divider}`, transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-6px)', boxShadow: '0 12px 36px rgba(15,43,71,0.1)',
                          borderColor: `${accent}40`,
                          '& .cat-bar': { width: '100%', opacity: 1 },
                        },
                      }}
                    >
                      <Box sx={{ height: 140, position: 'relative', overflow: 'hidden', bgcolor: `${accent}08`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ fontSize: '3rem' }}>{catIcons[i % catIcons.length]}</Box>
                      </Box>
                      <Box sx={{ p: 2.5 }}>
                        <Typography sx={{ fontWeight: 700, color: C.primary.dark, fontSize: '1rem', mb: 0.5 }}>
                          {cat.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.6, mb: 1.5 }}>
                          {cat.description || '—'}
                        </Typography>
                        <Box className="cat-bar" sx={{
                          height: 3, borderRadius: 1, bgcolor: accent, width: 40, opacity: 0.5,
                          transition: 'all 0.4s ease',
                        }} />
                      </Box>
                    </Paper>
                  </FadeIn>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
