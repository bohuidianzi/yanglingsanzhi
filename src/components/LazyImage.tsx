import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton, SxProps, Theme } from '@mui/material';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  preload?: boolean;
  objectFit?: string;
  sx?: SxProps<Theme>;
}

/**
 * 图片懒加载组件
 * - 永远显示 <img>，不再用 display:none 隐藏（防止缓存不触发 onLoad 导致图片消失）
 * - 加载中时 Skeleton 作为绝对定位叠加层，加载完成后消失
 * - 加载失败显示占位图标
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  preload = false,
  objectFit = 'cover',
  sx,
}) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 检测缓存命中
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if (el.complete) {
      if (el.naturalWidth > 0) {
        setLoaded(true);
        setError(false);
      } else {
        setLoaded(true);
        setError(true);
      }
    }
    // src 变化时重置
    return () => { setLoaded(false); setError(false); };
  }, [src]);

  // 预加载
  useEffect(() => {
    if (preload && src) {
      const existingLink = document.querySelector(`link[rel="preload"][as="image"][href="${src}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      }
    }
  }, [preload, src]);

  const handleLoad = () => { setLoaded(true); setError(false); };
  const handleError = () => { setLoaded(true); setError(true); };

  return (
    <Box
      sx={{
        position: 'relative',
        width: width ?? '100%',
        height: height ?? 'auto',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* Skeleton 叠加层 — 加载完成后隐藏 */}
      {!loaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
      )}

      {/* 加载失败显示占位图标 */}
      {error ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            minHeight: 120,
            bgcolor: 'grey.100',
          }}
        >
          <ImageNotSupportedIcon sx={{ fontSize: 48, color: 'grey.400' }} />
        </Box>
      ) : (
        <Box
          ref={imgRef}
          component="img"
          src={src}
          alt={alt}
          // loading=lazy 对首屏（第一张）无效，正好需要立即加载
          // 对后续图片延迟加载，提升性能
          loading={preload ? undefined : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          sx={{
            width: '100%',
            height: '100%',
            objectFit,
          }}
        />
      )}
    </Box>
  );
};

export default LazyImage;
