import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

interface PageBannerProps {
  /** 页面标题 */
  title: string;
  /** 副标题 */
  subtitle?: string;
  /** 背景图片URL（优先本地，fallback网络图） */
  backgroundImage?: string;
  /** 网络fallback图 */
  fallbackImage?: string;
  /** 遮罩层渐变方向 */
  gradientDirection?: string;
}

/**
 * 统一内页Banner组件
 * 每个栏目页面顶部使用，配主题相关背景图+渐变遮罩+标题
 */
export default function PageBanner({
  title,
  subtitle,
  backgroundImage,
  fallbackImage,
  gradientDirection = '135deg',
}: PageBannerProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        overflow: 'hidden',
        minHeight: { xs: 240, md: 320 },
        display: 'flex',
        alignItems: 'center',
        bgcolor: V2_COLORS.primary.main,
      }}
    >
      {/* 背景图片层 */}
      {(backgroundImage || fallbackImage) && (
        <Box
          component="img"
          src={backgroundImage || fallbackImage}
          alt={title}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (fallbackImage && img.src !== fallbackImage) {
              img.src = fallbackImage;
            }
          }}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.4)',
            zIndex: 0,
          }}
        />
      )}

      {/* 渐变遮罩层 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `linear-gradient(${gradientDirection}, rgba(15,43,71,0.8) 0%, rgba(30,77,115,0.65) 50%, rgba(15,43,71,0.75) 100%)`,
        }}
      />

      {/* 装饰光晕 */}
      <Box
        sx={{
          position: 'absolute',
          top: '-30%',
          right: '-5%',
          width: { xs: 200, md: 400 },
          height: { xs: 200, md: 400 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,134,42,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-5%',
          width: { xs: 150, md: 300 },
          height: { xs: 150, md: 300 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(58,143,92,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* 装饰性粒子线 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          opacity: 0.06,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />

      {/* 文字内容 */}
      <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <motion.div {...MOTION.FADE_UP}>
          <Typography
            variant="h2"
            sx={{
              color: '#fff',
              fontWeight: 700,
              mb: 1.5,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              letterSpacing: 2,
            }}
          >
            {title}
          </Typography>
          {/* 标题下方装饰线 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: subtitle ? 2 : 0,
            }}
          >
            <Box sx={{ width: 20, height: 2, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
            <Box
              sx={{
                width: 50,
                height: 3,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${V2_COLORS.accent.main}, ${V2_COLORS.success.light})`,
                mx: 0.5,
              }}
            />
            <Box sx={{ width: 20, height: 2, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
          </Box>
          {subtitle && (
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: { xs: '0.95rem', md: '1.2rem' },
                fontWeight: 400,
                letterSpacing: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </motion.div>
      </Container>
    </Box>
  );
}
