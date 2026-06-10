import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Container, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';
import { heroSlideApi, type HeroSlide } from '../api/heroSlides';

interface SlideData {
  image: string;
  title: string;
  subtitle: string;
  desc: string;
  fallback: string;
  link?: string;
  linkText?: string;
}

/** 默认5张Hero背景图（API加载失败时兜底） */
const DEFAULT_SLIDES: SlideData[] = [
  {
    image: '/images/hero/slide-1.jpg',
    title: '守护水土生态',
    subtitle: '智造绿色未来',
    desc: '水土保持智能监测全链条解决方案，守护每一片山川',
    // 黄土高原/梯田农业 — 与"守护水土"高度匹配
    fallback: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
    link: '/products',
    linkText: '探索产品',
  },
  {
    image: '/images/hero/slide-2.jpg',
    title: '精准监测',
    subtitle: '科学治理',
    desc: '传感器 → 数据采集 → 云平台，毫米级精度实时掌控侵蚀动态',
    // 科技数据分析/监测仪表 — 与"精准监测"高度匹配
    fallback: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1920&q=80',
    link: '/products',
    linkText: '查看设备',
  },
  {
    image: '/images/hero/slide-3.jpg',
    title: '覆盖全国',
    subtitle: '20+省份服务',
    desc: '黄土高原、东北黑土、南方红壤、西北盐碱地，全场景监测方案',
    // 大地俯瞰/自然景观 — 与"覆盖全国"匹配
    fallback: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80',
    link: '/cases',
    linkText: '查看案例',
  },
  {
    image: '/images/hero/slide-4.jpg',
    title: '科技创新',
    subtitle: '权威认证',
    desc: '22项专利技术，CMA权威认证，水利部推广目录，以科技实力赢信任',
    // 科研实验室/高科技场景 — 与"科技创新"匹配
    fallback: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&q=80',
    link: '/technology',
    linkText: '了解技术',
  },
  {
    image: '/images/hero/slide-5.jpg',
    title: '开放合作',
    subtitle: '携手共创未来',
    desc: '科研人员带技术加盟 · 区域代理 · 项目合作，共建水土保持新生态',
    // 握手/合作商务场景 — 与"开放合作"匹配
    fallback: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80',
    link: '/cooperation',
    linkText: '立即合作',
  },
];

/** 将API数据转成HeroCarousel需要的格式 */
function mapSlide(s: HeroSlide): SlideData {
  return {
    image: s.image_url,
    title: s.title,
    subtitle: s.subtitle,
    desc: s.description,
    fallback: s.fallback_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
    link: s.link_url || '',
    linkText: s.link_text || '',
  };
}

// Props are defined inline in the component signature

/** 浮动粒子 — 更精致的光点效果 */
function FloatingParticles() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,255,255,${p.opacity + 0.2}) 0%, rgba(255,255,255,0) 70%)`,
            boxShadow: `0 0 ${p.size * 3}px rgba(255,255,255,${p.opacity * 0.5})`,
          }}
        />
      ))}
    </Box>
  );
}

/** 装饰性扫描线 */
function ScanLines() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.008) 2px,
          rgba(255,255,255,0.008) 4px
        )`,
        pointerEvents: 'none',
      }}
    />
  );
}

