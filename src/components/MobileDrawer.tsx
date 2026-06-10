import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemText, IconButton, Typography, Collapse, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

interface SubItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  children?: SubItem[];
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}

/** 移动端汉堡菜单 — framer-motion右侧滑入动画版，支持二级栏目展开 */
const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose, items }) => {
  const theme = useTheme();
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const toggleExpand = (path: string) => {
    setExpanded(expanded === path ? null : path);
  };

  return (
    <>
      {/* 遮罩层 */}
      <AnimatePresence>
        {open && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.DRAWER_DURATION }}
            onClick={onClose}
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              zIndex: theme.zIndex.drawer - 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* 抽屉面板 */}
      <AnimatePresence>
        {open && (
          <Box
            component={motion.div}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: MOTION.DRAWER_DURATION, ease: 'easeOut' }}
            sx={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 280,
              bgcolor: V2_COLORS.primary.main,
              color: '#fff',
              zIndex: theme.zIndex.drawer,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
              overflowY: 'auto',
            }}
          >
            {/* 关闭按钮 */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5 }}>
              <IconButton
                color="inherit"
                onClick={onClose}
                aria-label="关闭菜单"
                sx={{ minHeight: 44, minWidth: 44 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* 分割线 */}
            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mx: 2 }} />

            {/* 菜单列表 */}
            <List sx={{ flex: 1, pt: 1, px: 0 }}>
              {items.map((item) => (
                <React.Fragment key={item.path}>
                  <ListItem
                    component={item.children && item.children.length > 0 ? 'div' : Link}
                    to={item.children && item.children.length > 0 ? undefined : item.path}
                    onClick={item.children && item.children.length > 0
                      ? () => toggleExpand(item.path)
                      : onClose
                    }
                    sx={{
                      color: isActive(item.path) ? V2_COLORS.secondary.main : '#fff',
                      bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.05)' : 'transparent',
                      minHeight: 44,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                      px: 3,
                      py: 1.5,
                      cursor: 'pointer',
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive(item.path) ? 600 : 500,
                        fontSize: '1.1rem',
                        letterSpacing: 0.5,
                      }}
                    />
                    {item.children && item.children.length > 0 ? (
                      expanded === item.path
                        ? <ExpandLessIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
                        : <ExpandMoreIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
                    ) : isActive(item.path) ? (
                      <ArrowForwardIcon sx={{ fontSize: 16, color: V2_COLORS.secondary.main }} />
                    ) : null}
                  </ListItem>

                  {/* 二级栏目展开 */}
                  {item.children && item.children.length > 0 && (
                    <Collapse in={expanded === item.path} timeout="auto">
                      <List disablePadding>
                        {item.children.map((sub) => (
                          <ListItem
                            key={sub.path}
                            component={Link}
                            to={sub.path}
                            onClick={onClose}
                            sx={{
                              color: isActive(sub.path) ? V2_COLORS.accent.light : 'rgba(255,255,255,0.7)',
                              bgcolor: isActive(sub.path) ? 'rgba(255,255,255,0.03)' : 'transparent',
                              minHeight: 40,
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                              px: 5,
                              py: 1,
                            }}
                          >
                            <ListItemText
                              primary={sub.label}
                              primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              ))}
            </List>

            {/* 底部品牌 */}
            <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                © {new Date().getFullYear()} 杨凌三智科技
              </Typography>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileDrawer;
