import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Tooltip, Alert, FormControlLabel, Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import client from '../../api/client';
import ImageUploader from '../../components/ImageUploader';
import { V2_COLORS } from '../../theme/colors';

interface Member { id: number; name: string; title?: string; bio?: string; avatar?: string; is_featured: number; sort_order: number; }
const emptyForm = { name: '', title: '', bio: '', avatar: '', is_featured: 0, sort_order: 0, status: 1 };

export default function AdminTeam() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/team');
      if (res.data.code === 0) setMembers(res.data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditId(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (m: Member) => { setEditId(m.id); setForm({ ...m }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name) { setAlert({ type: 'error', msg: '姓名不能为空' }); return; }
    try {
      editId ? await client.put(`/team/${editId}`, form) : await client.post('/team', form);
      setDialogOpen(false); setAlert({ type: 'success', msg: '操作成功' }); fetch();
    } catch { setAlert({ type: 'error', msg: '操作失败' }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return;
    try { await client.delete(`/team/${id}`); setAlert({ type: 'success', msg: '删除成功' }); fetch(); }
    catch { setAlert({ type: 'error', msg: '删除失败' }); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>团队管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ bgcolor: V2_COLORS.primary.main, borderRadius: '8px', '&:hover': { bgcolor: V2_COLORS.primary.dark } }}>新增成员</Button>
      </Box>
      {alert && <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: V2_COLORS.background.default }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>姓名</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>职位/头衔</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>简介</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>是否展示</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>加载中...</TableCell></TableRow>
              : members.length === 0 ? <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无团队成员</TableCell></TableRow>
                : members.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{m.name}</TableCell>
                    <TableCell>{m.title || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}><Typography variant="body2" noWrap>{m.bio || '-'}</Typography></TableCell>
                    <TableCell>{m.is_featured ? '✅ 已展示' : '⬜ 未展示'}</TableCell>
                    <TableCell>
                      <Tooltip title="编辑"><IconButton size="small" onClick={() => openEdit(m)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(m.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>{editId ? '编辑成员' : '新增成员'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}><TextField label="姓名 *" fullWidth value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="职位/头衔" fullWidth value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <ImageUploader
                value={form.avatar || ''}
                onChange={(url) => setForm({ ...form, avatar: url })}
                label="头像照片"
              />
            </Grid>
            <Grid item xs={12}><TextField label="个人简介" fullWidth multiline rows={4} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="排序（数字越小越靠前）" type="number" fullWidth value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) })} /></Grid>
            <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked ? 1 : 0 })} />} label="在首页展示" /></Grid>
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
