import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, CardContent,
  TextField, Button, Alert, Snackbar, Chip, Divider,
  Paper, List, ListItem, ListItemIcon, ListItemText,
  Avatar,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ScienceIcon from '@mui/icons-material/Science';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import StarIcon from '@mui/icons-material/Star';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { motion } from 'framer-motion';
import PageBanner from '../components/PageBanner';
import SectionTitle from '../components/SectionTitle';
import SectionDecorator from '../components/SectionDecorator';
import { submitInquiry } from '../api/inquiries';
import { getSettings } from '../api/settings';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

const fadeUp = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55 } };
const stagger = (i: number) => ({ ...fadeUp, transition: { ...fadeUp.transition, delay: i * 0.1 } });

const cooperationModes = [
  {
    icon: <BusinessIcon sx={{ fontSize: 40, color: '#fff' }} />,
    title: '区域代理合作',
    desc: '成为指定区域的产品代理商，享受独家代理权益和市场资源支持',
    benefits: ['独家区域代理权', '产品培训支持', '市场推广资源', '优先供货保障'],
    gradient: `linear-gradient(135deg, #1B5E38 0%, #3A8F5C 100%)`,
  },
  {
    icon: <HandshakeIcon sx={{ fontSize: 40, color: '#fff' }} />,
    title: '项目合作模式',
    desc: '以项目为单位开展合作，共同承接水土保持监测类工程项目',
    benefits: ['联合投标资质', '技术方案支持', '分工合理利润分享', '长期合作优先'],
    gradient: `linear-gradient(135deg, #0F2B47 0%, #1E4D73 100%)`,
  },
  {
    icon: <ScienceIcon sx={{ fontSize: 40, color: '#fff' }} />,
    title: '科研人员加盟',
    desc: '携带技术成果和资金加盟，共同推进科技成果产业化转化',
    benefits: ['股权激励方案', '实验室资源对接', '产业化资金支持', '品牌背书加持'],
    gradient: `linear-gradient(135deg, #B8731A 0%, #D4862A 100%)`,
  },
];

const partnerBenefits = [
  '水土保持与荒漠化整治全国重点实验室技术背书',
  '22项专利技术，行业领先产品体系',
  '水利部推广目录认证，CMA计量认证',
  '全国20+省市成功案例，一带一路海外市场',
  '西安三智科技14年制造积累，稳定供应链',
  '完善的培训体系和售后服务支持',
  '专属市场拓展资金和推广物料支持',
];

const stats = [
  { icon: <StarIcon />, num: '22+', label: '专利技术', color: V2_COLORS.secondary.main },
  { icon: <RocketLaunchIcon />, num: '5大', label: '产品系列', color: V2_COLORS.primary.main },
  { icon: <GroupsIcon />, num: '20+', label: '省份覆盖', color: V2_COLORS.accent.main },
  { icon: <TrendingUpIcon />, num: '14年', label: '制造积累', color: V2_COLORS.success.main },
];

interface FormState {
  name: string;
  phone: string;
  email: string;
  company: string;
  message: string;
}

