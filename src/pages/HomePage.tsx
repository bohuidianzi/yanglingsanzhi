import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Grid, Typography, Button, Paper, Divider, Chip } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { getCategories, getProducts } from '../api/products';
import { articleApi } from '../api/navigation';
import type { Category, Product } from '../types/api';
import { V2_COLORS as C } from '../theme/colors';
import HeroCarousel from '../components/HeroCarousel';

// 根据分类名称返回纯色 accent
function getCatAccent(name: string, idx: number): string {
  if (name.includes('水蚀')) return C.primary.main;
  if (name.includes('风蚀')) return '#4A8A7A';
  if (name.includes('气象')) return C.accent.main;
  if (name.includes('水力')) return '#7B6B8D';
  if (name.includes('云平台') || name.includes('智慧')) return C.success.main;
  if (name.includes('盐碱')) return '#C47B42';
  return [C.primary.main, '#4A8A7A', C.accent.main, '#7B6B8D', C.success.main, '#C47B42'][idx % 6];
}

function getCatGradient(name: string, idx: number): string {
  if (name.includes('水蚀')) return 'linear-gradient(135deg, #1A3A5C 0%, #2A5A8C 100%)';
  if (name.includes('风蚀')) return 'linear-gradient(135deg, #2D4A3E 0%, #4A8A7A 100%)';
  if (name.includes('气象')) return 'linear-gradient(135deg, #5C3A1A 0%, #D4862A 100%)';
  if (name.includes('水力')) return 'linear-gradient(135deg, #3A2A4A 0%, #7B6B8D 100%)';
  if (name.includes('云平台') || name.includes('智慧')) return 'linear-gradient(135deg, #1A4A3A 0%, #3A8F5C 100%)';
  if (name.includes('盐碱')) return 'linear-gradient(135deg, #4A2A1A 0%, #C47B42 100%)';
  const gs = ['linear-gradient(135deg, #1A3A5C 0%, #2A5A8C 100%)','linear-gradient(135deg, #2D4A3E 0%, #4A8A7A 100%)','linear-gradient(135deg, #5C3A1A 0%, #D4862A 100%)','linear-gradient(135deg, #3A2A4A 0%, #7B6B8D 100%)','linear-gradient(135deg, #1A4A3A 0%, #3A8F5C 100%)','linear-gradient(135deg, #4A2A1A 0%, #C47B42 100%)'];
  return gs[idx % 6];
}

function getCatEmoji(name: string): string {
  if (name.includes('水蚀')) return '🌊';
  if (name.includes('风蚀')) return '💨';
  if (name.includes('气象')) return '🌤️';
  if (name.includes('水力')) return '💧';
  if (name.includes('云平台') || name.includes('智慧')) return '☁️';
  if (name.includes('盐碱')) return '🧪';
  return '📦';
}

