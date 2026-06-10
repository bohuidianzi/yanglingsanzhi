import React from 'react';
import { Card, CardProps, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { MOTION } from '../theme/motion';

/** AnimatedCard组件属性定义 */
export interface AnimatedCardProps extends CardProps {
  /** hover时的缩放比例，默认1.01 */
  hoverScale?: number;
  /** hover时的边框颜色，默认primary.main */
  hoverBorderColor?: string;
  /** 是否启用边框动画，默认true */
  enableBorderAnim?: boolean;
}

/**
 * 统一卡片hover动效组件
 * 封装MUI Card + framer-motion motion.div
 * hover时: 边框色变化 + 微缩放 + boxShadow增强
 */
const AnimatedCard: React.FC<AnimatedCardProps> = ({
  hoverScale = MOTION.CARD_HOVER_SCALE,
  hoverBorderColor,
  enableBorderAnim = true,
  children,
  sx,
  ...rest
}) => {
  const theme = useTheme();
  const borderColor = hoverBorderColor ?? theme.palette.primary.main;

  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          border: enableBorderAnim ? '2px solid transparent' : undefined,
          transition: MOTION.CARD_BORDER_TRANSITION,
          '&:hover': {
            ...(enableBorderAnim ? { borderColor } : {}),
            boxShadow: MOTION.CARD_HOVER_SHADOW,
          },
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;
