/**
 * V2动效参数常量定义
 * 统一管理杨凌三智官网V2版本的动画与过渡效果规范
 */
export const MOTION = {
  CARD_HOVER_SCALE: 1.01,
  CARD_HOVER_SHADOW: 8,
  CARD_BORDER_TRANSITION: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  BTN_HOVER_SCALE: 1.03,
  BTN_SHADOW_HOVER: '0 4px 20px rgba(0, 0, 0, 0.15)',
  SCROLL_THRESHOLD: 50,
  NAV_TRANSITION: 'all 0.3s ease',
  FADE_UP: {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  DRAWER_DURATION: 0.3,
  IMG_HOVER_SCALE: 1.05,
} as const;
