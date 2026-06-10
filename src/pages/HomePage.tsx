import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
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
import FactoryIcon from '@mui/icons-material/Factory';
import NatureIcon from '@mui/icons-material/Nature';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import GroupsIcon from '@mui/icons-material/Groups';
import VerifiedIcon from '@mui/icons-material/Verified';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HubIcon from '@mui/icons-material/Hub';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import HeroCarousel from '../components/HeroCarousel';
import CountUpNumber from '../components/CountUpNumber';
import InquiryDialog from '../components/InquiryDialog';
import { getCategories } from '../api/products';
import { getSettings } from '../api/settings';
import type { Category } from '../types/api';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

// emoji → MUI SVG Icon 映射
const categoryIcons: Record<string, React.ReactNode> = {
  '🌊': <WaterIcon sx={{ fontSize: 40 }} />,
  '💨': <AirIcon sx={{ fontSize: 40 }} />,
  '🌤️': <WbSunnyIcon sx={{ fontSize: 40 }} />,
  '🧪': <BiotechIcon sx={{ fontSize: 40 }} />,
  '☁️': <CloudIcon sx={{ fontSize: 40 }} />,
};

// 分类颜色 — 莫兰迪灰调微渐变，五卡和谐统一
const categoryColors = [
  { main: '#4A6FA5', bg: '#EDF1F7', border: '#B8C8DE' },   // 水蚀 — 蓝灰
  { main: '#5A8A8A', bg: '#EEF3F3', border: '#B5CFCF' },   // 风蚀 — 青灰
  { main: '#B8834A', bg: '#F7F0E8', border: '#D9C4A8' },   // 气象 — 暖棕
  { main: '#7B6B8D', bg: '#F2EFF5', border: '#C4BACF' },   // 盐碱 — 紫灰
  { main: '#5A7D5A', bg: '#EFF3EF', border: '#B8CEB8' },   // 平台 — 绿灰
];

const gradientColors: Record<number, { from: string; to: string; angle: number }> = {
  0: { from: '#4A6FA5', to: '#6B8DB8', angle: 145 },   // 水蚀 — 蓝灰微渐变
  1: { from: '#5A8A8A', to: '#7AA5A5', angle: 155 },   // 风蚀 — 青灰微渐变
  2: { from: '#B8834A', to: '#C99E6B', angle: 135 },   // 气象 — 暖棕微渐变
  3: { from: '#7B6B8D', to: '#968AA6', angle: 165 },   // 盐碱 — 紫灰微渐变
  4: { from: '#5A7D5A', to: '#7A9B7A', angle: 150 },   // 平台 — 绿灰微渐变
};

const fallbackCategories: (Category & { icon: string; desc: string })[] = [
  { id: 1, name: '土壤水蚀监测', slug: 'soil-water-erosion', description: null, icon: '🌊', sort_order: 1, status: 1, created_at: '', updated_at: '', desc: '模块化径流小区、径流泥沙自动监测仪、便携式泥沙测量仪、壤中流监测仪' },
  { id: 2, name: '土壤风蚀监测', slug: 'soil-wind-erosion', description: null, icon: '💨', sort_order: 2, status: 1, created_at: '', updated_at: '', desc: '全自动风蚀监测系统' },
  { id: 3, name: '生态气象监测', slug: 'eco-meteorology', description: null, icon: '🌤️', sort_order: 3, status: 1, created_at: '', updated_at: '', desc: '全自动气象站、称重式全自动雨量计' },
  { id: 4, name: '盐碱地监测治理', slug: 'saline-alkali', description: null, icon: '🧪', sort_order: 4, status: 1, created_at: '', updated_at: '', desc: '盐碱地监测治理集成设备' },
  { id: 5, name: '智慧水保云平台', slug: 'smart-platform', description: null, icon: '☁️', sort_order: 5, status: 1, created_at: '', updated_at: '', desc: '水土保持云数据平台' },
];

