import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Tooltip, Alert,
  MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import client from '../../api/client';
import ImageUploader from '../../components/ImageUploader';
import { V2_COLORS } from '../../theme/colors';

const TYPE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  patent: { label: '专利', color: V2_COLORS.primary.main, bg: '#E8F0F8' },
  cma: { label: 'CMA认证', color: V2_COLORS.success.main, bg: '#E8F5E9' },
  promotion: { label: '水利部推广', color: V2_COLORS.secondary.main, bg: '#FFF3E0' },
  other: { label: '其他', color: '#757575', bg: '#F5F5F5' },
};

interface Cert { id: number; title: string; type: string; certificate_number?: string; issue_date?: string; image?: string; status: number; }
const emptyForm = { title: '', type: 'patent', certificate_number: '', description: '', image: '', issue_date: '', status: 1 };

export default function AdminCertificates() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/certificates');
      if (res.data.code === 0) setCerts(res.data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditId(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (c: Cert) => { setEditId(c.id); setForm({ ...c }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.type) { setAlert({ type: 'error', msg: '标题和类型不能为空' }); return; }
    try {
      editId ? await client.put(`/certificates/${editId}`, form) : await client.post('/certificates', form);
      setDialogOpen(false); setAlert({ type: 'success', msg: '操作成功' }); fetch();
    } catch { setAlert({ type: 'error', msg: '操作失败' }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return;
    try { await client.delete(`/certificates/${id}`); setAlert({ type: 'success', msg: '删除成功' }); fetch(); }
    catch { setAlert({ type: 'error', msg: '删除失败' }); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>证书管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ bgcolor: V2_COLORS.primary.main, borderRadius: '8px', '&:hover': { bgcolor: V2_COLORS.primary.dark } }}>新增证书</Button>
      </Box>
      {alert && <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: V2_COLORS.background.default }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>证书名称</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>类型</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>证书编号</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>颁发日期</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>加载中...</TableCell></TableRow>
              : certs.length === 0 ? <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无证书数据</TableCell></TableRow>
                : certs.map((c) => {
                  const t = TYPE_MAP[c.type] || TYPE_MAP.other;
                  return (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{c.title}</TableCell>
                      <TableCell><Chip label={t.label} size="small" sx={{ bgcolor: t.bg, color: t.color }} /></TableCell>
                      <TableCell>{c.certificate_number || '-'}</TableCell>
                      <TableCell>{c.issue_date ? c.issue_date.slice(0, 10) : '-'}</TableCell>
                      <TableCell>
                        <Tooltip title="编辑"><IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>{editId ? '编辑证书' : '新增证书'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField label="证书名称 *" fullWidth value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>证书类型 *</InputLabel>
                <Select value={form.type || 'patent'} label="证书类型 *" onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <MenuItem value="patent">专利</MenuItem>
                  <MenuItem value="cma">CMA认证</MenuItem>
                  <MenuItem value="promotion">水利部推广目录</MenuItem>
                  <MenuItem value="other">其他</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="证书编号" fullWidth value={form.certificate_number || ''} onChange={(e) => setForm({ ...form, certificate_number: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="颁发日期" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.issue_date || ''} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <ImageUploader
                value={form.image || ''}
                onChange={(url) => setForm({ ...form, image: url })}
                label="证书图片"
              />
            </Grid>
            <Grid item xs={12}><TextField label="描述说明" fullWidth multiline rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: V2_COLORS.primary.main, '&:hover': { bgcolor: V2_COLORS.primary.dark } }}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
