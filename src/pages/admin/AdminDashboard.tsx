import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CasesIcon from '@mui/icons-material/Cases';
import MailIcon from '@mui/icons-material/Mail';
import PeopleIcon from '@mui/icons-material/People';
import { getProducts } from '../../api/products';
import { getCases } from '../../api/cases';
import client from '../../api/client';
import { V2_COLORS } from '../../theme/colors';

interface Stats {
  products: number;
  cases: number;
  inquiries: number;
  team: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, cases: 0, inquiries: 0, team: 0 });
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);

  useEffect(() => {
    Promise.allSettled([
      getProducts({ pageSize: 1 }),
      getCases({ pageSize: 1 }),
      client.get('/inquiries?pageSize=1'),
      client.get('/team'),
    ]).then(([p, c, i, t]) => {
      setStats({
        products: p.status === 'fulfilled' ? (p.value.data.data?.total || 0) : 0,
        cases: c.status === 'fulfilled' ? (c.value.data.data?.total || 0) : 0,
        inquiries: i.status === 'fulfilled' ? (i.value.data.data?.total || 0) : 0,
        team: t.status === 'fulfilled' ? (t.value.data.data?.length || 0) : 0,
      });
    });
    client.get('/inquiries?pageSize=5').then((res) => {
      if (res.data.code === 0) setRecentInquiries(res.data.data.list || []);
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: '产品总数', value: stats.products, icon: <InventoryIcon sx={{ fontSize: 32, color: V2_COLORS.primary.main }} />, color: 'rgba(15,43,71,0.06)' },
    { label: '案例总数', value: stats.cases, icon: <CasesIcon sx={{ fontSize: 32, color: V2_COLORS.success.main }} />, color: 'rgba(58,143,92,0.08)' },
    { label: '待处理留言', value: stats.inquiries, icon: <MailIcon sx={{ fontSize: 32, color: V2_COLORS.accent.main }} />, color: 'rgba(212,134,42,0.08)' },
    { label: '团队成员', value: stats.team, icon: <PeopleIcon sx={{ fontSize: 32, color: '#9C27B0' }} />, color: '#F3E5F5' },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 3 }}>数据概览</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ borderRadius: 3, bgcolor: card.color, border: `1px solid ${V2_COLORS.divider}` }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(15,43,71,0.08)' }}>{card.icon}</Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1, color: V2_COLORS.text.primary }}>{card.value}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{card.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${V2_COLORS.divider}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 2 }}>最新留言</Typography>
              {recentInquiries.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>暂无留言</Typography>
              ) : (
                <List dense>
                  {recentInquiries.map((inq, i) => (
                    <Box key={inq.id}>
                      <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{inq.name}</Typography>
                              <Chip
                                label={inq.status === 'pending' ? '待处理' : inq.status === 'processed' ? '已处理' : '已忽略'}
                                size="small"
                                sx={{
                                  bgcolor: inq.status === 'pending' ? 'rgba(212,134,42,0.1)' : 'rgba(58,143,92,0.1)',
                                  color: inq.status === 'pending' ? V2_COLORS.accent.main : V2_COLORS.success.main,
                                  fontSize: 11,
                                }}
                              />
                            </Box>
                          }
                          secondary={<Typography variant="caption" color="text.secondary">{inq.message?.slice(0, 60)}...</Typography>}
                        />
                      </ListItem>
                      {i < recentInquiries.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              background: `linear-gradient(135deg, ${V2_COLORS.primary.main} 0%, ${V2_COLORS.primary.light} 100%)`,
              color: 'white',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>快捷操作</Typography>
              {[
                { label: '新增产品', path: '/admin/products' },
                { label: '新增案例', path: '/admin/cases' },
                { label: '查看留言', path: '/admin/inquiries' },
                { label: '站点设置', path: '/admin/settings' },
              ].map((item) => (
                <Box
                  key={item.path}
                  component="a"
                  href={item.path}
                  sx={{
                    display: 'block', p: 1.5, mb: 1, borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none',
                    '&:hover': { bgcolor: `rgba(212,134,42,0.3)` },
                    transition: 'all 0.2s',
                    fontSize: 14,
                  }}
                >
                  → {item.label}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
