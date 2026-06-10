import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Alert, Grid, Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import client from '../../api/client';
import { V2_COLORS } from '../../theme/colors';

const DEFAULT_SETTINGS = [
  { key: 'site_name', label: '网站名称', value: '杨凌三智科技有限公司' },
  { key: 'site_slogan', label: '网站标语', value: '守护水土生态·智造绿色未来' },
  { key: 'contact_phone', label: '联系电话', value: '' },
  { key: 'contact_email', label: '联系邮箱', value: '' },
  { key: 'contact_address', label: '公司地址', value: '陕西省杨凌农业高新技术产业示范区' },
  { key: 'icp_number', label: 'ICP备案号', value: '' },
  { key: 'copyright', label: '版权信息', value: '© 2024 杨凌三智科技有限公司' },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    client.get('/settings').then((res) => {
      if (res.data.code === 0) {
        const map: Record<string, string> = {};
        const data = res.data.data;
        if (Array.isArray(data)) {
          data.forEach((s: any) => { map[s.setting_key] = s.setting_value; });
        } else if (data && typeof data === 'object') {
          Object.assign(map, data);
        }
        setSettings(map);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = DEFAULT_SETTINGS.map((s) => ({ key: s.key, value: settings[s.key] ?? s.value }));
      await client.put('/settings', { settings: payload });
      setAlert({ type: 'success', msg: '设置保存成功' });
    } catch {
      setAlert({ type: 'error', msg: '保存失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 3 }}>站点设置</Typography>
      {alert && <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      <Card elevation={0} sx={{ borderRadius: 3, mb: 3, border: `1px solid ${V2_COLORS.divider}` }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 3 }}>基本信息</Typography>
          <Grid container spacing={3}>
            {DEFAULT_SETTINGS.slice(0, 2).map((s) => (
              <Grid item xs={12} sm={6} key={s.key}>
                <TextField
                  label={s.label}
                  fullWidth
                  value={settings[s.key] ?? s.value}
                  onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, mb: 3, border: `1px solid ${V2_COLORS.divider}` }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 3 }}>联系方式</Typography>
          <Grid container spacing={3}>
            {DEFAULT_SETTINGS.slice(2, 5).map((s) => (
              <Grid item xs={12} sm={s.key === 'contact_address' ? 12 : 6} key={s.key}>
                <TextField
                  label={s.label}
                  fullWidth
                  value={settings[s.key] ?? s.value}
                  onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, mb: 4, border: `1px solid ${V2_COLORS.divider}` }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 3 }}>版权信息</Typography>
          <Grid container spacing={3}>
            {DEFAULT_SETTINGS.slice(5).map((s) => (
              <Grid item xs={12} sm={6} key={s.key}>
                <TextField
                  label={s.label}
                  fullWidth
                  value={settings[s.key] ?? s.value}
                  onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />
      <Button
        variant="contained"
        size="large"
        startIcon={<SaveIcon />}
        onClick={handleSave}
        disabled={loading}
        sx={{
          bgcolor: V2_COLORS.primary.main,
          px: 5,
          borderRadius: '8px',
          fontWeight: 700,
          '&:hover': { bgcolor: V2_COLORS.primary.dark },
        }}
      >
        {loading ? '保存中...' : '保存设置'}
      </Button>
    </Box>
  );
}
