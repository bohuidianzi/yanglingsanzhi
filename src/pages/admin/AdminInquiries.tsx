import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Tooltip, Alert,
  Pagination, Select, MenuItem, FormControl, InputLabel, Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import client from '../../api/client';
import { V2_COLORS } from '../../theme/colors';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待处理', color: V2_COLORS.accent.main, bg: 'rgba(212,134,42,0.1)' },
  processed: { label: '已处理', color: V2_COLORS.success.main, bg: 'rgba(58,143,92,0.1)' },
  ignored: { label: '已忽略', color: V2_COLORS.text.secondary, bg: V2_COLORS.background.paper },
};

interface Inquiry { id: number; name: string; phone?: string; company?: string; message: string; source?: string; status: string; created_at: string; }

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '10' });
      if (statusFilter) params.append('status', statusFilter);
      const res = await client.get(`/inquiries?${params}`);
      if (res.data.code === 0) { setInquiries(res.data.data.list); setTotal(res.data.data.total); }
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await client.put(`/inquiries/${id}`, { status });
      setAlert({ type: 'success', msg: '状态已更新' });
      if (selected) setSelected({ ...selected, status });
      fetchData();
    } catch { setAlert({ type: 'error', msg: '更新失败' }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该留言？')) return;
    try { await client.delete(`/inquiries/${id}`); setAlert({ type: 'success', msg: '删除成功' }); setSelected(null); fetchData(); }
    catch { setAlert({ type: 'error', msg: '删除失败' }); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>留言管理</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>状态筛选</InputLabel>
          <Select value={statusFilter} label="状态筛选" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="pending">待处理</MenuItem>
            <MenuItem value="processed">已处理</MenuItem>
            <MenuItem value="ignored">已忽略</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {alert && <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${V2_COLORS.divider}` }}>
        <Table>
          <TableHead sx={{ bgcolor: V2_COLORS.background.default }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>姓名</TableCell>
              <TableCell sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>电话</TableCell>
              <TableCell sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>公司</TableCell>
              <TableCell sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>留言摘要</TableCell>
              <TableCell sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>状态</TableCell>
              <TableCell sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>时间</TableCell>
              <TableCell sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>加载中...</TableCell></TableRow>
              : inquiries.length === 0
                ? <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无留言</TableCell></TableRow>
                : inquiries.map((inq) => {
                    const s = STATUS_MAP[inq.status] || STATUS_MAP.pending;
                    return (
                      <TableRow key={inq.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{inq.name}</TableCell>
                        <TableCell>{inq.phone || '-'}</TableCell>
                        <TableCell>{inq.company || '-'}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" noWrap>{inq.message}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{inq.created_at?.slice(0, 10)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="查看详情">
                            <IconButton size="small" onClick={() => setSelected(inq)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="删除">
                            <IconButton size="small" color="error" onClick={() => handleDelete(inq.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
          </TableBody>
        </Table>
      </TableContainer>
      {total > 10 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={Math.ceil(total / 10)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}

      {/* 详情弹窗 */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: V2_COLORS.primary.main }}>留言详情</DialogTitle>
        {selected && (
          <DialogContent dividers>
            <Grid container spacing={2}>
              {[
                { label: '姓名', value: selected.name },
                { label: '电话', value: selected.phone || '-' },
                { label: '邮件', value: selected.phone || '-' },
                { label: '公司', value: selected.company || '-' },
                { label: '来源', value: selected.source || '-' },
                { label: '提交时间', value: selected.created_at?.slice(0, 19) },
              ].map((item) => (
                <Grid item xs={6} key={item.label}>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.value}</Typography>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">留言内容</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 0.5, borderRadius: 2, bgcolor: V2_COLORS.background.default }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>{selected.message}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button size="small" variant="outlined" color="success" onClick={() => handleUpdateStatus(selected!.id, 'processed')}>标记已处理</Button>
          <Button size="small" variant="outlined" color="warning" onClick={() => handleUpdateStatus(selected!.id, 'ignored')}>标记忽略</Button>
          <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(selected!.id)}>删除</Button>
          <Button onClick={() => setSelected(null)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
