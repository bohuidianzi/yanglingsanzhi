import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Button, Chip, Paper, Divider,
} from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import WaterIcon from '@mui/icons-material/Water';
import AirIcon from '@mui/icons-material/Air';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import BiotechIcon from '@mui/icons-material/Biotech';
import CloudIcon from '@mui/icons-material/CloudQueue';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import ScienceIcon from '@mui/icons-material/Science';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import GroupsIcon from '@mui/icons-material/Groups';
import VerifiedIcon from '@mui/icons-material/Verified';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CampaignIcon from '@mui/icons-material/Campaign';
import HeroCarousel from '../components/HeroCarousel';
import CountUpNumber from '../components/CountUpNumber';
import InquiryDialog from '../components/InquiryDialog';
import { getCategories } from '../api/products';
import { getSettings } from '../api/settings';
import { articleApi } from '../api/navigation';
import type { Category } from '../types/api';
import { V2_COLORS as C } from '../theme/colors';
import { MOTION } from '../theme/motion';

// ─── Fallback Data ─────────────────────────────────
const categoryIcons: Record<string, React.ReactNode> = {
  '🌊': <WaterIcon sx={{ fontSize: 36 }} />,
  '💨': <AirIcon sx={{ fontSize: 36 }} />,
  '🌤️': <WbSunnyIcon sx={{ fontSize: 36 }} />,
  '🧪': <BiotechIcon sx={{ fontSize: 36 }} />,
  '☁️': <CloudIcon sx={{ fontSize: 36 }} />,
};

const catIdToSlug: Record<number, string> = {
  1: 'soil-water-erosion-series', 2: 'wind-erosion-series', 3: 'eco-meteorology-series',
  4: 'saline-alkali-series', 5: 'smart-cloud-platform',
};

const productAccentColors = [
  { bg: '#EDF1F7', line: C.primary.main },   // 水蚀 蓝
  { bg: '#EEF3F3', line: '#4A8A7A' },         // 风蚀 青
  { bg: '#F7F0E8', line: C.accent.main },      // 气象 金
  { bg: '#F2EFF5', line: '#7B6B8D' },          // 盐碱 紫
  { bg: '#EFF3EF', line: C.success.main },      // 平台 绿
];

// 产品卡片hover渐变
const productGradients = [
  'linear-gradient(135deg, #1A3A5C 0%, #2A5A8C 100%)',
  'linear-gradient(135deg, #1A3A3A 0%, #2A6A5A 100%)',
  'linear-gradient(135deg, #3B2010 0%, #6B3A1A 100%)',
  'linear-gradient(135deg, #2A1A3A 0%, #4A2A5A 100%)',
  'linear-gradient(135deg, #1A2A1A 0%, #2A4A2A 100%)',
];

const fallbackCategories: (Category & { icon: string; desc: string })[] = [
  { id: 1, name: '土壤水蚀监测', slug: 'soil-water-erosion', description: null, icon: '🌊', sort_order: 1, status: 1, created_at: '', updated_at: '', desc: '模块化径流小区、径流泥沙自动监测仪、便携式泥沙测量仪、壤中流监测仪' },
  { id: 2, name: '土壤风蚀监测', slug: 'soil-wind-erosion', description: null, icon: '💨', sort_order: 2, status: 1, created_at: '', updated_at: '', desc: '全自动风蚀监测系统' },
  { id: 3, name: '生态气象监测', slug: 'eco-meteorology', description: null, icon: '🌤️', sort_order: 3, status: 1, created_at: '', updated_at: '', desc: '全自动气象站、称重式全自动雨量计' },
  { id: 4, name: '盐碱地监测治理', slug: 'saline-alkali', description: null, icon: '🧪', sort_order: 4, status: 1, created_at: '', updated_at: '', desc: '盐碱地监测治理集成设备' },
  { id: 5, name: '智慧水保云平台', slug: 'smart-platform', description: null, icon: '☁️', sort_order: 5, status: 1, created_at: '', updated_at: '', desc: '水土保持云数据平台' },
];

