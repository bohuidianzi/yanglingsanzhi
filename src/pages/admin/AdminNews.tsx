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
import { articleApi, navSubcategoryApi } from '../../api/navigation';
import type { Article, NavSubcategory } from '../../api/navigation';
import RichTextEditor from '../../components/RichTextEditor';

// 新闻动态 parent_id = 3
const NEWS_PARENT_ID = 3;

export default function AdminNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subcategories, setSubcategories] = useState<NavSubcategory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Article | null>(null);
  const [filterSub, setFilterSub] = useState<number | ''>('');
  const [form, setForm] = useState({
    subcategory_id: '' as number | '', title: '', title_en: '', summary: '', summary_en: '',
    content: '', content_en: '', cover_image: '', author: '', source: '',
    is_featured: 0, sort_order: 0, published_at: '',
  });
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as any });

  useEffect(() => { loadSubcategories(); }, []);

  const loadSubcategories = async () => {
    try {
      const res = await navSubcategoryApi.getAll(NEWS_PARENT_ID);
      setSubcategories(res.data?.data || []);
    } catch (e) { console.error(e); }
  };

  const loadArticles = async () => {
    try {
      const params: any = { pageSize: 100 };
      // 始终只拉取新闻动态子栏目下的文章，不显示其他栏目的内容
      if (filterSub) {
        params.subcategory_id = filterSub;
      } else if (subcategories.length > 0) {
        params.subcategory_id = subcategories.map(s => s.id).join(',');
      }
      const res = await articleApi.getAll(params);
      setArticles(res.data?.data?.list || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (subcategories.length > 0) loadArticles(); }, [filterSub, subcategories]);

  const openDialog = (article?: Article) => {
    setEditItem(article || null);
    setForm(article ? {
      subcategory_id: article.subcategory_id, title: article.title, title_en: article.title_en || '',
      summary: article.summary || '', summary_en: article.summary_en || '',
      content: article.content || '', content_en: article.content_en || '',
      cover_image: article.cover_image || '', author: article.author || '', source: article.source || '',
      is_featured: article.is_featured, sort_order: article.sort_order,
      published_at: article.published_at ? article.published_at.slice(0, 16) : '',
    } : {
      subcategory_id: subcategories[0]?.id || '', title: '', title_en: '', summary: '', summary_en: '',
      content: '', content_en: '', cover_image: '', author: '', source: '',
      is_featured: 0, sort_order: 0, published_at: '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const data = { ...form, subcategory_id: Number(form.subcategory_id) || undefined, status: 1 };
      if (editItem) await articleApi.update(editItem.id, data);
      else await articleApi.create(data as any);
      setSnack({ open: true, msg: '保存成功', severity: 'success' });
      setDialogOpen(false);
      loadArticles();
    } catch (e: any) {
      setSnack({ open: true, msg: e.response?.data?.message || '保存失败', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    try {
      await articleApi.delete(id);
      setSnack({ open: true, msg: '删除成功', severity: 'success' });
      loadArticles();
    } catch (e: any) {
      setSnack({ open: true, msg: e.response?.data?.message || '删除失败', severity: 'error' });
    }
  };

  const getSubName = (id: number) => subcategories.find(s => s.id === id)?.name || '-';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>新闻管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>发布新闻</Button>
      </Box>

      {/* 筛选 */}
      <FormControl sx={{ mb: 2, minWidth: 200 }} size="small">
        <InputLabel>按栏目筛选</InputLabel>
        <Select value={filterSub} label="按栏目筛选" onChange={e => setFilterSub(e.target.value as number | '')}>
          <MenuItem value="">全部新闻</MenuItem>
          {subcategories.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </Select>
      </FormControl>

      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(15,43,71,0.04)' }}>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>标题</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>栏目</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>作者/来源</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>推荐</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>发布时间</TableCell>
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
                <TableCell>{getSubName(art.subcategory_id)}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                  {[art.author, art.source].filter(Boolean).join(' / ') || '-'}
                </TableCell>
                <TableCell>{art.is_featured ? '⭐' : '-'}</TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>{art.published_at ? new Date(art.published_at).toLocaleDateString('zh-CN') : '-'}</TableCell>
                <TableCell>
                  <Tooltip title="编辑"><IconButton size="small" onClick={() => openDialog(art)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(art.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {articles.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'rgba(0,0,0,0.3)' }}>暂无新闻</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 编辑弹窗 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{editItem ? '编辑新闻' : '发布新闻'}</DialogTitle>
        <DialogContent sx={{ pt: '20px !important' }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>所属栏目</InputLabel>
            <Select value={form.subcategory_id} label="所属栏目" onChange={e => setForm(f => ({ ...f, subcategory_id: e.target.value as number }))}>
              {subcategories.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="标题" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} sx={{ mb: 2 }} required />
          <TextField fullWidth label="摘要" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} sx={{ mb: 2 }} multiline rows={2} />

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
                  } catch { alert('上传失败'); }
                }} />
              </Button>
            </Box>
            {form.cover_image && (
              <Box component="img" src={form.cover_image} alt="封面预览" sx={{ mt: 1, maxHeight: 100, borderRadius: 1, border: '1px solid #eee' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
          </Box>

          {/* 富文本编辑器 */}
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>正文内容</Typography>
          <Box sx={{ mb: 2 }}>
            <RichTextEditor value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} minHeight={300} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="作者" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} sx={{ flex: 1 }} />
            <TextField label="来源" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} sx={{ flex: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="排序" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} sx={{ width: 100 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>是否推荐</InputLabel>
              <Select value={form.is_featured} label="是否推荐" onChange={e => setForm(f => ({ ...f, is_featured: Number(e.target.value) }))}>
                <MenuItem value={0}>否</MenuItem>
                <MenuItem value={1}>是</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="发布时间" type="datetime-local" value={form.published_at}
              onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))}
              InputLabelProps={{ shrink: true }} />
          </Box>
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
