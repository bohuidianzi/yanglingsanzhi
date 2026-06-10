import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { submitInquiry } from '../api/inquiries';
import { V2_COLORS } from '../theme/colors';

interface InquiryDialogProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  company: string;
  message: string;
}

const initialForm: FormData = {
  name: '',
  phone: '',
  email: '',
  company: '',
  message: '',
};

export default function InquiryDialog({ open, onClose }: InquiryDialogProps) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('请输入姓名');
      return;
    }
    if (!form.message.trim()) {
      setError('请输入留言内容');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await submitInquiry({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        company: form.company.trim() || undefined,
        message: form.message.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm(initialForm);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || '提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setSuccess(false);
      setForm(initialForm);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(15,43,71,0.18)',
        },
      }}
    >
      {/* 标题栏 */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.15rem',
          color: '#fff',
          background: `linear-gradient(135deg, ${V2_COLORS.primary.main} 0%, ${V2_COLORS.secondary.main} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 3,
        }}
      >
        在线咨询
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        {success ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: V2_COLORS.success.main, mb: 2 }} />
            <Typography variant="h5" sx={{ color: V2_COLORS.success.main, fontWeight: 700, mb: 1 }}>
              提交成功！
            </Typography>
            <Typography variant="body2" sx={{ color: V2_COLORS.text.secondary }}>
              感谢您的咨询，我们会尽快与您联系。
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error" sx={{ mb: 0 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="姓名"
                required
                value={form.name}
                onChange={handleChange('name')}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: V2_COLORS.primary.main } }}
              />
              <TextField
                label="电话"
                value={form.phone}
                onChange={handleChange('phone')}
                fullWidth
                size="small"
              />
            </Box>
            <TextField
              label="邮箱"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              fullWidth
              size="small"
            />
            <TextField
              label="公司名称"
              value={form.company}
              onChange={handleChange('company')}
              fullWidth
              size="small"
            />
            <TextField
              label="留言内容"
              required
              multiline
              rows={4}
              value={form.message}
              onChange={handleChange('message')}
              fullWidth
              size="small"
              placeholder="请描述您的需求，我们将第一时间为您解答..."
            />
          </Box>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            sx={{
              color: V2_COLORS.text.secondary,
              borderColor: V2_COLORS.divider,
              '&:hover': { borderColor: V2_COLORS.text.secondary, bgcolor: 'rgba(0,0,0,0.02)' },
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            sx={{
              bgcolor: V2_COLORS.accent.main,
              color: '#fff',
              fontWeight: 700,
              px: 4,
              '&:hover': { bgcolor: V2_COLORS.accent.dark },
              '&:disabled': { bgcolor: '#ccc' },
              minWidth: 120,
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : '提交咨询'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