const stats = [
  { end: 22, suffix: '+', label: '专利技术', icon: <EmojiEventsIcon sx={{ fontSize: 36 }} /> },
  { end: 5, suffix: '大', label: '产品系列', icon: <AutoGraphIcon sx={{ fontSize: 36 }} /> },
  { end: 20, suffix: '+', label: '省份推广', icon: <GroupsIcon sx={{ fontSize: 36 }} /> },
  { end: 1, suffix: '', label: 'CMA权威认证', icon: <VerifiedIcon sx={{ fontSize: 36 }} /> },
];

// ─── Animate In View ──────────────────────────────
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────
export default function HomePage() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [news, setNews] = useState<{ id: number; title: string; published_at: string }[]>([]);

  useEffect(() => {
    getCategories().then((res) => {
      if (res.data?.data?.length) {
        setCategories(res.data.data.map((c: Category, i: number) => ({
          ...c, icon: fallbackCategories[i]?.icon || '☁️',
          desc: c.description || fallbackCategories[i]?.desc || '',
        })));
      }
    }).catch(() => {});
    // 加载最新新闻
    articleApi.getAll({ pageSize: 5 }).then((res) => {
      if (res.data?.data?.list?.length) setNews(res.data.data.list);
    }).catch(() => {});
    getSettings().then(() => {}).catch(() => {});
  }, []);

  const fmtDate = (d?: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  return (
    <Box>
      {/* ═══════════════ 1. Hero 轮播 ═══════════════ */}
      <HeroCarousel />

      {/* ═══════════════ 2. 推荐产品 — 产品驱动核心 ═══════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8F9FB', position: 'relative' }}>
        <Container maxWidth="lg">
          <FadeInSection>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Chip label="PRODUCTS" size="small" sx={{ mb: 1.5, bgcolor: `${C.primary.main}10`, color: C.primary.main, fontWeight: 700, fontSize: '0.7rem', letterSpacing: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: C.primary.dark, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                  核心产品系列
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  覆盖水土保持监测全场景
                </Typography>
              </Box>
              <Button component={Link} to="/products" endIcon={<ArrowRightAltIcon />}
                sx={{ color: C.primary.main, fontWeight: 600, '&:hover': { color: C.accent.main } }}>
                查看全部产品
              </Button>
            </Box>
          </FadeInSection>

          <Grid container spacing={3}>
            {categories.slice(0, 5).map((cat, idx) => {
              const accent = productAccentColors[idx] || productAccentColors[0];
              const grad = productGradients[idx];
              return (
                <Grid item xs={12} sm={6} md={4} lg key={cat.id}>
                  <FadeInSection delay={idx * 0.1}>
                    <Paper
                      component={Link}
                      to={`/products?category=${catIdToSlug[cat.id] || cat.slug}`}
                      elevation={0}
                      sx={{
                        borderRadius: 3, overflow: 'hidden', textDecoration: 'none',
                        border: `1px solid ${C.divider}`, transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 16px 48px rgba(15,43,71,0.12)',
                          '& .prod-img-area': { transform: 'scale(1.05)' },
                          '& .prod-overlay': { opacity: 0.85 },
                        },
                      }}
                    >
                      {/* 顶部渐变图片区 */}
                      <Box sx={{ height: 160, position: 'relative', overflow: 'hidden', bgcolor: accent.bg }}>
                        <Box className="prod-img-area" sx={{
                          position: 'absolute', inset: 0,
                          background: grad, opacity: 0.7, transition: 'transform 0.5s ease',
                        }} />
                        <Box className="prod-overlay" sx={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.3) 100%)',
                          transition: 'opacity 0.4s ease',
                        }} />
                        {/* 图标 */}
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', opacity: 0.9 }}>
                          {categoryIcons[cat.icon] || <CloudIcon sx={{ fontSize: 40 }} />}
                        </Box>
                        {/* 编号 */}
                        <Typography sx={{
                          position: 'absolute', top: 12, right: 16,
                          fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.15)', lineHeight: 1,
                        }}>
                          {String(idx + 1).padStart(2, '0')}
                        </Typography>
                      </Box>
                      {/* 底部信息 */}
                      <Box sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                          <Box sx={{ width: 3, height: 16, borderRadius: 1, bgcolor: accent.line }} />
                          <Typography sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '0.95rem' }}>
                            {cat.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {cat.desc}
                        </Typography>
                      </Box>
                    </Paper>
                  </FadeInSection>
                </Grid>
              );
            })}
          </Grid>

          {/* 产品系列下方 — 数据速览条 */}
          <FadeInSection delay={0.5}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 3, md: 6 }, mt: 6, flexWrap: 'wrap' }}>
              {stats.map((s, i) => (
                <Box key={i} sx={{ textAlign: 'center', minWidth: 100 }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: C.primary.dark, lineHeight: 1.1 }}>
                    {s.end}{s.suffix}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </FadeInSection>
        </Container>
      </Box>

      {/* ═══════════════ 3. 四宫格快速导航 ═══════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff', position: 'relative' }}>
        <Container maxWidth="lg">
          <FadeInSection>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Chip label="QUICK NAV" size="small" sx={{ mb: 1.5, bgcolor: `${C.accent.main}12`, color: C.accent.dark, fontWeight: 700, fontSize: '0.7rem', letterSpacing: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: C.primary.dark, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                快速了解
              </Typography>
            </Box>
          </FadeInSection>

          <Grid container spacing={2.5}>
            {[
              { icon: <ScienceIcon sx={{ fontSize: 36 }} />, title: '核心优势', desc: '六大维度铸就行业标杆，从技术研发到服务体系全面领先', to: '/core-advantages', color: C.primary.main },
              { icon: <EmojiEventsIcon sx={{ fontSize: 36 }} />, title: '成果转化', desc: '从实验室到田间，产品覆盖20+省份，典型案例见证实效', to: '/achievements', color: C.accent.main },
              { icon: <GroupsIcon sx={{ fontSize: 36 }} />, title: '合作加盟', desc: '合伙人制度，多方资源协同，政产学研四链深度融合', to: '/cooperation', color: C.success.main },
              { icon: <SupportAgentIcon sx={{ fontSize: 36 }} />, title: '服务支持', desc: '7×24小时技术支持，快速响应，为项目顺利推进保驾护航', to: '/contact', color: '#4A6FA5' },
            ].map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <FadeInSection delay={i * 0.1}>
                  <Paper
                    component={Link} to={item.to}
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 }, borderRadius: 3, textDecoration: 'none',
                      border: `1px solid ${C.divider}`, height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: `${item.color}40`,
                        boxShadow: `0 8px 32px ${item.color}10`,
                        transform: 'translateY(-4px)',
                        '& .nav-icon-box': { bgcolor: item.color, color: '#fff', transform: 'scale(1.08)' },
                        '& .nav-arrow': { opacity: 1, transform: 'translateX(0)' },
                      },
                    }}
                  >
                    <Box className="nav-icon-box" sx={{
                      width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: `${item.color}10`, color: item.color, mb: 2, transition: 'all 0.3s ease',
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: C.primary.dark, mb: 0.8, fontSize: '1rem' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1.5, fontSize: '0.82rem' }}>
                      {item.desc}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: item.color, fontWeight: 600, fontSize: '0.82rem' }}>
                      了解更多
                      <ArrowRightAltIcon className="nav-arrow" sx={{ fontSize: 18, opacity: 0.5, transform: 'translateX(-4px)', transition: 'all 0.3s ease' }} />
                    </Box>
                  </Paper>
                </FadeInSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ 4. 新闻动态 ═══════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8F9FB', position: 'relative' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <FadeInSection>
                <Box>
                  <Chip label="NEWS" size="small" sx={{ mb: 1.5, bgcolor: `${C.primary.main}10`, color: C.primary.main, fontWeight: 700, fontSize: '0.7rem', letterSpacing: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, color: C.primary.dark, fontSize: { xs: '1.5rem', md: '1.8rem' }, mb: 1 }}>
                    新闻动态
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    了解公司最新动态与行业资讯
                  </Typography>
                  <Button component={Link} to="/news" endIcon={<ArrowRightAltIcon />}
                    variant="outlined" sx={{ borderColor: C.primary.main, color: C.primary.main, fontWeight: 600, borderRadius: 2,
                      '&:hover': { borderColor: C.accent.main, color: C.accent.main, bgcolor: `${C.accent.main}08` } }}>
                    查看全部新闻
                  </Button>
                </Box>
              </FadeInSection>
            </Grid>
            <Grid item xs={12} md={8}>
              <FadeInSection delay={0.2}>
                <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${C.divider}`, overflow: 'hidden' }}>
                  {news.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>暂无新闻</Box>
                  ) : (
                    news.map((item, idx) => (
                      <Box key={item.id}>
                        <Box
                          component={Link} to={`/news?article=${item.id}`}
                          sx={{
                            px: { xs: 2.5, md: 3 }, py: 2.2, display: 'flex', alignItems: 'center', gap: 2,
                            textDecoration: 'none', transition: 'all 0.2s',
                            '&:hover': { bgcolor: `${C.primary.main}04` },
                          }}
                        >
                          <Typography sx={{
                            color: C.accent.main, fontWeight: 700, fontSize: '0.85rem', minWidth: 54,
                            textAlign: 'center', lineHeight: 1.3,
                          }}>
                            {fmtDate(item.published_at)}
                          </Typography>
                          <Typography sx={{
                            color: C.primary.dark, fontWeight: 500, fontSize: '0.92rem',
                            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {item.title}
                          </Typography>
                          <ArrowRightAltIcon sx={{ color: 'text.disabled', fontSize: 20, flexShrink: 0 }} />
                        </Box>
                        {idx < news.length - 1 && <Divider />}
                      </Box>
                    ))
                  )}
                </Paper>
              </FadeInSection>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ 5. CTA 合作号召 ═══════════════ */}
      <Box sx={{
        py: 0, position: 'relative', overflow: 'hidden', minHeight: { xs: 440, md: 520 },
        display: 'flex', alignItems: 'center',
        background: `linear-gradient(160deg, #0A1929 0%, #0D2137 40%, #0A1929 100%)`,
      }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 800, height: 600, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${C.accent.main}08 0%, transparent 60%)`, zIndex: 0 }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${C.primary.main}, ${C.accent.main}, ${C.success.main}, ${C.accent.main})`, zIndex: 1 }} />

        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <FadeInSection>
            <Chip label="COOPERATION" size="small" sx={{ mb: 3, bgcolor: `${C.accent.main}18`, color: C.accent.light, fontWeight: 700, fontSize: '0.7rem', letterSpacing: 3 }} />
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, mb: 0.5, lineHeight: 1.2 }}>
              让科技守护绿水青山
            </Typography>
            <Typography sx={{
              background: `linear-gradient(135deg, ${C.accent.light} 0%, #F5C563 50%, ${C.accent.light} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, mb: 2, lineHeight: 1.2,
            }}>
              共创水土保持智能监测新未来
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 5, fontSize: '1rem', letterSpacing: 2 }}>
              期待与您携手，为生态文明建设贡献力量
            </Typography>
            <Button variant="contained" size="large" onClick={() => setInquiryOpen(true)}
              component={motion.button} whileHover={{ scale: MOTION.BTN_HOVER_SCALE }}
              sx={{ bgcolor: C.accent.main, color: '#fff', px: 7, py: 2, borderRadius: 2.5, fontSize: '1.1rem', fontWeight: 700, letterSpacing: 2,
                boxShadow: `0 8px 40px ${C.accent.main}50`, '&:hover': { bgcolor: C.accent.dark, boxShadow: `0 12px 50px ${C.accent.main}60` } }}>
              立即咨询
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 6, flexWrap: 'wrap' }}>
              {['CMA权威认证', '全国重点实验室', '20+省份覆盖', '14年行业深耕'].map((t) => (
                <Typography key={t} sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', letterSpacing: 1 }}>
                  {t}
                </Typography>
              ))}
            </Box>
          </FadeInSection>
        </Container>
      </Box>

      <InquiryDialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </Box>
  );
}
