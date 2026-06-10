import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Tooltip, Snackbar, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { navCategoryApi, navSubcategoryApi } from '../../api/navigation';
import type { NavCategory, NavSubcategory } from '../../api/navigation';

export default function AdminNavCategories() {
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<Record<number, NavSubcategory[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'cat' | 'sub'>('cat');
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', name_en: '', slug: '', icon: '', sort_order: 0, parent_id: 0, content_type: 'article', description: '', description_en: '' });
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as any });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await navCategoryApi.getAll();
      setCategories(res.data?.data || []);
    } catch (e) { console.error(e); }
  };

  const loadSubcategories = async (parentId: number) => {
    try {
      const res = await navSubcategoryApi.getAll(parentId);
      setSubcategories(prev => ({ ...prev, [parentId]: res.data?.data || [] }));
    } catch (e) { console.error(e); }
  };

  const toggleExpand = (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    loadSubcategories(id);
  };

  const openCatDialog = (cat?: NavCategory) => {
    setDialogType('cat');
    setEditItem(cat || null);
    setForm(cat ? { name: cat.name, name_en: cat.name_en || '', slug: cat.slug, icon: cat.icon || '', sort_order: cat.sort_order } as any
      : { name: '', name_en: '', slug: '', icon: '', sort_order: 0 } as any);
    setDialogOpen(true);
  };

  const openSubDialog = (parentId: number, sub?: NavSubcategory) => {
    setDialogType('sub');
    setEditItem(sub || null);
    setForm(sub ? { name: sub.name, name_en: sub.name_en || '', slug: sub.slug, sort_order: sub.sort_order, parent_id: parentId, content_type: sub.content_type, description: sub.description || '', description_en: sub.description_en || '' } as any
      : { name: '', name_en: '', slug: '', sort_order: 0, parent_id: parentId, content_type: 'article', description: '', description_en: '' } as any);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (dialogType === 'cat') {
        if (editItem) await navCategoryApi.update(editItem.id, form);
        else await navCategoryApi.create(form);
      } else {
        if (editItem) await navSubcategoryApi.update(editItem.id, { ...form, content_type: form.content_type as any });
        else await navSubcategoryApi.create({ ...form, content_type: form.content_type as any });
      }
      setSnack({ open: true, msg: '保存成功', severity: 'success' });
      setDialogOpen(false);
      loadCategories();
      if (form.parent_id) loadSubcategories(form.parent_id);
    } catch (e: any) {
      setSnack({ open: true, msg: e.response?.data?.message || '保存失败', severity: 'error' });
    }
  };

  const handleDelete = async (type: 'cat' | 'sub', id: number) => {
    if (!confirm('确定删除？删除后不可恢复！')) return;
    try {
      if (type === 'cat') { await navCategoryApi.delete(id); loadCategories(); }
      else { await navSubcategoryApi.delete(id); if (expandedId) loadSubcategories(expandedId); }
      setSnack({ open: true, msg: '删除成功', severity: 'success' });
    } catch (e: any) {
      setSnack({ open: true, msg: e.response?.data?.message || '删除失败', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>栏目管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCatDialog()}>添加一级栏目</Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(15,43,71,0.04)' }}>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>中文名称</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>英文名称</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>排序</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <>
                <TableRow key={cat.id} sx={{ '&:hover': { bgcolor: 'rgba(15,43,71,0.02)' } }}>
                  <TableCell>{cat.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" onClick={() => toggleExpand(cat.id)}>
                        {expandedId === cat.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      {cat.name}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(0,0,0,0.5)' }}>{cat.name_en || '-'}</TableCell>
                  <TableCell><code style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{cat.slug}</code></TableCell>
                  <TableCell>{cat.sort_order}</TableCell>
                  <TableCell>
                    <Tooltip title="添加二级栏目"><IconButton size="small" onClick={() => openSubDialog(cat.id)}><AddIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="编辑"><IconButton size="small" onClick={() => openCatDialog(cat)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete('cat', cat.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
                {/* 二级栏目 */}
                {expandedId === cat.id && (subcategories[cat.id] || []).map((sub) => (
                  <TableRow key={`sub-${sub.id}`} sx={{ bgcolor: 'rgba(212,134,42,0.03)' }}>
                    <TableCell sx={{ pl: 5 }}>↳ {sub.id}</TableCell>
                    <TableCell sx={{ pl: 5 }}>{sub.name}</TableCell>
                    <TableCell sx={{ pl: 5, color: 'rgba(0,0,0,0.5)' }}>{sub.name_en || '-'}</TableCell>
                    <TableCell sx={{ pl: 5 }}><code style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{sub.slug}</code></TableCell>
                    <TableCell sx={{ pl: 5 }}>{sub.sort_order}</TableCell>
                    <TableCell sx={{ pl: 5 }}>
                      <Tooltip title="编辑"><IconButton size="small" onClick={() => openSubDialog(cat.id, sub)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete('sub', sub.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 编辑弹窗 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? '编辑' : '新建'}{dialogType === 'cat' ? '一级栏目' : '二级栏目'}</DialogTitle>
        <DialogContent sx={{ pt: '20px !important' }}>
          <TextField fullWidth label="中文名称" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} sx={{ mb: 2 }} required />
          <TextField fullWidth label="英文名称" value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} sx={{ mb: 2 }} />
          <TextField fullWidth label="Slug（URL标识）" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} sx={{ mb: 2 }} required helperText="如：company-news，仅英文、数字和连字符" />
          <TextField fullWidth label="排序" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} sx={{ mb: 2 }} />
          {dialogType === 'sub' && (
            <>
              <TextField fullWidth label="描述（中文）" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} sx={{ mb: 2 }} multiline rows={2} />
              <TextField fullWidth label="描述（英文）" value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} sx={{ mb: 2 }} multiline rows={2} />
              <TextField fullWidth label="内容类型" value={form.content_type} onChange={e => setForm(f => ({ ...f, content_type: e.target.value }))} sx={{ mb: 2 }}
                select SelectProps={{ native: true }}>
                <option value="article">文章</option>
                <option value="product">产品</option>
                <option value="case">案例</option>
                <option value="link">链接</option>
                <option value="custom">自定义</option>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave}>保存</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
