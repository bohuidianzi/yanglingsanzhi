import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import client from '../api/client';
import { V2_COLORS } from '../theme/colors';

interface ImageUploaderProps {
  /** 当前图片URL */
  value?: string;
  /** 回调：返回新图片URL */
  onChange: (url: string) => void;
  /** 标签文字 */
  label?: string;
  /** 接受的文件类型 */
  accept?: string;
}

/** 后台统一图片上传组件 — 支持点击/拖拽上传、预览、删除 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = '上传图片',
  accept = 'image/*',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      // 不手动设置Content-Type，让浏览器自动添加multipart/form-data + boundary
      const res = await client.post('/upload/image', formData, {
        timeout: 30000,
      });
      if (res.data?.code === 0 && res.data?.data?.url) {
        onChange(res.data.data.url);
      } else {
        alert('上传失败，请重试');
      }
    } catch {
      alert('上传失败，请检查网络连接');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // 重置input以允许重复选择同一文件
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <Box>
      {label && (
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: V2_COLORS.text.primary }}>
          {label}
        </Typography>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {value ? (
        // 已上传：显示预览 + 删除
        <Box
          sx={{
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${V2_COLORS.divider}`,
            maxWidth: 320,
          }}
        >
          <Box
            component="img"
            src={value}
            alt="预览"
            sx={{
              width: '100%',
              height: 180,
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).src = '';
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <IconButton
            size="small"
            onClick={handleRemove}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <Button
            size="small"
            onClick={() => inputRef.current?.click()}
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              fontSize: '0.75rem',
              py: 0.3,
              px: 1,
              minWidth: 'auto',
            }}
          >
            更换
          </Button>
        </Box>
      ) : (
        // 未上传：拖拽区域
        <Box
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 320,
            height: 180,
            border: `2px dashed ${dragOver ? V2_COLORS.secondary.main : V2_COLORS.divider}`,
            borderRadius: 2,
            bgcolor: dragOver ? V2_COLORS.secondary.main + '08' : V2_COLORS.background.default,
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: V2_COLORS.secondary.main,
              bgcolor: V2_COLORS.secondary.main + '08',
            },
          }}
        >
          {uploading ? (
            <>
              <CircularProgress size={32} sx={{ color: V2_COLORS.primary.main, mb: 1 }} />
              <Typography variant="body2" sx={{ color: V2_COLORS.text.secondary }}>
                上传中...
              </Typography>
            </>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 36, color: V2_COLORS.text.disabled, mb: 1 }} />
              <Typography variant="body2" sx={{ color: V2_COLORS.text.secondary, mb: 0.5 }}>
                点击或拖拽图片到此处
              </Typography>
              <Typography variant="caption" sx={{ color: V2_COLORS.text.disabled }}>
                支持JPG/PNG，最大10MB
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader;
