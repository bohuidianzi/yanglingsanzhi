import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Chip, CircularProgress, Alert, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { heroSlideApi, HeroSlide } from '../../api/heroSlides';

const defaultForm: HeroSlide = {
  title: '', subtitle: '', description: '', image_url: '',
  fallback_url: '', link_url: '', link_text: '', sort_order: 0, status: 1,
};

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState<HeroSlide>({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });

  const load = async () => {
    try {
      setLoading(true);
      const res: any = await heroSlideApi.getAll();
      setSlides(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, sort_order: slides.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (s: HeroSlide) => {
    setEditing(s);
    setForm({ ...s });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing?.id) {
        await heroSlideApi.update(editing.id, form);
      } else {
        await heroSlideApi.create(form);
      }
      setDialogOpen(false);
      setSnack({ open: true, msg: '保存成功', severity: 'success' });
      load();
    } catch (err) {
      setSnack({ open: true, msg: '保存失败', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定删除这张轮播图？')) return;
    try {
      await heroSlideApi.delete(id);
      setSnack({ open: true, msg: '删除成功', severity: 'success' });
      load();
    } catch (err) {
      setSnack({ open: true, msg: '删除失败', severity: 'error' });
    }
  };

  const move = async (id: number, dir: 1 | -1) => {
    const idx = slides.findIndex(s => s.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    const a = slides[idx], b = slides[target];
    await heroSlideApi.update(a.id!, { sort_order: b.sort_order } as any);
    await heroSlideApi.update(b.id!, { sort_order: a.sort_order } as any);
    load();
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Hero轮播图管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>新增轮播</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>排序</TableCell>
              <TableCell>预览</TableCell>
              <TableCell>主标题</TableCell>
              <TableCell>副标题</TableCell>
              <TableCell sx={{ width: 80 }}>状态</TableCell>
              <TableCell sx={{ width: 140 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slides.map((s, idx) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => move(s.id!, -1)} disabled={idx === 0}><ArrowUpwardIcon fontSize="small" /></IconButton>
                    <Typography variant="caption">{s.sort_order}</Typography>
                    <IconButton size="small" onClick={() => move(s.id!, 1)} disabled={idx === slides.length - 1}><ArrowDownwardIcon fontSize="small" /></IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component="img" src={s.image_url || s.fallback_url} alt={s.title}
                    sx={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 1, bgcolor: '#eee' }}
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                </TableCell>
                <TableCell>{s.title}</TableCell>
                <TableCell>{s.subtitle}</TableCell>
                <TableCell>
                  <Chip label={s.status === 1 ? '启用' : '禁用'} color={s.status === 1 ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEdit(s)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(s.id!)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {slides.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无数据，点击右上角新增</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? '编辑轮播' : '新增轮播'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField label="主标题" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
            <TextField label="副标题" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} fullWidth />
            <TextField label="描述文字" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth sx={{ gridColumn: 'span 2' }} />
            <TextField label="图片URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} fullWidth
              helperText="优先使用本地图片路径如 /images/hero/slide-1.jpg"
            />
            <TextField label="兜底图片URL" value={form.fallback_url} onChange={e => setForm({ ...form, fallback_url: e.target.value })} fullWidth
              helperText="主图加载失败时使用的备用URL"
            />
            <TextField label="按钮链接" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} fullWidth
              helperText="如 /about 或 /products"
            />
            <TextField label="按钮文字" value={form.link_text} onChange={e => setForm({ ...form, link_text: e.target.value })} fullWidth
              helperText="如 了解更多"
            />
            <TextField label="排序" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} fullWidth />
            <FormControlLabel
              control={<Switch checked={form.status === 1} onChange={e => setForm({ ...form, status: e.target.checked ? 1 : 0 })} />}
              label={form.status === 1 ? '启用' : '禁用'}
            />
          </Box>
          {form.image_url && (
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">预览：</Typography>
              <Box component="img" src={form.image_url} alt="preview"
                sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 1, mt: 0.5 }}
                onError={(e: any) => { e.target.src = form.fallback_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80'; }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
