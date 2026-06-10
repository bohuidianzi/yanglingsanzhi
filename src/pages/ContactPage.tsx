import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, TextField, Button,
  Alert, Snackbar, Paper, Divider, Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';
import PageBanner from '../components/PageBanner';
import SectionTitle from '../components/SectionTitle';
import { submitInquiry } from '../api/inquiries';
import { getSettings } from '../api/settings';
import { V2_COLORS } from '../theme/colors';

const fallbackContactInfo = [
  { icon: <LocationOnIcon sx={{ fontSize: 40, color: '#fff' }} />, label: '公司地址', key: 'contact_address', fallbackValue: '陕西省杨凌农业高新技术产业示范区农创汇' },
  { icon: <PhoneIcon sx={{ fontSize: 40, color: '#fff' }} />, label: '联系电话', key: 'contact_phone', fallbackValue: '029-87012345' },
  { icon: <EmailIcon sx={{ fontSize: 40, color: '#fff' }} />, label: '电子邮箱', key: 'contact_email', fallbackValue: 'info@sanzhi-tech.com' },
  { icon: <AccessTimeIcon sx={{ fontSize: 40, color: '#fff' }} />, label: '工作时间', key: 'site_working_hours', fallbackValue: '周一至周五 9:00-18:00' },
];

const transportInfo = [
  { icon: <TrainIcon sx={{ fontSize: 28, color: V2_COLORS.secondary.main }} />, label: '高铁出行', desc: '杨陵南站下车，打车约10分钟到达' },
  { icon: <DirectionsCarIcon sx={{ fontSize: 28, color: V2_COLORS.secondary.main }} />, label: '自驾出行', desc: '连霍高速杨凌出口，沿西农路向北约3公里' },
  { icon: <FlightIcon sx={{ fontSize: 28, color: V2_COLORS.secondary.main }} />, label: '飞机出行', desc: '西安咸阳国际机场，转高铁约40分钟至杨陵南站' },
];

const fadeUp = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', message: '' });
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((res) => {
        if (!cancelled && res.data?.data) { setSettings(res.data.data); }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const getContactValue = (key: string, fallbackValue: string): string => {
    return settings[key] || fallbackValue;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.message) {
      setSnack({ open: true, msg: '请填写姓名、电话和留言内容', severity: 'error' });
      return;
    }
    try {
      await submitInquiry({ ...form });
      setSnack({ open: true, msg: '留言提交成功，我们将尽快与您联系！', severity: 'success' });
      setForm({ name: '', phone: '', email: '', company: '', message: '' });
    } catch {
      setSnack({ open: true, msg: '提交失败，请稍后重试', severity: 'error' });
    }
  };

  const isSubmitting = form.name && form.phone && form.message;

  return (
    <Box>
      <PageBanner
        title="联系我们"
        subtitle="CONTACT US"
        backgroundImage="/images/banners/contact.jpg"
        fallbackImage="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920&q=80"
      />

      {/* ─── 联系方式卡片 — 图标白底+渐变背景 ─── */}
      <Box sx={{ py: { xs: 6, md: 10 }, background: `linear-gradient(180deg, #fff 0%, ${V2_COLORS.background.default} 100%)`, position: 'relative', overflow: 'hidden' }}>
        {/* 装饰 */}
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', bgcolor: V2_COLORS.primary[50], opacity: 0.4 }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', bgcolor: V2_COLORS.secondary.light, opacity: 0.08 }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle title="联系方式" subtitle="GET IN TOUCH" />
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {fallbackContactInfo.map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={item.label}>
                <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
                      textAlign: 'center',
                      borderRadius: 4,
                      height: '100%',
                      border: '1px solid rgba(0,0,0,0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 16px 40px rgba(15,43,71,0.1)',
                        '& .contact-icon-circle': {
                          transform: 'scale(1.1) rotate(5deg)',
                          boxShadow: `0 8px 24px ${V2_COLORS.primary[200]}`,
                        },
                      },
                    }}
                  >
                    {/* 图标圆形容器 */}
                    <Box
                      className="contact-icon-circle"
                      sx={{
                        width: 76,
                        height: 76,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        background: `linear-gradient(135deg, ${V2_COLORS.primary.main}, ${V2_COLORS.primary.light})`,
                        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: V2_COLORS.primary.dark, mb: 1 }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ color: V2_COLORS.text.secondary, fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {getContactValue(item.key, item.fallbackValue)}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── 在线留言 + 交通指引 左右布局 ─── */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff', position: 'relative' }}>
        <Container maxWidth="lg">
          <SectionTitle title="在线留言" subtitle="LEAVE A MESSAGE" />
          <Grid container spacing={5} sx={{ mt: 3 }}>
            {/* 留言表单 */}
            <Grid item xs={12} md={7}>
              <motion.div {...fadeUp}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: `linear-gradient(135deg, #fff 0%, ${V2_COLORS.background.default} 100%)`,
                  }}
                >
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="您的姓名 *" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        variant="outlined" size="medium"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="联系电话 *" value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        variant="outlined" size="medium"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="电子邮箱" value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        variant="outlined" size="medium"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="公司名称" value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        variant="outlined" size="medium"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth label="留言内容 *" value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        variant="outlined" multiline rows={4} size="medium"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        size="large"
                        endIcon={<SendIcon />}
                        sx={{
                          bgcolor: V2_COLORS.accent.main,
                          color: '#fff',
                          fontWeight: 600,
                          px: 5,
                          py: 1.5,
                          borderRadius: '12px',
                          fontSize: '1rem',
                          textTransform: 'none',
                          width: { xs: '100%', sm: 'auto' },
                          '&:hover': { bgcolor: V2_COLORS.accent.dark, transform: 'translateY(-2px)' },
                          transition: 'all 0.25s',
                        }}
                      >
                        提交留言
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            </Grid>

            {/* 交通指引 */}
            <Grid item xs={12} md={5}>
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🚗 交通指引
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {transportInfo.map((item, i) => (
                    <Paper
                      key={item.label}
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: V2_COLORS.secondary.main + '40',
                          bgcolor: V2_COLORS.secondary.main + '06',
                        },
                      }}
                    >
                      <Box sx={{ flexShrink: 0, mt: 0.3 }}>{item.icon}</Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: V2_COLORS.primary.dark, mb: 0.5 }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ color: V2_COLORS.text.secondary, fontSize: '0.88rem', lineHeight: 1.7 }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ width: '100%', borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
