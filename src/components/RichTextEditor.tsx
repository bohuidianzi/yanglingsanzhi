import { useRef, useCallback } from 'react';
import { Box, Tooltip, Divider, IconButton, Paper, CircularProgress } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import TitleIcon from '@mui/icons-material/Title';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import ImageIcon from '@mui/icons-material/Image';
import { V2_COLORS } from '../theme/colors';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

interface ToolBtn {
  title: string;
  icon: React.ReactNode;
  command: string;
  value?: string;
  action?: () => void;
}

export default function RichTextEditor({ value, onChange, placeholder = '请输入内容...', minHeight = 300 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const uploadingRef = useRef(false);

  /** 插入图片 — 通过后端上传接口 */
  const handleInsertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingRef.current) return;
    uploadingRef.current = true;

    // 在光标位置插入加载中占位符
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, '<p style="text-align:center;color:#999;">⏳ 上传中...</p>');
    onChange(editorRef.current?.innerHTML || '');

    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/upload/image', {
        method: 'POST',
        body: formData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (data.code === 0 && data.data?.url) {
        // 移除加载占位符
        const current = editorRef.current?.innerHTML || '';
        const cleaned = current.replace(/<p[^>]*>⏳ 上传中...<\/p>/g, '');
        if (editorRef.current) editorRef.current.innerHTML = cleaned;

        // 插入图片
        const imgHtml = `<p style="text-align:center"><img src="${data.data.url}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:16px 0;"/></p>`;
        document.execCommand('insertHTML', false, imgHtml);
        onChange(editorRef.current?.innerHTML || '');
      } else {
        alert('图片上传失败: ' + (data.message || '未知错误'));
        const current = editorRef.current?.innerHTML || '';
        const cleaned = current.replace(/<p[^>]*>⏳ 上传中...<\/p>/g, '');
        if (editorRef.current) editorRef.current.innerHTML = cleaned;
        onChange(cleaned);
      }
    } catch (err) {
      alert('图片上传失败，请检查网络');
      const current = editorRef.current?.innerHTML || '';
      const cleaned = current.replace(/<p[^>]*>⏳ 上传中...<\/p>/g, '');
      if (editorRef.current) editorRef.current.innerHTML = cleaned;
      onChange(cleaned);
    } finally {
      uploadingRef.current = false;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [onChange]);

  const execCmd = useCallback((command: string, val?: string) => {
    if (command === 'createLink') {
      const url = prompt('输入链接地址:', 'https://');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(command, false, val);
    }
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || '');
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (!isComposingRef.current) {
      onChange(editorRef.current?.innerHTML || '');
    }
  }, [onChange]);

  const initRef = useCallback((el: HTMLDivElement | null) => {
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
    (editorRef as any).current = el;
  }, []); // eslint-disable-line

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${V2_COLORS.divider}`,
        '&:focus-within': { border: `1px solid ${V2_COLORS.primary.light}`, boxShadow: `0 0 0 2px rgba(30,77,115,0.1)` },
        transition: 'all 0.2s',
      }}
    >
      {/* 隐藏的文件选择器 */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

      {/* 工具栏 */}
      <Box
        sx={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5,
          px: 1.5, py: 0.8, bgcolor: V2_COLORS.background.default,
          borderBottom: `1px solid ${V2_COLORS.divider}`,
        }}
      >
        <Tooltip title="加粗" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('bold'); }} sx={iconSx}><FormatBoldIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="斜体" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('italic'); }} sx={iconSx}><FormatItalicIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="下划线" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('underline'); }} sx={iconSx}><FormatUnderlinedIcon fontSize="small" /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="标题" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', 'H2'); }} sx={iconSx}><TitleIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="无序列表" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} sx={iconSx}><FormatListBulletedIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="有序列表" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('insertOrderedList'); }} sx={iconSx}><FormatListNumberedIcon fontSize="small" /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="左对齐" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('justifyLeft'); }} sx={iconSx}><FormatAlignLeftIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="居中" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('justifyCenter'); }} sx={iconSx}><FormatAlignCenterIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="右对齐" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('justifyRight'); }} sx={iconSx}><FormatAlignRightIcon fontSize="small" /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="插入链接" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('createLink'); }} sx={iconSx}><LinkIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="移除链接" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('unlink'); }} sx={iconSx}><LinkOffIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="分割线" placement="top"><IconButton size="small" onMouseDown={e => { e.preventDefault(); execCmd('insertHorizontalRule'); }} sx={iconSx}><HorizontalRuleIcon fontSize="small" /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="插入图片" placement="top">
          <IconButton size="small" onClick={handleInsertImage} sx={{ ...iconSx, color: V2_COLORS.accent.main }}><ImageIcon fontSize="small" /></IconButton>
        </Tooltip>
      </Box>

      {/* 编辑区域 */}
      <Box
        ref={initRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={() => { isComposingRef.current = true; }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          onChange(editorRef.current?.innerHTML || '');
        }}
        sx={{
          minHeight, p: 2, outline: 'none', color: V2_COLORS.text.primary,
          fontSize: '0.9rem', lineHeight: 1.8,
          '&:empty:before': {
            content: `"${placeholder}"`,
            color: V2_COLORS.text.disabled,
            pointerEvents: 'none',
          },
          '& img': { maxWidth: '100%', borderRadius: 1, my: 1 },
          '& h2': { color: V2_COLORS.primary.main, fontSize: '1.2rem', fontWeight: 700, mb: 1, mt: 2 },
          '& ul, & ol': { pl: 3 }, '& li': { mb: 0.5 },
          '& hr': { border: 'none', borderTop: `1px solid ${V2_COLORS.divider}`, my: 2 },
          '& a': { color: V2_COLORS.primary.light, textDecoration: 'underline' },
        }}
      />
    </Paper>
  );
}

const iconSx = {
  color: '#666', borderRadius: 1,
  '&:hover': { bgcolor: 'rgba(15,43,71,0.06)', color: '#0F2B47' },
  p: 0.7,
};
