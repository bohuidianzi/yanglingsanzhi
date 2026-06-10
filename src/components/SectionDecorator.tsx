import React from 'react';
import { Box } from '@mui/material';
import { V2_COLORS } from '../theme/colors';

interface SectionDecoratorProps {
  /** 底纹变体：点阵/线条/渐变 */
  variant?: 'dots' | 'lines' | 'gradient';
  /** 透明度 0.03-0.08 */
  opacity?: number;
  /** 位置：顶部/底部/全屏 */
  position?: 'top' | 'bottom' | 'full';
}

/** 板块背景装饰组件 — SVG科技底纹 + 渐变过渡 */
const SectionDecorator: React.FC<SectionDecoratorProps> = ({
  variant = 'dots',
  opacity = 0.05,
  position = 'full',
}) => {
  const positionStyles: Record<string, React.CSSProperties> = {
    top: { top: 0, height: '40%' },
    bottom: { bottom: 0, height: '40%' },
    full: { top: 0, height: '100%' },
  };

  const patternId = `pattern-${variant}-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        ...positionStyles[position],
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ opacity, position: 'absolute', inset: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {variant === 'dots' && (
            <pattern
              id={patternId}
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill={V2_COLORS.primary.main} />
            </pattern>
          )}
          {variant === 'lines' && (
            <pattern
              id={patternId}
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 20 L40 20"
                stroke={V2_COLORS.primary.main}
                strokeWidth="0.5"
                fill="none"
              />
              <path
                d="M20 0 L20 40"
                stroke={V2_COLORS.primary.main}
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          )}
          {variant === 'gradient' && (
            <linearGradient id={patternId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={V2_COLORS.primary.main} stopOpacity="0.08" />
              <stop offset="100%" stopColor={V2_COLORS.secondary.main} stopOpacity="0.04" />
            </linearGradient>
          )}
        </defs>
        {variant === 'gradient' ? (
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        ) : (
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        )}
      </svg>
    </Box>
  );
};

export default SectionDecorator;