const endorseCards = [
  {
    icon: <ScienceIcon sx={{ fontSize: 32 }} />,
    title: '水土保持与荒漠化整治全国重点实验室',
    subtitle: 'TECHNICAL SOURCE',
    tag: '国家智库',
    accent: V2_COLORS.primary.main,
    accentBg: `${V2_COLORS.primary.main}0F`,
    // 科研实验室场景
    bgImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
    desc: '国家级重点实验室技术背书，原创性基础研究驱动产品持续迭代升级',
  },
  {
    icon: <FactoryIcon sx={{ fontSize: 32 }} />,
    title: '西安三智科技',
    subtitle: '14 YEARS DEEP CULTIVATION',
    tag: '14年深耕',
    accent: V2_COLORS.accent.main,
    accentBg: `${V2_COLORS.accent.main}0F`,
    // 工厂/制造场景
    bgImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
    desc: '14年专注水土保持监测设备研发制造，22项专利，CMA权威认证',
  },
  {
    icon: <NatureIcon sx={{ fontSize: 32 }} />,
    title: '杨凌农创汇×水务局',
    subtitle: 'POLICY EMPOWERMENT',
    tag: '政策赋能',
    accent: V2_COLORS.success.main,
    accentBg: `${V2_COLORS.success.main}0F`,
    // 生态/绿色农业场景
    bgImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    desc: '杨凌示范区政策优势叠加，水务局资源协同，政产学研四链深度融合',
  },
];

const stats = [
  { end: 22, suffix: '+', label: '专利技术', icon: <EmojiEventsIcon sx={{ fontSize: 36 }} /> },
  { end: 5, suffix: '大', label: '产品系列', icon: <AutoGraphIcon sx={{ fontSize: 36 }} /> },
  { end: 20, suffix: '+', label: '省份推广', icon: <GroupsIcon sx={{ fontSize: 36 }} /> },
  { end: 1, suffix: '', label: 'CMA权威认证', icon: <VerifiedIcon sx={{ fontSize: 36 }} /> },
];

/** 分类ID → 产品子栏目slug映射（与ProductsPage保持一致） */
const catIdToSlug: Record<number, string> = {
  1: 'soil-water-erosion-series',
  2: 'wind-erosion-series',
  3: 'eco-meteorology-series',
  4: 'saline-alkali-series',
  5: 'smart-cloud-platform',
};

