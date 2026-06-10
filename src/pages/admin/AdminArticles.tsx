import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Tooltip, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { articleApi, navCategoryApi, navSubcategoryApi } from '../../api/navigation';
import type { Article, NavCategory, NavSubcategory } from '../../api/navigation';
import RichTextEditor from '../../components/RichTextEditor';

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [subcategories, setSubcategories] = useState<NavSubcategory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Article | null>(null);
  // 两级联动筛选
  const [filterCat, setFilterCat] = useState<number | ''>('');
  const [filterSub, setFilterSub] = useState<number | ''>('');
  const [form, setForm] = useState({
    cat_id: '' as number | '', subcategory_id: '' as number | '', title: '', title_en: '', summary: '', summary_en: '',
    content: '', content_en: '', cover_image: '', author: '', source: '',
    is_featured: 0, sort_order: 0, published_at: '',
  });
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as any });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await navCategoryApi.getAll();
      const cats: NavCategory[] = (res.data?.data || []).filter(
        (c: NavCategory) => c.slug !== 'news' && c.slug !== 'home' && c.slug !== 'products' && c.slug !== 'cases'
      );
      setCategories(cats);
    } catch (e) { console.error(e); }
  };

  const loadSubcategories = async (parentId?: number) => {
    try {
      const res = await navSubcategoryApi.getAll(parentId);
      setSubcategories(res.data?.data || []);
    } catch (e) { console.error(e); }
  };

  const loadArticles = async () => {
    try {
      const params: any = { pageSize: 100 };
      if (filterSub) params.subcategory_id = filterSub;
      const res = await articleApi.getAll(params);
      setArticles(res.data?.data?.list || []);
    } catch (e) { console.error(e); }
  };

  // 切换一级栏目时，清空二级筛选，重新加载该栏目下的子栏目和文章
  useEffect(() => {
    if (filterCat) {
      loadSubcategories(Number(filterCat));
      setFilterSub('');
      // 默认加载该栏目下所有文章
      loadArticlesForCat(Number(filterCat));
    } else {
      setSubcategories([]);
      loadArticles();
    }
  }, [filterCat]);

  useEffect(() => {
    if (filterSub) loadArticles();
  }, [filterSub]);

  const loadArticlesForCat = async (parentId: number) => {
    try {
      // 获取该栏目下所有子栏目
      const subRes = await navSubcategoryApi.getAll(parentId);
      const subs: NavSubcategory[] = subRes.data?.data || [];
      // 过滤这些子栏目下的文章
      const params: any = { pageSize: 100 };
      const res = await articleApi.getAll(params);
      const allArticles: Article[] = res.data?.data?.list || [];
      const subIds = subs.map(s => s.id);
      setArticles(allArticles.filter(a => subIds.includes(a.subcategory_id)));
    } catch (e) { console.error(e); }
  };

  const openDialog = (article?: Article) => {
    setEditItem(article || null);
    setForm(article ? {
      cat_id: '', subcategory_id: article.subcategory_id, title: article.title, title_en: article.title_en || '',
      summary: article.summary || '', summary_en: article.summary_en || '',
      content: article.content || '', content_en: article.content_en || '',
      cover_image: article.cover_image || '', author: article.author || '', source: article.source || '',
      is_featured: article.is_featured, sort_order: article.sort_order,
      published_at: article.published_at ? article.published_at.slice(0, 16) : '',
    } : {
      cat_id: filterCat || '', subcategory_id: '', title: '', title_en: '', summary: '', summary_en: '',
      content: '', content_en: '', cover_image: '', author: '', source: '',
      is_featured: 0, sort_order: 0, published_at: '',
    });
    // 加载表单中的子栏目列表
    if (article?.subcategory_id) {
      const sub = [...subcategories].find(s => s.id === article.subcategory_id);
      if (sub) loadFormSubs(sub.parent_id);
    }
    setDialogOpen(true);
  };

  const loadFormSubs = async (parentId: number) => {
    try {
      const res = await navSubcategoryApi.getAll(parentId);
      setSubcategories(prev => {
        const existing = prev.map(s => s.id);
        const news = (res.data?.data || []).filter((s: NavSubcategory) => !existing.includes(s.id));
        return [...prev, ...news];
      });
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      const data = { ...form, subcategory_id: Number(form.subcategory_id) || undefined, status: 1 };
      delete (data as any).cat_id;
      if (editItem) await articleApi.update(editItem.id, data);
      else await articleApi.create(data as any);
      setSnack({ open: true, msg: '保存成功', severity: 'success' });
      setDialogOpen(false);
      if (filterCat) loadArticlesForCat(Number(filterCat));
      else loadArticles();
    } catch (e: any) {
      setSnack({ open: true, msg: e.response?.data?.message || '保存失败', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    try {
      await articleApi.delete(id);
      setSnack({ open: true, msg: '删除成功', severity: 'success' });
      if (filterCat) loadArticlesForCat(Number(filterCat));
      else loadArticles();
    } catch (e: any) {
      setSnack({ open: true, msg: e.response?.data?.message || '删除失败', severity: 'error' });
    }
  };

  const getFullPath = (subId: number) => {
    const sub = subcategories.find(s => s.id === subId);
    if (!sub) return '-';
    const cat = categories.find(c => c.id === sub.parent_id);
    return cat ? `${cat.name} → ${sub.name}` : sub.name;
  };

  const getCatName = (id: number) => categories.find(c => c.id === id)?.name || '';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>文章管理（单页）</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>添加文章</Button>
      </Box>

      {/* 两级筛选：一级栏目 → 二级栏目 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>一级栏目</InputLabel>
          <Select value={filterCat} label="一级栏目" onChange={e => setFilterCat(e.target.value as number | '')}>
            <MenuItem value="">全部</MenuItem>
            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>二级栏目</InputLabel>
          <Select value={filterSub} label="二级栏目" onChange={e => setFilterSub(e.target.value as number | '')} disabled={!filterCat}>
            <MenuItem value="">{filterCat ? '全部' : '请先选一级栏目'}</MenuItem>
            {subcategories.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(15,43,71,0.04)' }}>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>标题</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>所属位置</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>推荐</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>更新日期</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((art) => (
              <TableRow key={art.id} hover>
                <TableCell>{art.id}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {art.title}
                  </Typography>
                </TableCell>
                <TableCell>{getFullPath(art.subcategory_id)}</TableCell>
                <TableCell>{art.is_featured ? '⭐' : '-'}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>{art.updated_at ? new Date(art.updated_at).toLocaleDateString('zh-CN') : '-'}</TableCell>
                <TableCell>
                  <Tooltip title="编辑"><IconButton size="small" onClick={() => openDialog(art)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(art.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {articles.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'rgba(0,0,0,0.3)' }}>
                {filterCat ? '该栏目下暂无文章' : '请选择一级栏目查看'}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 编辑弹窗 - 两级联动选择 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{editItem ? '编辑文章' : '新建文章'}</DialogTitle>
        <DialogContent sx={{ pt: '20px !important' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>一级栏目</InputLabel>
              <Select
                value={form.cat_id}
                label="一级栏目"
                onChange={e => {
                  const catId = e.target.value as number;
                  setForm(f => ({ ...f, cat_id: catId, subcategory_id: '' }));
                  loadSubcategories(Number(catId));
                }}
              >
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>二级栏目</InputLabel>
              <Select
                value={form.subcategory_id}
                label="二级栏目"
                onChange={e => setForm(f => ({ ...f, subcategory_id: e.target.value as number }))}
                disabled={!form.cat_id}
              >
                {subcategories.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <TextField fullWidth label="中文标题" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} sx={{ mb: 2 }} required />
          <TextField fullWidth label="英文标题" value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} sx={{ mb: 2 }} />
          <TextField fullWidth label="中文摘要" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} sx={{ mb: 2 }} multiline rows={2} />
          <TextField fullWidth label="英文摘要" value={form.summary_en} onChange={e => setForm(f => ({ ...f, summary_en: e.target.value }))} sx={{ mb: 2 }} multiline rows={2} />

          {/* 封面图上传 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>封面图片</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField label="封面图URL" value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} sx={{ flex: 1 }} size="small" />
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small">
                本地上传
                <input type="file" accept="image/*" hidden onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const fd = new FormData(); fd.append('image', file);
                  const token = localStorage.getItem('admin_token');
                  try {
                    const res = await fetch('/api/v1/upload/image', {
                      method: 'POST', body: fd,
                      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    });
                    const data = await res.json();
                    if (data.code === 0 && data.data?.url) setForm(f => ({ ...f, cover_image: data.data.url }));
                    else alert('上传失败');
                  } catch { alert('上传失败'); }
                }} />
              </Button>
            </Box>
            {form.cover_image && (
              <Box component="img" src={form.cover_image} alt="封面预览" sx={{ mt: 1, maxHeight: 100, borderRadius: 1, border: '1px solid #eee' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
          </Box>

          {/* 富文本编辑器 */}
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>中文内容</Typography>
          <Box sx={{ mb: 3 }}>
            <RichTextEditor value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} minHeight={300} />
          </Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>英文内容</Typography>
          <Box sx={{ mb: 2 }}>
            <RichTextEditor value={form.content_en} onChange={v => setForm(f => ({ ...f, content_en: v }))} minHeight={200} placeholder="English content..." />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="排序" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} sx={{ width: 100 }} />
          </Box>
          <TextField fullWidth label="发布时间" type="datetime-local" value={form.published_at}
            onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }} />
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
