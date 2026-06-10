/**
 * V2色彩体系常量定义
 * 统一管理杨凌三智官网V2版本的色彩规范
 *
 * 色彩规范：
 *   primary  - 主色深蓝 #0F2B47
 *   secondary - 辅助蓝 #1E4D73
 *   success  - 科技绿 #3A8F5C
 *   accent   - 点缀橙 #D4862A（CTA按钮/高亮标签）
 *   background.default - 浅灰背景 #F8F9FC
 *   text.*   - 文字色阶
 *   divider  - 分割线 #E2E8F0
 */
export const V2_COLORS = {
  primary: {
    main: '#0F2B47',
    light: '#2A5A8A',
    dark: '#081B30',
    50: '#E8EDF3',
  },
  secondary: {
    main: '#1E4D73',
    light: '#2A5A8A',
    dark: '#163A57',
  },
  success: {
    main: '#3A8F5C',
    light: '#6BB87E',
    dark: '#2A6B42',
  },
  /** 点缀橙（CTA按钮 / 强调标签） */
  accent: {
    main: '#D4862A',
    light: '#E09A3F',
    dark: '#B86F1F',
  },
  background: {
    default: '#F8F9FC',
    paper: '#FFFFFF',
    dark: '#0F2B47',
  },
  text: {
    primary: '#2D3748',
    secondary: '#718096',
    disabled: '#A0AEC0',
  },
  divider: '#E2E8F0',
} as const;