export default function CooperationPage() {
  const [form, setForm] = useState<FormState>({ name: '', phone: '', email: '', company: '', message: '' });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false, severity: 'success', message: '',
  });

  useEffect(() => {
    getSettings()
      .then((res) => { if (res.data?.data) setSettings(res.data.data); })
      .catch(() => {});
  }, []);

  const validate = () => {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = '请填写姓名';
    if (!form.message.trim()) newErrors.message = '请填写留言内容';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await submitInquiry({ ...form, source: 'cooperation' });
      setSnackbar({ open: true, severity: 'success', message: '提交成功！我们会尽快与您联系。' });
      setForm({ name: '', phone: '', email: '', company: '', message: '' });
    } catch {
      setSnackbar({ open: true, severity: 'error', message: '提交失败，请稍后重试或直接电话联系。' });
    } finally { setLoading(false); }
  };

  return (
    <Box>
      {/* ═══ Banner ═══ */}
      <PageBanner
        title="合作加盟"
        subtitle="共建水土保持智能监测生态"
        backgroundImage="/images/banners/cooperation.jpg"
        fallbackImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80"
      />

      {/* ═══ 核心数据看板 ═══ */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', bgcolor: V2_COLORS.primary[50], opacity: 0.25 }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3}>
            {stats.map((s, i) => (
              <Grid item xs={6} md={3} key={s.label}>
                <motion.div {...stagger(i)}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 4 },
                      textAlign: 'center',
                      borderRadius: 4,
                      border: '1px solid rgba(0,0,0,0.05)',
                      transition: 'all 0.35s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 50px rgba(15,43,71,0.1)',
                        '& .stat-icon': { transform: 'scale(1.2) rotate(-10deg)' },
                      },
                    }}
                  >
                    <Box
                      className="stat-icon"
                      sx={{
                        width: 60, height: 60, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 2, bgcolor: `${s.color}15`, color: s.color, transition: 'all 0.35s',
                      }}
                    >
                      {s.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: s.color, mb: 0.5, fontSize: { xs: '1.6rem', md: '2rem' } }}>
                      {s.num}
                    </Typography>
                    <Typography sx={{ color: V2_COLORS.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>
                      {s.label}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══ 加盟优势 ═══ */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: V2_COLORS.background.default, position: 'relative' }}>
        <SectionDecorator variant="dots" opacity={0.03} position="full" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle title="加盟优势" subtitle="依托三方资源架构，为合作伙伴提供强大支撑" />
          <Grid container spacing={5} sx={{ mt: 4 }} alignItems="stretch">
            <Grid item xs={12} md={7}>
              <motion.div {...fadeUp}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="h6" sx={{ color: V2_COLORS.primary.main, fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: V2_COLORS.success.main }} /> 成为合作伙伴，您将获得：
                  </Typography>
                  <Grid container spacing={1.5}>
                    {partnerBenefits.map((benefit, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Box
                          sx={{
                            display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover': { bgcolor: V2_COLORS.primary[50] + '40', transform: 'translateX(4px)' },
                          }}
                        >
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: V2_COLORS.success.main, flexShrink: 0, mt: 0.7 }} />
                          <Typography variant="body2" sx={{ color: V2_COLORS.text.secondary, lineHeight: 1.7, fontSize: '0.9rem' }}>
                            {benefit}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={5}>
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
                <Box sx={{
                  position: 'relative', borderRadius: 4, overflow: 'hidden', height: '100%', minHeight: 320,
                  boxShadow: '0 24px 60px rgba(15,43,71,0.12)',
                }}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                    alt="合作伙伴"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, filter: 'brightness(0.4)' }}
                  />
                  <Box sx={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(160deg, rgba(15,43,71,0.82) 0%, rgba(58,143,92,0.7) 100%)`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 4, color: '#fff',
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>携手共赢</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.8 }}>
                      加入杨凌三智合作伙伴体系，共享科技红利，一起开拓水土保持监测蓝海市场
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══ 三种合作模式 — 渐变卡片 ═══ */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff', position: 'relative' }}>
        <SectionDecorator variant="lines" opacity={0.03} position="bottom" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle title="合作模式" subtitle="三种方式，灵活选择适合您的合作路径" />
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {cooperationModes.map((mode, i) => (
              <Grid item xs={12} md={4} key={i}>
                <motion.div {...stagger(i)}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: '100%', borderRadius: 4, overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.06)',
                      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 28px 60px rgba(15,43,71,0.15)',
                        '& .mode-header': { paddingBottom: '24px' },
                        '& .mode-icon-circle': { transform: 'scale(1.15) rotate(-5deg)', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' },
                      },
                    }}
                  >
                    {/* 顶部渐变区域 */}
                    <Box
                      className="mode-header"
                      sx={{
                        background: mode.gradient,
                        p: 4, pb: 3, textAlign: 'center', color: '#fff',
                        transition: 'padding 0.4s cubic-bezier(0.4,0,0.2,1)',
                      }}
                    >
                      <Box
                        className="mode-icon-circle"
                        sx={{
                          width: 72, height: 72, borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          mx: 'auto', mb: 2, transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                        }}
                      >
                        {mode.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{mode.title}</Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="body2" sx={{ color: V2_COLORS.text.secondary, lineHeight: 1.8, mb: 3 }}>
                        {mode.desc}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {mode.benefits.map((b, j) => (
                          <Chip
                            key={j}
                            label={b}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: V2_COLORS.success.main + '50',
                              color: V2_COLORS.success.main,
                              bgcolor: V2_COLORS.success.main + '08',
                              fontSize: 12,
                              transition: 'all 0.3s',
                              '&:hover': { bgcolor: V2_COLORS.success.main + '15', borderColor: V2_COLORS.success.main },
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══ 科研人员号召 — 沉浸式 CTA ═══ */}
      <Box sx={{ py: { xs: 10, md: 14 }, position: 'relative', overflow: 'hidden' }}>
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&q=80"
          alt="科研合作"
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)', zIndex: 0 }}
        />
        <Box sx={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(8,20,40,0.7) 70%, rgba(8,20,40,0.9) 100%)`,
          zIndex: 1,
        }} />
        {/* 浮动光点 */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: 4, height: 4, borderRadius: '50%', bgcolor: '#D4862A',
              left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%`,
              opacity: 0.5, zIndex: 1,
              animation: `pulse 3s ${i * 0.5}s infinite`,
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.2, transform: 'scale(1)' },
                '50%': { opacity: 0.7, transform: 'scale(2.5)' },
              },
            }}
          />
        ))}
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <motion.div {...fadeUp}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <ScienceIcon sx={{ fontSize: 42, color: '#FFB74D' }} />
            </Avatar>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', mb: 2, fontSize: { xs: '1.6rem', md: '2.2rem' } }}>
              科研人员专属通道
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 5, lineHeight: 2, fontWeight: 400, fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
              如果您在水土保持、生态监测、环境工程等领域拥有技术积累，欢迎携带技术成果和资金加盟，共同推进科技成果产业化
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['技术成果转化', '股权激励', '实验室资源', '产业化基金'].map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.08)', color: '#FFD54F',
                    border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                    fontWeight: 600, px: 1, py: 2.5,
                    transition: 'all 0.3s',
                    '&:hover': { bgcolor: 'rgba(212,134,42,0.2)', borderColor: '#D4862A' },
                  }}
                />
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ═══ 联系我们 — 表单 + 信息 ═══ */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: V2_COLORS.background.default, position: 'relative' }}>
        <SectionDecorator variant="dots" opacity={0.03} position="top" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle title="立即加入" subtitle="填写下方表单，我们将在1个工作日内与您联系" />
          <Grid container spacing={5} sx={{ mt: 3 }}>
            {/* 联系信息 */}
            <Grid item xs={12} md={4}>
              <motion.div {...fadeUp}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 3 }}>联系方式</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { icon: <LocationOnIcon />, label: '公司地址', value: settings['contact_address'] || '陕西省杨凌农业高新技术产业示范区农创汇' },
                    { icon: <PhoneIcon />, label: '联系电话', value: settings['contact_phone'] || '029-87012345' },
                    { icon: <EmailIcon />, label: '电子邮件', value: settings['contact_email'] || 'info@sanzhi-tech.com' },
                  ].map((item, i) => (
                    <Paper
                      key={i}
                      elevation={0}
                      sx={{
                        p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'flex-start', gap: 2,
                        border: '1px solid rgba(0,0,0,0.04)',
                        transition: 'all 0.3s',
                        '&:hover': { borderColor: V2_COLORS.secondary.main + '40', bgcolor: V2_COLORS.secondary.main + '04', transform: 'translateX(4px)' },
                      }}
                    >
                      <Avatar sx={{ bgcolor: V2_COLORS.secondary.main + '15', color: V2_COLORS.secondary.main, width: 42, height: 42, flexShrink: 0 }}>
                        {item.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ color: V2_COLORS.text.secondary, display: 'block', mb: 0.3 }}>{item.label}</Typography>
                        <Typography variant="body2" sx={{ color: V2_COLORS.primary.main, fontWeight: 600 }}>{item.value}</Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            {/* 留言表单 */}
            <Grid item xs={12} md={8}>
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', background: `linear-gradient(135deg, #fff 0%, ${V2_COLORS.background.default} 100%)` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HandshakeIcon sx={{ color: V2_COLORS.secondary.main }} /> 在线留言
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="姓名 *" fullWidth value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={!!errors.name} helperText={errors.name}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="联系电话" fullWidth value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="电子邮件" fullWidth value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="公司/单位" fullWidth value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="留言内容 *" fullWidth multiline rows={4} value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })} error={!!errors.message}
                        helperText={errors.message || '请描述您的合作意向或咨询内容'}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained" size="large" onClick={handleSubmit} disabled={loading}
                        endIcon={<SendIcon />}
                        sx={{
                          bgcolor: V2_COLORS.accent.main, color: '#fff', fontWeight: 600,
                          px: 6, py: 1.5, borderRadius: '14px', fontSize: '1rem', textTransform: 'none',
                          '&:hover': { bgcolor: V2_COLORS.accent.dark, transform: 'translateY(-2px)' },
                          transition: 'all 0.25s',
                        }}
                      >
                        {loading ? '提交中...' : '立即提交'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