/** fallback endorse内容 — setings API不可用时兜底 */
const fallbackEndorse: Record<string, string> = {
  endorse1_title: '水土保持与荒漠化整治全国重点实验室',
  endorse1_tag: '国家智库',
  endorse1_desc: '国家级重点实验室技术背书，原创性基础研究驱动产品持续迭代升级',
  endorse2_title: '西安三智科技',
  endorse2_tag: '14年深耕',
  endorse2_desc: '14年专注水土保持监测设备研发制造，22项专利，CMA权威认证',
  endorse3_title: '杨凌农创汇×水务局',
  endorse3_tag: '政策赋能',
  endorse3_desc: '杨凌示范区政策优势叠加，水务局资源协同，政产学研四链深度融合',
};
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [settings, setSettings] = useState<Record<string, string>>(fallbackEndorse);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  useEffect(() => {
    getCategories()
      .then((res) => {
        if (res.data?.data?.length) {
          const merged = res.data.data.map((c, i) => ({
            ...c,
            icon: fallbackCategories[i]?.icon || '☁️',
            desc: c.description || fallbackCategories[i]?.desc || '',
          }));
          setCategories(merged);
        }
      })
      .catch(() => {});
    getSettings()
      .then((res) => { if (res.data?.data) setSettings((prev) => ({ ...prev, ...res.data.data })); })
      .catch(() => {});
  }, []);

  return (
    <Box>
      {/* ═══════ 屏1 Hero 轮播 ═══════ */}
      <HeroCarousel />

      {/* ═══════ 屏2 三方资源协同 — 极简白底+左边框排版，与产品系列彻底差异化 ═══════ */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
          bgcolor: '#FAFBFC',
        }}
      >
        <Container maxWidth="lg">
          {/* 标题 — 无装饰线，纯文字居中 */}
          <FadeInSection>
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 9 } }}>
              <Typography
                sx={{
                  color: V2_COLORS.text.secondary,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                  mb: 2.5,
                }}
              >
                TRUSTED PARTNERS
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: V2_COLORS.primary.dark,
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2,
                  letterSpacing: -0.5,
                  lineHeight: 1.2,
                }}
              >
                三方资源协同
              </Typography>
              <Typography
                sx={{
                  color: V2_COLORS.text.secondary,
                  fontSize: '1rem',
                  maxWidth: 440,
                  mx: 'auto',
                  lineHeight: 1.7,
                }}
              >
                {settings['endorse_subtitle'] || '国家级科研力量 × 行业深耕制造 × 政策赋能转化'}
              </Typography>
            </Box>
          </FadeInSection>

          {/* 三张卡片 — 背景图+统一高度+左边框 */}
          <Grid container spacing={3}>
            {endorseCards.map((card, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <FadeInSection delay={idx * 0.12}>
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `1px solid ${card.accent}25`,
                      borderLeft: `4px solid ${card.accent}`,
                      transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      height: 320,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 16px 48px rgba(15,43,71,0.14)`,
                        '& .card-bg': { transform: 'scale(1.06)', filter: 'brightness(0.28)' },
                        '& .card-overlay': { background: `linear-gradient(180deg, transparent 0%, rgba(10,20,40,0.88) 50%, rgba(10,20,40,0.97) 100%)` },
                      },
                    }}
                  >
                    {/* 背景图 */}
                    <Box
                      className="card-bg"
                      component="img"
                      src={card.bgImage}
                      alt={card.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.22)',
                        transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        zIndex: 0,
                      }}
                    />
                    {/* 渐变遮罩 */}
                    <Box
                      className="card-overlay"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, transparent 0%, rgba(10,20,40,0.75) 45%, rgba(10,20,40,0.95) 100%)',
                        zIndex: 1,
                        transition: 'all 0.35s ease',
                      }}
                    />
                    {/* 顶部图标 — 实色背景+白色图标 */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 24,
                        left: 28,
                        zIndex: 2,
                        width: 44,
                        height: 44,
                        borderRadius: '8px',
                        bgcolor: `${card.accent}E0`,
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${card.accent}`,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 2px 8px ${card.accent}50`,
                      }}
                    >
                      {card.icon}
                    </Box>
                    {/* 标签角标 — 实色背景+白色文字，突出可读性 */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 24,
                        right: 20,
                        zIndex: 2,
                        px: 2,
                        py: 0.6,
                        borderRadius: '6px',
                        bgcolor: card.accent,
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        letterSpacing: 1.5,
                        boxShadow: `0 2px 12px ${card.accent}60`,
                      }}
                    >
                      {card.tag}
                    </Box>
                    {/* 底部内容区 */}
                    <Box sx={{ position: 'relative', zIndex: 2, p: { xs: 3, lg: 3.5 } }}>
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          letterSpacing: 2.5,
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.85)',
                          mb: 1,
                          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                        }}
                      >
                        {card.subtitle}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: '#FFFFFF',
                          fontSize: { xs: '1.1rem', lg: '1.2rem' },
                          lineHeight: 1.4,
                          letterSpacing: 0.5,
                          mb: 1.5,
                          textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                        }}
                      >
                        {settings[`endorse${idx + 1}_title`] || card.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,0.75)',
                          fontSize: '0.85rem',
                          lineHeight: 1.7,
                        }}
                      >
                        {settings[`endorse${idx + 1}_desc`] || card.desc}
                      </Typography>
                    </Box>
                  </Box>
                </FadeInSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════ 屏3 五大产品系列 — 莫兰迪微渐变+动态JS效果 ═══════ */}
      <Box
        id="products-section"
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(180deg, #F0F4F8 0%, #E8ECF1 50%, #F0F4F8 100%)`,
          '@keyframes gradientShift': {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
          },
          '@keyframes ringSpin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
          '@keyframes ringSpinReverse': {
            '0%': { transform: 'rotate(360deg)' },
            '100%': { transform: 'rotate(0deg)' },
          },
          '@keyframes floatOrb': {
            '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: 0.06 },
            '50%': { transform: 'translateY(-12px) scale(1.05)', opacity: 0.1 },
          },
          '@keyframes shimmer': {
            '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
            '100%': { transform: 'translateX(220%) skewX(-20deg)' },
          },
        }}
      >
        {/* 微妙的几何点阵 */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${V2_COLORS.primary.main}06 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* 标题 */}
          <FadeInSection>
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 9 } }}>
              <Typography
                sx={{
                  color: V2_COLORS.text.secondary,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                  mb: 2.5,
                }}
              >
                05 PRODUCT SERIES
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: V2_COLORS.primary.dark,
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2,
                  letterSpacing: -0.5,
                  lineHeight: 1.2,
                }}
              >
                五大产品系列
              </Typography>
              <Typography sx={{ color: V2_COLORS.text.secondary, fontSize: '1.05rem', maxWidth: 440, mx: 'auto' }}>
                覆盖水土保持监测全场景
              </Typography>
            </Box>
          </FadeInSection>

          {/* 五大产品卡片 — 莫兰迪微渐变+动态效果 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(5, 1fr)',
              },
              gap: { xs: 2.5, md: 3.5, lg: 4 },
            }}
          >
            {categories.map((cat, idx) => {
              const colorSet = categoryColors[idx % categoryColors.length];
              const grad = gradientColors[idx] || gradientColors[0];
              // 每张卡片独特的动画延迟，形成波浪感
              const animDelay = idx * 1.2;
              return (
                <FadeInSection key={cat.id} delay={idx * 0.08}>
                  <Box
                    component={Link}
                    to={`/products?category=${catIdToSlug[cat.id] || cat.slug}`}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      textDecoration: 'none',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      bgcolor: '#fff',
                      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: 340,
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: `0 28px 64px rgba(15,43,71,0.14)`,
                        borderColor: `${colorSet.main}20`,
                        '& .product-header-bg': {
                          transform: 'scale(1.06)',
                        },
                        '& .product-icon-box': {
                          transform: 'scale(1.12) translateY(-4px)',
                          bgcolor: 'rgba(255,255,255,0.32)',
                        },
                        '& .shimmer-line': {
                          animation: `shimmer 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                        },
                        '& .product-arrow': {
                          transform: 'translateX(6px)',
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    {/* hover 光带扫过效果 — 绝对定位遮罩 */}
                    <Box
                      className="shimmer-line"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '40%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                        zIndex: 10,
                        pointerEvents: 'none',
                        opacity: 0,
                      }}
                    />

                    {/* 顶部微渐变封面 */}
                    <Box
                      sx={{
                        height: { xs: 160, md: 180, lg: 200 },
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {/* 渐变背景 — 比原来更 subtle */}
                      <Box
                        className="product-header-bg"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(${grad.angle}deg, ${grad.from} 0%, ${grad.to} 100%)`,
                          backgroundSize: '200% 200%',
                          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />

                      {/* 动态浮动大圆 — 缓慢呼吸 */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '-20%',
                          left: '-15%',
                          width: '80%',
                          height: '120%',
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.04)',
                          animation: `floatOrb ${6 + idx * 0.5}s ease-in-out infinite`,
                          animationDelay: `${animDelay}s`,
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '-30%',
                          right: '-20%',
                          width: '70%',
                          height: '100%',
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.03)',
                          animation: `floatOrb ${7 + idx * 0.3}s ease-in-out infinite`,
                          animationDelay: `${animDelay + 0.5}s`,
                        }}
                      />

                      {/* 同心圆环 — 缓慢反向旋转 */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 24,
                          right: 28,
                          opacity: 0.12,
                          animation: `ringSpinReverse ${20 + idx * 3}s linear infinite`,
                        }}
                      >
                        <svg width="80" height="80" viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="36" fill="none" stroke="#fff" strokeWidth="1.5" />
                          <circle cx="40" cy="40" r="22" fill="none" stroke="#fff" strokeWidth="1" />
                        </svg>
                      </Box>
                      {/* 小圆环 — 正向旋转 */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 20,
                          left: 24,
                          opacity: 0.08,
                          animation: `ringSpin ${15 + idx * 2}s linear infinite`,
                        }}
                      >
                        <svg width="50" height="50" viewBox="0 0 50 50">
                          <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" strokeWidth="1" />
                        </svg>
                      </Box>

                      {/* 对角虚线 — 静态 but subtle */}
                      <Box sx={{ position: 'absolute', bottom: 28, right: 28, opacity: 0.06 }}>
                        <svg width="40" height="40" viewBox="0 0 40 40">
                          <line x1="0" y1="40" x2="40" y2="0" stroke="#fff" strokeWidth="1.5" />
                          <line x1="8" y1="40" x2="40" y2="8" stroke="#fff" strokeWidth="1" />
                        </svg>
                      </Box>

                      {/* 图标 — 毛玻璃但更小更克制 */}
                      <Box
                        className="product-icon-box"
                        sx={{
                          position: 'relative',
                          zIndex: 1,
                          width: { xs: 56, md: 64, lg: 72 },
                          height: { xs: 56, md: 64, lg: 72 },
                          borderRadius: '18px',
                          background: 'rgba(255,255,255,0.18)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        }}
                      >
                        {categoryIcons[cat.icon] || <CloudIcon sx={{ fontSize: { xs: 28, md: 32, lg: 36 } }} />}
                      </Box>
                    </Box>

                    {/* 底部信息区 */}
                    <Box sx={{ p: { xs: 3.5, lg: 4 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#1A1A2E',
                          fontSize: { xs: '1.05rem', lg: '1.12rem' },
                          mb: 1.2,
                          letterSpacing: -0.2,
                          lineHeight: 1.4,
                        }}
                      >
                        {cat.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6B7280',
                          lineHeight: 1.75,
                          mb: 2.5,
                          fontSize: { xs: '0.86rem', lg: '0.9rem' },
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {cat.desc}
                      </Typography>

                      {/* 底部操作行 — 更克制 */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          pt: 2,
                          borderTop: '1px solid rgba(0,0,0,0.04)',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 0.7, alignItems: 'center' }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: grad.from, opacity: 0.6 }} />
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: grad.to, opacity: 0.35 }} />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: colorSet.main,
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            gap: 0.3,
                            opacity: 0.6,
                            transition: 'opacity 0.3s',
                            '&:hover': { opacity: 1 },
                          }}
                        >
                          查看详情
                          <ArrowRightAltIcon
                            className="product-arrow"
                            sx={{
                              fontSize: 18,
                              transition: 'all 0.3s ease',
                              opacity: 0.5,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </FadeInSection>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* ═══════ 屏4 数据背书 — 深蓝沉浸式+金色高亮大数字 ═══════ */}
      <Box
        id="data-section"
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(160deg, ${V2_COLORS.primary.dark} 0%, #0A1929 40%, #0D2137 70%, ${V2_COLORS.primary.main} 100%)`,
        }}
      >
        {/* 顶部柔和波浪过渡 */}
        <Box
          sx={{
            position: 'absolute',
            top: -1,
            left: 0,
            right: 0,
            height: { xs: 60, md: 100 },
            zIndex: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: `linear-gradient(180deg, #F0F4F8, ${V2_COLORS.primary.dark})`,
            }}
          />
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          >
            <path
              d="M0,0 L0,30 Q240,80 480,50 Q720,20 960,55 Q1200,90 1440,40 L1440,0 Z"
              fill="#F0F4F8"
            />
          </svg>
        </Box>

        {/* 金色光晕 — 独特记忆点 */}
        <Box sx={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(212,134,42,0.06) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
        {/* 菱形装饰 */}
        <Box sx={{ position: 'absolute', top: '10%', right: '8%', width: 120, height: 120, border: `1px solid rgba(212,134,42,0.1)`, transform: 'rotate(45deg)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', bottom: '15%', left: '5%', width: 80, height: 80, border: `1px solid rgba(58,143,92,0.08)`, transform: 'rotate(45deg)', pointerEvents: 'none', zIndex: 0 }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 4, md: 6 } }}>
          {/* 标题 — 右对齐+横线装饰 */}
          <FadeInSection>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, mb: { xs: 4, md: 6 } }}>
              <Box sx={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.08))` }} />
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  sx={{
                    color: V2_COLORS.accent.light,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: 4,
                    mb: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  STRENGTH DATA
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: { xs: '2rem', md: '2.8rem' },
                    letterSpacing: 1,
                  }}
                >
                  实力数据
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 5,
                  height: 60,
                  borderRadius: 3,
                  background: `linear-gradient(180deg, ${V2_COLORS.accent.main}, transparent)`,
                }}
              />
            </Box>
          </FadeInSection>

          {/* 【P1修复】数据区 — 超大数字+更宽松间距，震撼力拉满 */}
          <Grid container spacing={{ xs: 2, md: 6 }} justifyContent="center">
            {stats.map((item, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <FadeInSection delay={idx * 0.15}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: { xs: 5, md: 7 },
                      px: { xs: 2, md: 4 },
                      position: 'relative',
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        '& .stat-glow': {
                          opacity: 1,
                        },
                        '& .stat-icon-wrap': {
                          transform: 'scale(1.15)',
                          borderColor: `${V2_COLORS.accent.main}60`,
                          boxShadow: `0 0 20px rgba(212,134,42,0.15)`,
                        },
                      },
                    }}
                  >
                    {/* 悬停光晕 */}
                    <Box
                      className="stat-glow"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(212,134,42,0.1) 0%, transparent 70%)`,
                        opacity: 0,
                        transition: 'opacity 0.4s ease',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* 图标 */}
                    <Box
                      className="stat-icon-wrap"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        border: `1.5px solid rgba(255,255,255,0.12)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: V2_COLORS.accent.light,
                        mx: 'auto',
                        mb: 3,
                        transition: 'all 0.4s ease',
                      }}
                    >
                      {item.icon}
                    </Box>

                    {/* 数字 — 超大字号 */}
                    <Box sx={{ mb: 2 }}>
                      <CountUpNumber end={item.end} suffix={item.suffix} label={item.label} dark={false} />
                    </Box>
                  </Box>
                </FadeInSection>
              </Grid>
            ))}
          </Grid>

          {/* 底部信任标签 — 金色小圆点 */}
          <FadeInSection delay={0.4}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: { xs: 2, md: 4 },
                mt: 8,
                flexWrap: 'wrap',
              }}
            >
              {[
                { icon: <SecurityIcon sx={{ fontSize: 20 }} />, text: 'CMA权威认证' },
                { icon: <TrendingUpIcon sx={{ fontSize: 20 }} />, text: '14年行业深耕' },
                { icon: <HubIcon sx={{ fontSize: 20 }} />, text: '全国重点实验室' },
                { icon: <RocketLaunchIcon sx={{ fontSize: 20 }} />, text: '20+省份覆盖' },
              ].map((tag, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '0.82rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(212,134,42,0.25)',
                      color: 'rgba(255,255,255,0.7)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: V2_COLORS.accent.main,
                      opacity: 0.6,
                    },
                  }}
                >
                  {tag.icon}
                  {tag.text}
                </Box>
              ))}
            </Box>
          </FadeInSection>
        </Container>
      </Box>

      {/* ═══════ 屏5 合作号召 — 暖色渐变背景+大字情感冲击 ═══════ */}
      <Box
        id="cta-section"
        sx={{
          py: 0,
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 520, md: 640 },
          display: 'flex',
          alignItems: 'center',
          /* 【P2修复】暖色渐变 — 从深棕橙到暗金，彻底脱离深蓝 */
          background: `linear-gradient(160deg, #1A0F05 0%, #2D1810 30%, #3B2015 50%, #1A0F05 100%)`,
        }}
      >
        {/* 暖色大光晕 — 中心发散 */}
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,134,42,0.1) 0%, rgba(184,111,31,0.05) 40%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* 暖色动态光线 — 从左到右 */}
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${20 + i * 15}%`,
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent 0%, rgba(212,134,42,${0.03 + i * 0.01}) 30%, rgba(245,197,99,${0.04 + i * 0.01}) 50%, rgba(212,134,42,${0.03 + i * 0.01}) 70%, transparent 100%)`,
              zIndex: 0,
            }}
          />
        ))}

        {/* 底部光条 — 暖色系 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${V2_COLORS.accent.main}, #F5C563, ${V2_COLORS.success.main}, ${V2_COLORS.accent.main})`,
            zIndex: 1,
          }}
        />

        {/* 顶部柔和波浪过渡 — 从数据区深蓝到CTA暖色 */}
        <Box
          sx={{
            position: 'absolute',
            top: -1,
            left: 0,
            right: 0,
            height: { xs: 60, md: 100 },
            zIndex: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: `linear-gradient(180deg, ${V2_COLORS.primary.dark}, #1A0F05)`,
            }}
          />
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          >
            <path
              d="M0,0 L0,40 Q360,90 720,50 Q1080,10 1440,60 L1440,0 Z"
              fill={V2_COLORS.primary.dark}
            />
          </svg>
        </Box>

        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <FadeInSection>
            {/* 顶部标签 */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                px: 3,
                py: 0.8,
                mb: 6,
                borderRadius: 30,
                border: '1px solid rgba(212,134,42,0.25)',
                bgcolor: 'rgba(212,134,42,0.08)',
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: V2_COLORS.accent.main, boxShadow: `0 0 8px ${V2_COLORS.accent.main}` }} />
              <Typography sx={{ color: V2_COLORS.accent.light, fontSize: '0.8rem', letterSpacing: 3, fontWeight: 500 }}>
                COOPERATION
              </Typography>
            </Box>

            {/* 大字标题 — 逐行渐变 */}
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 900,
                fontSize: { xs: '2.4rem', md: '3.6rem', lg: '4rem' },
                mb: 1,
                lineHeight: 1.2,
                letterSpacing: 2,
              }}
            >
              欢迎科研人员
            </Typography>
            <Typography
              sx={{
                background: `linear-gradient(135deg, ${V2_COLORS.accent.light} 0%, #F5C563 50%, ${V2_COLORS.accent.light} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
                fontSize: { xs: '2.4rem', md: '3.6rem', lg: '4rem' },
                mb: 3,
                lineHeight: 1.2,
                letterSpacing: 2,
              }}
            >
              带技术和资金加盟合作
            </Typography>

            {/* 副标题 */}
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 6, fontSize: '1.1rem', letterSpacing: 3, fontWeight: 300 }}>
              共创水土保持智能监测新未来
            </Typography>

            {/* CTA 按钮 */}
            <Button
              variant="contained"
              size="large"
              onClick={() => setInquiryOpen(true)}
              component={motion.button}
              whileHover={{ scale: MOTION.BTN_HOVER_SCALE }}
              sx={{
                bgcolor: V2_COLORS.accent.main,
                color: '#fff',
                px: 8,
                py: 2.2,
                borderRadius: 2.5,
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: 3,
                boxShadow: `0 8px 40px rgba(212,134,42,0.5), 0 0 80px rgba(212,134,42,0.15)`,
                '&:hover': {
                  bgcolor: V2_COLORS.accent.dark,
                  boxShadow: `0 12px 50px rgba(212,134,42,0.6), 0 0 100px rgba(212,134,42,0.2)`,
                },
              }}
            >
              立即咨询
            </Button>

            {/* 底部信任背书 */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: { xs: 3, md: 5 },
                mt: 8,
                flexWrap: 'wrap',
              }}
            >
              {['CMA权威认证', '全国重点实验室', '20+省份覆盖', '14年行业深耕'].map((text, i) => (
                <Typography
                  key={i}
                  sx={{
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: '0.82rem',
                    letterSpacing: 1,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: V2_COLORS.accent.main,
                      opacity: 0.5,
                    },
                  }}
                >
                  {text}
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
