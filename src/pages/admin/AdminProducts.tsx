import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Grid, Tooltip, Pagination, Alert, Tabs, Tab, CircularProgress,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import client from '../../api/client';
import { getCategories } from '../../api/products';
import { Category } from '../../types/api';
import ImageUploader from '../../components/ImageUploader';
import RichTextEditor from '../../components/RichTextEditor';
import { V2_COLORS } from '../../theme/colors';

interface Product {
  id: number;
  name: string;
  model?: string;
  category_id: number;
  category_name?: string;
  summary?: string;
  status: number;
  cover_image?: string;
}

/** 产品关联图片 */
interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  title?: string;
  sort_order: number;
}

/** 技术参数 */
interface ProductParam {
  id: number;
  product_id: number;
  param_name: string;
  param_value: string;
  sort_order: number;
}

/** 产品文档 */
interface ProductDoc {
  id: number;
  product_id: number;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number;
  sort_order: number;
}

const emptyForm = { name: '', model: '', category_id: '', summary: '', description: '', application_scenes: '', cover_image: '', slug: '', status: 1 };

function generateSlug(name: string): string {
  if (!name) return '';
  const timestamp = Date.now().toString(36).slice(-6);
  const base = name
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 30);
  return `${base}-${timestamp}`;
}

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // 子资源
  const [dialogTab, setDialogTab] = useState(0);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [params, setParams] = useState<ProductParam[]>([]);
  const [docs, setDocs] = useState<ProductDoc[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get(`/products?page=${page}&pageSize=10`);
      if (res.data.code === 0) { setProducts(res.data.data.list); setTotal(res.data.data.total); }
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    getCategories().then((res) => { if (res.data.code === 0) setCategories(res.data.data); }).catch(() => {});
  }, []);

  /** 拉取产品的图片/参数/文档 */
  const fetchSubResources = async (productId: number) => {
    setImagesLoading(true);
    try {
      const res = await client.get(`/products/${productId}`);
      if (res.data.code === 0) {
        setImages(res.data.data.images || []);
        setParams(res.data.data.params || []);
        setDocs(res.data.data.docs || []);
      }
    } catch { /* ignore */ }
    finally { setImagesLoading(false); }
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setImages([]);
    setParams([]);
    setDocs([]);
    setDialogTab(0);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ ...p });
    setImages([]);
    setParams([]);
    setDocs([]);
    setDialogTab(0);
    setDialogOpen(true);
    fetchSubResources(p.id);
  };

  const handleSave = async () => {
    if (!form.name || !form.category_id) { setAlert({ type: 'error', msg: '产品名称和分类不能为空' }); return; }
    const submitData = { ...form };
    if (!submitData.slug) {
      submitData.slug = generateSlug(form.name);
    }
    try {
      let savedId = editId;
      if (editId) {
        await client.put(`/products/${editId}`, submitData);
      } else {
        const res = await client.post('/products', submitData);
        savedId = res.data.data?.id;
        if (savedId) setEditId(savedId);
      }
      setAlert({ type: 'success', msg: editId ? '更新成功' : '创建成功' });
      if (!editId && savedId) {
        // 新建后自动转为编辑模式，刷新子资源
        fetchSubResources(savedId);
        setAlert({ type: 'success', msg: '产品已创建，可继续添加图片/参数/文档' });
      } else {
        setDialogOpen(false);
        fetchProducts();
      }
    } catch {
      setAlert({ type: 'error', msg: '操作失败，请重试' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该产品？此操作不可恢复。')) return;
    try {
      await client.delete(`/products/${id}`);
      setAlert({ type: 'success', msg: '删除成功' });
      fetchProducts();
    } catch {
      setAlert({ type: 'error', msg: '删除失败' });
    }
  };

  // --- 图片管理 ---
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editId) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await client.post(`/products/${editId}/images`, fd, { timeout: 30000 });
      if (res.data.code === 0) {
        setAlert({ type: 'success', msg: '图片上传成功' });
        fetchSubResources(editId);
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
      await client.delete(`/products/${editId}/images/${imageId}`);
      setImages(prev => prev.filter(img => img.id !== imageId));
      setAlert({ type: 'success', msg: '图片已删除' });
    } catch {
      setAlert({ type: 'error', msg: '删除失败' });
    }
  };

  // --- 参数管理 ---
  const handleAddParam = () => {
    setParams(prev => [...prev, { id: -Date.now(), product_id: editId || 0, param_name: '', param_value: '', sort_order: prev.length }]);
  };

  const handleParamChange = (idx: number, field: 'param_name' | 'param_value', value: string) => {
    setParams(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleSaveParam = async (idx: number) => {
    const p = params[idx];
    if (!p.param_name.trim() || !p.param_value.trim() || !editId) return;
    try {
      if (p.id < 0) {
        // 新建
        const res = await client.post(`/products/${editId}/params`, { param_name: p.param_name, param_value: p.param_value, sort_order: p.sort_order });
        if (res.data.code === 0) {
          setAlert({ type: 'success', msg: '参数已添加' });
          fetchSubResources(editId);
        }
      } else {
        // 更新
        await client.put(`/products/${editId}/params/${p.id}`, { param_name: p.param_name, param_value: p.param_value, sort_order: p.sort_order });
        setAlert({ type: 'success', msg: '参数已更新' });
      }
    } catch {
      setAlert({ type: 'error', msg: '保存参数失败' });
    }
  };

  const handleDeleteParam = async (paramId: number) => {
    if (!confirm('确认删除该参数？') || !editId) return;
    try {
      await client.delete(`/products/${editId}/params/${paramId}`);
      setParams(prev => prev.filter(p => p.id !== paramId));
      setAlert({ type: 'success', msg: '参数已删除' });
    } catch {
      setAlert({ type: 'error', msg: '删除失败' });
    }
  };

  // --- 文档管理 ---
  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editId) return;
    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await client.post(`/products/${editId}/docs`, fd, { timeout: 60000 });
      if (res.data.code === 0) {
        setAlert({ type: 'success', msg: '文档上传成功' });
        fetchSubResources(editId);
      }
    } catch {
      setAlert({ type: 'error', msg: '文档上传失败' });
    } finally {
      setUploadingDoc(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    if (!confirm('确认删除该文档？') || !editId) return;
    try {
      await client.delete(`/products/${editId}/docs/${docId}`);
      setDocs(prev => prev.filter(d => d.id !== docId));
      setAlert({ type: 'success', msg: '文档已删除' });
    } catch {
      setAlert({ type: 'error', msg: '删除失败' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>产品管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ bgcolor: V2_COLORS.primary.main, borderRadius: '8px', '&:hover': { bgcolor: V2_COLORS.primary.dark } }}>
          新增产品
        </Button>
      </Box>

      {alert && <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: V2_COLORS.background.default }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>产品名称</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>型号</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>所属分类</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>状态</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>加载中...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无产品数据</TableCell></TableRow>
            ) : products.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.model || '-'}</TableCell>
                <TableCell>{p.category_name || '-'}</TableCell>
                <TableCell>
                  <Chip label={p.status === 1 ? '已发布' : '草稿'} size="small"
                    sx={{ bgcolor: p.status === 1 ? '#E8F5E9' : '#F5F5F5', color: p.status === 1 ? V2_COLORS.success.main : '#757575' }} />
                </TableCell>
                <TableCell>
                  <Tooltip title="编辑"><IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="删除"><IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {total > 10 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}

      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>
          {editId ? `编辑产品 #${editId}` : '新增产品'}
        </DialogTitle>

        {/* 编辑时才显示子资源 Tab */}
        {editId && (
          <Tabs
            value={dialogTab}
            onChange={(_, v) => setDialogTab(v)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
          >
            <Tab label="基本信息" />
            <Tab label={`产品图片 (${images.length})`} />
            <Tab label={`技术参数 (${params.length})`} />
            <Tab label={`产品文档 (${docs.length})`} />
          </Tabs>
        )}

        <DialogContent dividers>
          {/* Tab 0: 基本信息 */}
          {(dialogTab === 0 || !editId) && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField label="产品名称 *" fullWidth value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="型号规格" fullWidth value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>所属分类 *</InputLabel>
                  <Select value={form.category_id || ''} label="所属分类 *" onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                    {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>状态</InputLabel>
                  <Select value={form.status ?? 1} label="状态" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <MenuItem value={1}>已发布</MenuItem>
                    <MenuItem value={0}>草稿</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField label="产品摘要" fullWidth multiline rows={2} value={form.summary || ''} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <ImageUploader
                  value={form.cover_image || ''}
                  onChange={(url) => setForm({ ...form, cover_image: url })}
                  label="产品封面图"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: V2_COLORS.text.secondary, mb: 0.5, display: 'block' }}>详细描述</Typography>
                <RichTextEditor
                  value={form.description || ''}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="输入产品详细描述..."
                  minHeight={160}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: V2_COLORS.text.secondary, mb: 0.5, display: 'block' }}>应用场景</Typography>
                <RichTextEditor
                  value={form.application_scenes || ''}
                  onChange={(html) => setForm({ ...form, application_scenes: html })}
                  placeholder="输入应用场景描述..."
                  minHeight={120}
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 1: 产品图片 */}
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
                    <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>暂无产品图片</Typography>
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

          {/* Tab 2: 技术参数 */}
          {editId && dialogTab === 2 && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddParam}>
                  添加参数
                </Button>
              </Box>

              {params.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>暂无技术参数，点击上方按钮添加</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: V2_COLORS.background.default }}>
                        <TableCell sx={{ fontWeight: 600, width: '40%' }}>参数名称</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '40%' }}>参数值</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: '20%' }}>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {params.map((p, idx) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              value={p.param_name}
                              onChange={(e) => handleParamChange(idx, 'param_name', e.target.value)}
                              placeholder="参数名"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              value={p.param_value}
                              onChange={(e) => handleParamChange(idx, 'param_value', e.target.value)}
                              placeholder="参数值"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Button size="small" variant="outlined" onClick={() => handleSaveParam(idx)}>保存</Button>
                              <IconButton size="small" color="error" onClick={() => {
                                if (p.id > 0) handleDeleteParam(p.id);
                                else setParams(prev => prev.filter((_, i) => i !== idx));
                              }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Tab 3: 产品文档 */}
          {editId && dialogTab === 3 && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Button variant="outlined" component="label" startIcon={uploadingDoc ? <CircularProgress size={18} /> : <UploadIcon />} disabled={uploadingDoc}>
                  {uploadingDoc ? '上传中...' : '上传文档'}
                  <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" hidden onChange={handleUploadDoc} />
                </Button>
                <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>支持 PDF/Word/Excel/PPT，最大 10MB</Typography>
              </Box>

              {docs.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>暂无产品文档</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: V2_COLORS.background.default }}>
                        <TableCell sx={{ fontWeight: 600 }}>文档名称</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>类型</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>大小</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {docs.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.title}</TableCell>
                          <TableCell>
                            <Chip label={(doc.file_type || '').toUpperCase()} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton size="small" color="primary" href={doc.file_url} target="_blank" component="a">
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteDoc(doc.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>{editId ? '关闭' : '取消'}</Button>
          {(dialogTab === 0 || !editId) && (
            <Button variant="contained" onClick={handleSave} sx={{ bgcolor: V2_COLORS.primary.main, '&:hover': { bgcolor: V2_COLORS.primary.dark } }}>
              {editId ? '保存基本信息' : '创建产品'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
