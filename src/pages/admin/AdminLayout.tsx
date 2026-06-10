import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar,
  Menu, MenuItem, Divider, useMediaQuery, useTheme, Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CasesIcon from '@mui/icons-material/Cases';
import PeopleIcon from '@mui/icons-material/People';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MailIcon from '@mui/icons-material/Mail';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import NavIcon from '@mui/icons-material/AccountTree';
import ArticleIcon from '@mui/icons-material/Article';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import { useAuth } from '../../contexts/AuthContext';
import { V2_COLORS } from '../../theme/colors';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: '仪表盘', path: '/admin', icon: <DashboardIcon />, exact: true },
  { label: '栏目管理', path: '/admin/nav-categories', icon: <NavIcon /> },
  { label: '新闻管理', path: '/admin/news', icon: <NewspaperIcon /> },
  { label: '文章管理', path: '/admin/articles', icon: <ArticleIcon /> },
  { label: '轮播管理', path: '/admin/hero-slides', icon: <SlideshowIcon /> },
  { label: '产品管理', path: '/admin/products', icon: <InventoryIcon /> },
  { label: '案例管理', path: '/admin/cases', icon: <CasesIcon /> },
  { label: '团队管理', path: '/admin/team', icon: <PeopleIcon /> },
  { label: '证书管理', path: '/admin/certificates', icon: <WorkspacePremiumIcon /> },
  { label: '留言管理', path: '/admin/inquiries', icon: <MailIcon /> },
  { label: '站点设置', path: '/admin/settings', icon: <SettingsIcon /> },
];

export default function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const drawer = (
    <Box sx={{ height: '100%', background: `linear-gradient(180deg, ${V2_COLORS.primary.main} 0%, ${V2_COLORS.primary.dark} 100%)`, color: 'white' }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', letterSpacing: 0.5 }}>杨凌三智</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>后台管理系统</Typography>
      </Box>
      <List sx={{ pt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                mx: 1, borderRadius: 2, mb: 0.5,
                bgcolor: isActive(item.path, item.exact) ? 'rgba(212,134,42,0.25)' : 'transparent',
                borderLeft: isActive(item.path, item.exact) ? `3px solid ${V2_COLORS.accent.main}` : '3px solid transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                color: 'white',
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path, item.exact) ? V2_COLORS.accent.main : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href="/"
            target="_blank"
            sx={{ mx: 1, borderRadius: 2, color: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><HomeIcon /></ListItemIcon>
            <ListItemText primary="查看前台" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' } }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* 主内容区 */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        {/* 顶部栏 */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'white',
            borderBottom: `1px solid ${V2_COLORS.divider}`,
            boxShadow: '0 2px 8px rgba(15,43,71,0.06)',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, color: V2_COLORS.primary.main }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, color: V2_COLORS.primary.main, fontWeight: 600, fontSize: 16 }}>
              {navItems.find((n) => isActive(n.path, n.exact))?.label || '管理后台'}
            </Typography>
            <Tooltip title="账号设置">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: V2_COLORS.primary.main, fontSize: 14 }}>
                  {(user?.real_name || user?.username || 'A')[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>
                <Typography variant="body2">{user?.real_name || user?.username || '管理员'}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1, fontSize: 18 }} /> 退出登录
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* 内容 */}
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: V2_COLORS.background.default, overflowY: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