export default function HeroCarousel({ slides: propSlides, interval = 6000 }: { slides?: SlideData[]; interval?: number }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [, setImageLoaded] = useState<Record<number, boolean>>({});
  const [apiSlides, setApiSlides] = useState<SlideData[] | null>(null);

  // 从后台加载Hero数据
  useEffect(() => {
    heroSlideApi.getList()
      .then((res: any) => {
        if (res.data?.data?.length > 0) {
          setApiSlides(res.data.data.map(mapSlide));
        }
      })
      .catch(() => {
        // API失败时使用默认数据
      });
  }, []);

  const slides = propSlides || apiSlides || DEFAULT_SLIDES;

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent(() => {
      let next = index;
      if (next < 0) next = slides.length - 1;
      if (next >= slides.length) next = 0;
      return next;
    });
  }, [slides.length]);

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prevSlide = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval]);

  const scrollToContent = () => {
    const el = document.getElementById('hero-section');
    if (el?.nextElementSibling) {
      el.nextElementSibling.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const slide = slides[current];

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 100 : -100, scale: 1.1 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -100 : 100, scale: 0.95 }),
  };

  return (
    <Box
      id="hero-section"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: V2_COLORS.primary.dark,
      }}
    >
      {/* ═══ 背景图片层 ═══ */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        >
          <Box
            component="img"
            src={slide.image}
            alt={slide.title}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (img.src !== slide.fallback) {
                img.src = slide.fallback;
              }
              setImageLoaded((p) => ({ ...p, [current]: true }));
            }}
            onLoad={() => setImageLoaded((p) => ({ ...p, [current]: true }))}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.35) saturate(1.3) contrast(1.1)',
              transform: 'scale(1.05)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ═══ 多层渐变遮罩 — 更有深度 ═══ */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, background: `linear-gradient(180deg, rgba(8,27,48,0.7) 0%, rgba(15,43,71,0.3) 35%, rgba(15,43,71,0.4) 65%, rgba(8,27,48,0.9) 100%)` }} />
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, background: `radial-gradient(ellipse at 25% 50%, rgba(30,77,115,0.25) 0%, transparent 55%)` }} />
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, background: `radial-gradient(ellipse at 75% 30%, rgba(212,134,42,0.06) 0%, transparent 40%)` }} />

      {/* 扫描线质感 */}
      <ScanLines />

      {/* 浮动粒子 */}
      <FloatingParticles />

      {/* ═══ 顶部渐变装饰条 ═══ */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${V2_COLORS.accent.main}, ${V2_COLORS.success.main}, ${V2_COLORS.secondary.light}, ${V2_COLORS.accent.main})`, zIndex: 5 }} />

      {/* ═══ 装饰性光晕 — 更大更柔 ═══ */}
      <Box sx={{ position: 'absolute', top: '-25%', right: '-15%', width: { xs: 400, md: 700 }, height: { xs: 400, md: 700 }, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,134,42,0.1) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 2 }} />
      <Box sx={{ position: 'absolute', bottom: '-20%', left: '-10%', width: { xs: 300, md: 600 }, height: { xs: 300, md: 600 }, borderRadius: '50%', background: 'radial-gradient(circle, rgba(58,143,92,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 2 }} />
      {/* 中央顶部微光 */}
      <Box sx={{ position: 'absolute', top: '10%', left: '40%', width: { xs: 200, md: 400 }, height: { xs: 200, md: 400 }, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,77,115,0.12) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* ═══ 文字内容 — 更大更醒目 ═══ */}
      <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative', zIndex: 3 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${current}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* 顶部标签 */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                px: 3.5,
                py: 1,
                mb: 5,
                borderRadius: 30,
                border: '1px solid rgba(255,255,255,0.2)',
                bgcolor: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: V2_COLORS.accent.main,
                  boxShadow: `0 0 10px ${V2_COLORS.accent.main}`,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.6, transform: 'scale(1.3)' },
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', letterSpacing: 3, fontWeight: 500, fontSize: '0.8rem' }}>
                水土保持智能监测领军者
              </Typography>
            </Box>

            {/* 主标题 — 巨型字体 */}
            <Typography
              sx={{
                color: '#fff',
                fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem', lg: '6.5rem' },
                fontWeight: 900,
                lineHeight: 1.08,
                mb: 2,
                letterSpacing: 4,
                textShadow: '0 4px 40px rgba(0,0,0,0.5), 0 0 80px rgba(15,43,71,0.3)',
              }}
            >
              {slide.title}
            </Typography>

            {/* 副标题 — 橙金渐变 */}
            <Typography
              sx={{
                background: `linear-gradient(135deg, ${V2_COLORS.accent.light} 0%, #F0B860 50%, ${V2_COLORS.accent.light} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.8rem', lg: '4.2rem' },
                fontWeight: 300,
                lineHeight: 1.15,
                mb: 3,
                letterSpacing: 8,
              }}
            >
              {slide.subtitle}
            </Typography>

            {/* 描述文字 */}
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 400,
                mb: 6,
                letterSpacing: 2,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              {slide.desc}
            </Typography>

            {/* CTA 按钮 — 更大气 */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                href="/about"
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.35)',
                  borderWidth: 2,
                  px: 6,
                  py: 1.8,
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  borderRadius: 2.5,
                  backdropFilter: 'blur(8px)',
                  letterSpacing: 2,
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    borderWidth: 2,
                  },
                }}
              >
                了解更多
              </Button>
              <Button
                variant="contained"
                href={slide.link || '/cooperation'}
                component={motion.button}
                whileHover={{ scale: MOTION.BTN_HOVER_SCALE }}
                sx={{
                  bgcolor: V2_COLORS.accent.main,
                  color: '#fff',
                  px: 6,
                  py: 1.8,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  boxShadow: `0 6px 30px rgba(212,134,42,0.45), 0 0 60px rgba(212,134,42,0.15)`,
                  letterSpacing: 2,
                  '&:hover': {
                    bgcolor: V2_COLORS.accent.dark,
                    boxShadow: `0 8px 40px rgba(212,134,42,0.55), 0 0 80px rgba(212,134,42,0.2)`,
                  },
                }}
              >
                {slide.linkText || '联系我们'}
              </Button>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Container>

      {/* ═══ 左右切换箭头 — 更精致 ═══ */}
      <IconButton
        onClick={prevSlide}
        sx={{
          position: 'absolute',
          left: { xs: 12, md: 40 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 4,
          color: '#fff',
          bgcolor: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          width: 56,
          height: 56,
          borderRadius: 2.5,
          border: '1px solid rgba(255,255,255,0.12)',
          transition: 'all 0.3s ease',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' },
        }}
      >
        <KeyboardArrowLeftIcon sx={{ fontSize: 30 }} />
      </IconButton>
      <IconButton
        onClick={next}
        sx={{
          position: 'absolute',
          right: { xs: 12, md: 40 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 4,
          color: '#fff',
          bgcolor: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          width: 56,
          height: 56,
          borderRadius: 2.5,
          border: '1px solid rgba(255,255,255,0.12)',
          transition: 'all 0.3s ease',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' },
        }}
      >
        <KeyboardArrowRightIcon sx={{ fontSize: 30 }} />
      </IconButton>

      {/* ═══ 底部指示器 — 更精致 ═══ */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}
      >
        {slides.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => goTo(idx, idx > current ? 1 : -1)}
            sx={{
              width: idx === current ? 48 : 14,
              height: 14,
              borderRadius: 7,
              bgcolor: idx === current ? V2_COLORS.accent.main : 'rgba(255,255,255,0.25)',
              cursor: 'pointer',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: idx === current ? `0 0 16px rgba(212,134,42,0.4)` : 'none',
              '&:hover': { bgcolor: idx === current ? V2_COLORS.accent.main : 'rgba(255,255,255,0.5)' },
            }}
          />
        ))}
      </Box>

      {/* ═══ 底部快速数据条 ═══ */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 4,
          bgcolor: 'rgba(8,27,48,0.7)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          py: 1.5,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 4, md: 8 }, flexWrap: 'wrap' }}>
            {[
              { num: '22+', label: '专利技术' },
              { num: '5', label: '产品系列' },
              { num: '20+', label: '省份推广' },
              { num: '14', label: '年深耕' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                <Typography sx={{ color: V2_COLORS.accent.light, fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, letterSpacing: 1 }}>
                  {item.num}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: 1 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 滚动指示 */}
      <Box
        onClick={scrollToContent}
        sx={{
          position: 'absolute',
          bottom: 56,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: 4,
          animation: 'bounce 2s infinite',
          '@keyframes bounce': {
            '0%, 20%, 50%, 80%, 100%': { transform: 'translateX(-50%) translateY(0)' },
            '40%': { transform: 'translateX(-50%) translateY(-10px)' },
            '60%': { transform: 'translateX(-50%) translateY(-5px)' },
          },
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', mb: 0.5, fontSize: '0.65rem', letterSpacing: 3 }}>
          SCROLL
        </Typography>
        <KeyboardArrowDownIcon sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 22 }} />
      </Box>
    </Box>
  );
}