function SectionHead({ label, title, light }: { label: string; title: string; light?: boolean }) {
  return (
    <Box sx={{ textAlign: 'center', mb: 5 }}>
      <Typography sx={{
        color: light ? 'rgba(255,255,255,0.5)' : C.text.secondary,
        fontSize: '0.7rem', fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', mb: 1.5,
      }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{
        fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' },
        color: light ? '#fff' : C.primary.dark,
      }}>
        {title}
      </Typography>
    </Box>
  );
}

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [news, setNews] = useState<{ id: number; title: string; summary: string | null; cover_image: string | null; published_at: string }[] | null>(null);

  useEffect(() => {
    getProducts({ pageSize: 6, is_recommended: 1 }).then(r => {
      if (r.data?.data?.list?.length) setProducts(r.data.data.list);
      else setProducts([]);
    }).catch(() => setProducts([]));

    getCategories().then(r => {
      if (r.data?.data?.length) setCategories(r.data.data);
      else setCategories([]);
    }).catch(() => setCategories([]));

    articleApi.getAll({ subcategory_id: '11,12,13', pageSize: 6 }).then(r => {
      if (r.data?.data?.list?.length) setNews(r.data.data.list);
      else setNews([]);
    }).catch(() => setNews([]));
  }, []);

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) : '';
  const fmtFullDate = (d?: string) => d ? new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const firstNews = news?.[0];
  const restNews = news?.slice(1) || [];

  return (
    <Box>
      {/* ═══════════ 1. Banner ═══════════ */}
      <HeroCarousel />

      {/* ═══════════ 2. 推荐产品 — 一行6个 ═══════════ */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <FadeIn><SectionHead label="RECOMMENDED PRODUCTS" title="推荐产品" /></FadeIn>
          {!products ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>加载中...</Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>暂无产品，请在后台添加</Box>
          ) : (
            <Grid container spacing={2.5} justifyContent="center">
              {products.slice(0, 6).map((p, i) => (
                <Grid item xs={6} sm={4} md={2} key={p.id}>
                  <FadeIn delay={i * 0.08}>
                    <Paper
                      component={Link} to={`/products/${p.id}`}
                      elevation={0}
                      sx={{
                        borderRadius: 3, overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column',
                        border: `1px solid ${C.divider}`, height: '100%', bgcolor: '#fff',
                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 16px 40px rgba(15,43,71,0.12)',
                          borderColor: `${C.accent.main}50`,
                          '& .prod-img': { transform: 'scale(1.08)' },
                        },
                      }}
                    >
                      {/* 图片区域 */}
                      <Box sx={{
                        height: { xs: 120, md: 150 }, position: 'relative', overflow: 'hidden',
                        bgcolor: '#E8ECF1',
                      }}>
                        {p.cover_image ? (
                          <Box component="img" src={p.cover_image} alt={p.name}
                            className="prod-img"
                            onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                        ) : (
                          <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.primary.main}12 0%, ${C.primary.dark}25 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                            {getCatEmoji(p.category_name || '')}
                          </Box>
                        )}
                        {/* 分类标签 */}
                        {p.category_name && (
                          <Chip label={p.category_name} size="small"
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.65rem', height: 22, backdropFilter: 'blur(4px)' }} />
                        )}
                      </Box>
                      {/* 文字区域 */}
                      <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: C.primary.dark, mb: 0.3, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.summary || ''}
                        </Typography>
                      </Box>
                    </Paper>
                  </FadeIn>
                </Grid>
              ))}
            </Grid>
          )}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button component={Link} to="/products" endIcon={<ArrowRightAltIcon />}
              sx={{ color: C.primary.main, fontWeight: 600, '&:hover': { color: C.accent.main } }}>
              查看全部产品
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ═══════════ 3. 新闻动态 — 左大图 + 右列表 ═══════════ */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F8F9FB' }}>
        <Container maxWidth="lg">
          <FadeIn><SectionHead label="NEWS CENTER" title="新闻中心" /></FadeIn>
          {!news ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>加载中...</Box>
          ) : news.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无新闻</Box>
          ) : (
            <Grid container spacing={4}>
              {/* 左侧：最新新闻大卡片 */}
              <Grid item xs={12} md={5}>
                <FadeIn delay={0.1}>
                  <Paper
                    component={Link} to={`/news?article=${firstNews?.id}`}
                    elevation={0}
                    sx={{
                      borderRadius: 3, overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column',
                      border: `1px solid ${C.divider}`, height: '100%',
                      transition: 'all 0.35s ease',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(15,43,71,0.1)' },
                    }}
                  >
                    <Box sx={{ height: 220, position: 'relative', overflow: 'hidden', bgcolor: '#E8ECF1' }}>
                      {firstNews?.cover_image ? (
                        <Box component="img" src={firstNews.cover_image} alt={firstNews.title}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.primary.main} 0%, ${C.primary.dark} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '3rem', fontWeight: 900 }}>NEWS</Typography>
                        </Box>
                      )}
                      <Chip label="最新" size="small"
                        sx={{ position: 'absolute', top: 12, left: 12, bgcolor: C.accent.main, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
                    </Box>
                    <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled">{fmtFullDate(firstNews?.published_at)}</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: C.primary.dark, mb: 1.5, lineHeight: 1.5, flex: 1 }}>
                        {firstNews?.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {firstNews?.summary || ''}
                      </Typography>
                    </Box>
                  </Paper>
                </FadeIn>
              </Grid>

              {/* 右侧：新闻列表 */}
              <Grid item xs={12} md={7}>
                <FadeIn delay={0.2}>
                  <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${C.divider}`, overflow: 'hidden' }}>
                    {restNews.map((item, i) => (
                      <Box key={item.id}>
                        <Box component={Link} to={`/news?article=${item.id}`}
                          sx={{
                            px: 3, py: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2.5, textDecoration: 'none',
                            transition: '0.25s', '&:hover': { bgcolor: `${C.primary.main}04` },
                          }}>
                          {/* 日期方块 */}
                          <Box sx={{
                            minWidth: 52, height: 52, borderRadius: 2, bgcolor: i === 0 ? C.accent.main : `${C.primary.main}08`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            color: i === 0 ? '#fff' : C.primary.dark, flexShrink: 0,
                          }}>
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{fmtDate(item.published_at).split('/')[0]}</Typography>
                            <Typography sx={{ fontSize: '0.6rem', opacity: 0.7 }}>{fmtDate(item.published_at).split('/')[1] || ''}月</Typography>
                          </Box>
                          {/* 标题和摘要 */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: C.primary.dark, mb: 0.5, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.summary || ''}
                            </Typography>
                          </Box>
                          <ArrowRightAltIcon sx={{ color: 'text.disabled', fontSize: 20, mt: 0.5, flexShrink: 0 }} />
                        </Box>
                        {i < restNews.length - 1 && <Divider />}
                      </Box>
                    ))}
                    {restNews.length === 0 && (
                      <Box sx={{ py: 6, textAlign: 'center', color: 'text.disabled' }}>暂无更多新闻</Box>
                    )}
                  </Paper>
                </FadeIn>
              </Grid>
            </Grid>
          )}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button component={Link} to="/news" endIcon={<ArrowRightAltIcon />}
              sx={{ color: C.primary.main, fontWeight: 600, '&:hover': { color: C.accent.main } }}>
              查看全部新闻
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ═══════════ 4. 品牌中心 = 产品大类 ═══════════ */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: C.primary.dark, position: 'relative', overflow: 'hidden' }}>
        {/* 背景装饰 */}
        <Box sx={{ position: 'absolute', top: '-30%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, rgba(212,134,42,0.1) 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: '-20%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, rgba(58,143,92,0.08) 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <FadeIn><SectionHead label="BRAND CENTER" title="品牌中心" light /></FadeIn>
          {!categories ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.5)' }}>加载中...</Box>
          ) : categories.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.5)' }}>暂无分类，请在后台添加</Box>
          ) : (
            <Grid container spacing={3}>
              {categories.slice(0, 6).map((cat, i) => {
                const gradient = getCatGradient(cat.name, i);
                return (
                  <Grid item xs={12} sm={6} md={4} key={cat.id}>
                    <FadeIn delay={i * 0.1}>
                      <Paper
                        component={Link} to={`/products?category=${cat.slug}`}
                        elevation={0}
                        sx={{
                          borderRadius: 3, overflow: 'hidden', textDecoration: 'none', height: '100%',
                          bgcolor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            borderColor: 'rgba(255,255,255,0.2)',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
                            '& .cat-img': { transform: 'scale(1.06)' },
                          },
                        }}
                      >
                        {/* 分类封面图 */}
                        <Box sx={{ height: 180, position: 'relative', overflow: 'hidden' }}>
                          {cat.cover_image ? (
                            <Box component="img" src={cat.cover_image} alt={cat.name} className="cat-img"
                              onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                          ) : (
                            <Box sx={{ position: 'absolute', inset: 0, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography sx={{ fontSize: '3.5rem' }}>{getCatEmoji(cat.name)}</Typography>
                            </Box>
                          )}
                          {/* 渐变遮罩 */}
                          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
                          {/* 分类名称 */}
                          <Typography sx={{
                            position: 'absolute', bottom: 12, left: 16, color: '#fff', fontWeight: 700, fontSize: '1.1rem',
                            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                          }}>
                            {cat.name}
                          </Typography>
                        </Box>
                        <Box sx={{ p: 2.5 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', lineHeight: 1.6, mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {cat.description || '暂无描述'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FiberManualRecordIcon sx={{ fontSize: 6, color: C.accent.main }} />
                            <Typography sx={{ color: C.accent.main, fontWeight: 600, fontSize: '0.78rem' }}>查看系列产品</Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </FadeIn>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}
