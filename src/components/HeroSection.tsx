import { Box, Typography, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

export default function HeroSection() {
  const scrollToContent = () => {
    const hero = document.getElementById('hero-section');
    if (hero) {
      const nextElement = hero.nextElementSibling;
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Box
      id="hero-section"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${V2_COLORS.primary.main} 0%, ${V2_COLORS.secondary.main} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 装饰性背景元素 */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: { xs: 300, md: 500 },
          height: { xs: 300, md: 500 },
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: { xs: 200, md: 400 },
          height: { xs: 200, md: 400 },
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h1"
          sx={{
            color: '#fff',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.2rem' },
            fontWeight: 700,
            mb: 3,
            lineHeight: 1.3,
            letterSpacing: 2,
          }}
        >
          守护水土生态·智造绿色未来
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
            fontWeight: 400,
            mb: 5,
            letterSpacing: 1,
          }}
        >
          水土保持智能监测全链条服务商
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            href="/about"
            sx={{
              color: '#fff',
              borderColor: '#fff',
              borderWidth: 2,
              px: 4,
              py: 1.2,
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                borderColor: '#fff',
                bgcolor: 'rgba(255,255,255,0.1)',
                borderWidth: 2,
              },
            }}
          >
            了解更多
          </Button>
          <Button
            variant="contained"
            href="/cooperation"
            component={motion.button}
            whileHover={{ scale: MOTION.BTN_HOVER_SCALE }}
            sx={{
              bgcolor: V2_COLORS.secondary.main,
              color: '#fff',
              px: 4,
              py: 1.2,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: V2_COLORS.secondary.dark,
                boxShadow: MOTION.BTN_SHADOW_HOVER,
              },
            }}
          >
            联系我们
          </Button>
        </Box>
      </Container>

      {/* 滚动指示箭头 */}
      <Box
        onClick={scrollToContent}
        sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          animation: 'bounce 2s infinite',
          '@keyframes bounce': {
            '0%, 20%, 50%, 80%, 100%': { transform: 'translateX(-50%) translateY(0)' },
            '40%': { transform: 'translateX(-50%) translateY(-10px)' },
            '60%': { transform: 'translateX(-50%) translateY(-5px)' },
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255,255,255,0.6)', mb: 0.5, fontSize: '0.75rem' }}
        >
          向下滚动
        </Typography>
        <KeyboardArrowDownIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 28 }} />
      </Box>
    </Box>
  );
}
