import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Alert, InputAdornment, IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../api/auth';
import { V2_COLORS } from '../../theme/colors';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('请输入用户名和密码'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      if (res.data.code === 0) {
        authLogin(res.data.data.token, res.data.data.user);
        navigate('/admin');
      } else {
        setError(res.data.message || '登录失败');
      }
    } catch {
      setError('用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${V2_COLORS.primary.main} 0%, ${V2_COLORS.secondary.main} 60%, ${V2_COLORS.primary.light} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '60%',
          height: '80%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5 },
          borderRadius: 3,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${V2_COLORS.primary.main} 0%, ${V2_COLORS.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: `0 8px 24px rgba(15,43,71,0.3)`,
            }}
          >
            <LockOutlinedIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>后台管理系统</Typography>
          <Typography variant="body2" sx={{ color: V2_COLORS.text.secondary, mt: 0.5 }}>杨凌三智科技有限公司</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="用户名"
            fullWidth
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: V2_COLORS.primary.main,
              },
              '& .MuiInputLabel-root.Mui-focused': { color: V2_COLORS.primary.main },
            }}
          />
          <TextField
            label="密码"
            type={showPwd ? 'text' : 'password'}
            fullWidth
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: V2_COLORS.primary.main,
              },
              '& .MuiInputLabel-root.Mui-focused': { color: V2_COLORS.primary.main },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd(!showPwd)} edge="end">
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              background: `linear-gradient(90deg, ${V2_COLORS.primary.main} 0%, ${V2_COLORS.secondary.main} 100%)`,
              py: 1.5,
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.1em',
              boxShadow: `0 4px 16px rgba(15,43,71,0.3)`,
              '&:hover': {
                background: `linear-gradient(90deg, ${V2_COLORS.primary.light} 0%, ${V2_COLORS.primary.main} 100%)`,
                boxShadow: `0 6px 20px rgba(15,43,71,0.4)`,
              },
              '&:disabled': { background: '#ccc', boxShadow: 'none' },
            }}
          >
            {loading ? '登录中...' : '登 录'}
          </Button>
        </Box>

        <Typography variant="caption" sx={{ color: V2_COLORS.text.disabled, display: 'block', textAlign: 'center', mt: 3 }}>
          默认账号: admin / admin123
        </Typography>
      </Paper>
    </Box>
  );
}
