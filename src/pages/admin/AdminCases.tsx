import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Tooltip, Pagination, Alert,
  FormControlLabel, Switch, Tabs, Tab, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/CloudUpload';
import client from '../../api/client';
import ImageUploader from '../../components/ImageUploader';
import RichTextEditor from '../../components/RichTextEditor';
import { V2_COLORS } from '../../theme/colors';

interface CaseItem { id: number; title: string; province?: string; location?: string; cover_image?: string; is_featured: number; status: number; }

interface CaseImage { id: number; case_id: number; image_url: string; title?: string; sort_order: number; }

const emptyForm = { title: '', province: '', location: '', summary: '', description: '', cover_image: '', slug: '', is_featured: 0, status: 1 };

function generateSlug(title: string): string {
  if (!title) return '';
  const timestamp = Date.now().toString(36).slice(-6);
  const base = title
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 30);
  return `${base}-${timestamp}`;
}

export default function AdminCases() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // 子资源
  const [dialogTab, setDialogTab] = useState(0);
  const [images, setImages] = useState<CaseImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get(`/cases?page=${page}&pageSize=10`);
      if (res.data.code === 0) { setCases(res.data.data.list); setTotal(res.data.data.total); }
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const fetchImages = async (caseId: number) => {
    setImagesLoading(true);
    try {
      const res = await client.get(`/cases/${caseId}`);
      if (res.data.code === 0) {
        setImages(res.data.data.images || []);
      }
    } catch { /* ignore */ }
    finally { setImagesLoading(false); }
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setImages([]);
    setDialogTab(0);
    setDialogOpen(true);
  };

  const openEdit = (c: CaseItem) => {
    setEditId(c.id);
    setForm({ ...c });
    setImages([]);
    setDialogTab(0);
    setDialogOpen(true);
    fetchImages(c.id);
  };

  const handleSave = async () => {
    if (!form.title) { setAlert({ type: 'error', msg: '案例标题不能为空' }); return; }
    const submitData = { ...form };
    if (!submitData.slug) {
      submitData.slug = generateSlug(form.title);
    }
    try {
      editId ? await client.put(`/cases/${editId}`, submitData) : await client.post('/cases', submitData);
      setAlert({ type: 'success', msg: editId ? '更新成功' : '创建成功' });
      if (editId) {
        setDialogOpen(false);
      } else {
        // 新建后关闭弹窗
        setDialogOpen(false);
      }
      fetch();
    } catch { setAlert({ type: 'error', msg: '操作失败' }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？')) return;
    try { await client.delete(`/cases/${id}`); setAlert({ type: 'success', msg: '删除成功' }); fetch(); }
    catch { setAlert({ type: 'error', msg: '删除失败' }); }
  };

  // --- 图片管理 ---
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editId) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await client.post(`/cases/${editId}/images`, fd, { timeout: 30000 });
      if (res.data.code === 0) {
        setAlert({ type: 'success', msg: '图片上传成功' });
        fetchImages(editId);
      }
    } catch {
      setAlert({ type: 'error', msg: '图片上传失败' });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('确认删除该图片？') || !editId) return;
    try {
      await client.delete(`/cases/${editId}/images/${imageId}`);
      setImages(prev => prev.filter(img => img.id !== imageId));
      setAlert({ type: 'success', msg: '图片已删除' });
    } catch {
      setAlert({ type: 'error', msg: '删除失败' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>案例管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ bgcolor: V2_COLORS.primary.main, borderRadius: '8px', '&:hover': { bgcolor: V2_COLORS.primary.dark } }}>新增案例</Button>
      </Box>
      {alert && <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: V2_COLORS.background.default }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>案例标题</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>省份</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>项目地点</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>标杆案例</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>加载中...</TableCell></TableRow>
              : cases.length === 0 ? <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无案例</TableCell></TableRow>
                : cases.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.title}</TableCell>
                    <TableCell>{c.province || '-'}</TableCell>
                    <TableCell>{c.location || '-'}</TableCell>
                    <TableCell>
                      <Chip label={c.is_featured ? '标杆' : '普通'} size="small"
                        sx={{ bgcolor: c.is_featured ? '#FFF3E0' : '#F5F5F5', color: c.is_featured ? V2_COLORS.secondary.main : '#757575' }} />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="编辑"><IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
      {total > 10 && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}><Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, v) => setPage(v)} color="primary" /></Box>}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>
          {editId ? `编辑案例 #${editId}` : '新增案例'}
        </DialogTitle>

        {editId && (
          <Tabs value={dialogTab} onChange={(_, v) => setDialogTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tab label="基本信息" />
            <Tab label={`案例图片 (${images.length})`} />
          </Tabs>
        )}

        <DialogContent dividers>
          {/* Tab 0: 基本信息 */}
          {(dialogTab === 0 || !editId) && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}><TextField label="案例标题 *" fullWidth value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="省份" fullWidth value={form.province || ''} onChange={(e) => setForm({ ...form, province: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><TextField label="项目地点" fullWidth value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField label="摘要" fullWidth multiline rows={2} value={form.summary || ''} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></Grid>
              <Grid item xs={12}>
                <ImageUploader
                  value={form.cover_image || ''}
                  onChange={(url) => setForm({ ...form, cover_image: url })}
                  label="案例封面图"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: V2_COLORS.text.secondary, mb: 0.5, display: 'block' }}>详细描述</Typography>
                <RichTextEditor
                  value={form.description || ''}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="输入案例详细描述..."
                  minHeight={160}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked ? 1 : 0 })} />} label="设为标杆案例" />
              </Grid>
            </Grid>
          )}

          {/* Tab 1: 案例图片 */}
          {editId && dialogTab === 1 && (
            <Box>
              {imagesLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={32} /></Box>
              ) : (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" component="label" startIcon={uploadingImage ? <CircularProgress size={18} /> : <UploadIcon />} disabled={uploadingImage}>
                      {uploadingImage ? '上传中...' : '上传新图片'}
                      <input type="file" accept="image/*" hidden onChange={handleUploadImage} />
                    </Button>
                    <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>支持 JPG/PNG，最大 10MB</Typography>
                  </Box>

                  {images.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>暂无案例图片，点击上方按钮上传</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {images.map((img) => (
                        <Box
                          key={img.id}
                          sx={{
                            position: 'relative',
                            width: 160,
                            height: 120,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box
                            component="img"
                            src={img.image_url}
                            alt={img.title || ''}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => { e.target.src = ''; e.target.style.display = 'none'; }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteImage(img.id)}
                            sx={{
                              position: 'absolute', top: 4, right: 4,
                              bgcolor: 'rgba(0,0,0,0.5)', color: '#fff',
                              '&:hover': { bgcolor: 'error.main' },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>{editId ? '关闭' : '取消'}</Button>
          {(dialogTab === 0 || !editId) && (
            <Button variant="contained" onClick={handleSave} sx={{ bgcolor: V2_COLORS.primary.main, '&:hover': { bgcolor: V2_COLORS.primary.dark } }}>保存</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
