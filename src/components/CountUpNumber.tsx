import { useRef, useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import { useInView } from 'framer-motion';
import { V2_COLORS } from '../theme/colors';

interface CountUpNumberProps {
  end: number;
  suffix?: string;
  label: string;
  /** 是否使用深色模式（白底上显示深色数字） */
  dark?: boolean;
}

export default function CountUpNumber({ end, suffix = '', label, dark = true }: CountUpNumberProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2200;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo for smooth deceleration
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + (end - startValue) * eased);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end]);

  return (
    <Box ref={ref} sx={{ textAlign: 'center', py: 1 }}>
      <Typography
        variant="h3"
        sx={{
          color: dark ? V2_COLORS.primary.dark : V2_COLORS.accent.light,
          fontWeight: 900,
          /* 【P1修复】数字放大：从3.8rem→5.5rem，震撼力拉满 */
          fontSize: { xs: '3.6rem', md: '5.5rem' },
          mb: 1,
          letterSpacing: -2,
          lineHeight: 1,
        }}
      >
        {count}
        <Box
          component="span"
          sx={{
            color: dark ? V2_COLORS.accent.main : V2_COLORS.accent.light,
            /* suffix同步放大 */
            fontSize: { xs: '2rem', md: '2.8rem' },
            fontWeight: 700,
            ml: 0.5,
          }}
        >
          {suffix}
        </Box>
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: dark ? V2_COLORS.text.secondary : 'rgba(255,255,255,0.5)',
          fontSize: { xs: '0.95rem', md: '1.1rem' },
          fontWeight: 500,
          mt: 1.5,
          letterSpacing: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
