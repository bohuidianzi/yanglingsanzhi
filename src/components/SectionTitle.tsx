import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  /** 是否启用增强装饰线，默认true */
  decorated?: boolean;
}

export default function SectionTitle({ title, subtitle, align = 'center', decorated = true }: SectionTitleProps) {
  return (
    <motion.div {...MOTION.FADE_UP}>
      <Box sx={{ mb: 4, textAlign: align }}>
        <Typography
          variant="h2"
          sx={{
            color: V2_COLORS.primary.main,
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
            fontWeight: 700,
            mb: 1,
          }}
        >
          {title}
        </Typography>
        {/* 装饰线 — 渐变色 + 两侧扩展线 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: align === 'center' ? 'center' : 'flex-start',
            mb: subtitle ? 2 : 0,
          }}
        >
          {decorated && (
            <Box
              sx={{
                width: 24,
                height: 2,
                bgcolor: V2_COLORS.primary.light,
                opacity: 0.3,
                borderRadius: 1,
              }}
            />
          )}
          <Box
            sx={{
              width: 60,
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${V2_COLORS.primary.main}, ${V2_COLORS.secondary.main})`,
              mx: decorated ? 0.5 : 0,
            }}
          />
          {decorated && (
            <Box
              sx={{
                width: 24,
                height: 2,
                bgcolor: V2_COLORS.secondary.main,
                opacity: 0.3,
                borderRadius: 1,
              }}
            />
          )}
        </Box>
        {subtitle && (
          <Typography
            variant="body1"
            sx={{
              color: V2_COLORS.text.secondary,
              fontSize: { xs: '0.9rem', md: '1rem' },
              maxWidth: 600,
              mx: align === 'center' ? 'auto' : 0,
              lineHeight: 1.8,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
}
