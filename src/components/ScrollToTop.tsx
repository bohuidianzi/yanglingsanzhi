import { useState, useEffect } from 'react';
import { Fab, Zoom } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useLocation } from 'react-router-dom';
import { V2_COLORS } from '../theme/colors';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 路由切换时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={visible}>
      <Fab
        onClick={handleClick}
        size="medium"
        aria-label="返回顶部"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          bgcolor: V2_COLORS.primary.main,
          color: '#fff',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(15,43,71,0.3)',
          '&:hover': { bgcolor: V2_COLORS.secondary.main },
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
}
