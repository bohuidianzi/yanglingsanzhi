import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // MUI 核心
          'mui-core': ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
          // MUI 图标（最大的包）
          'mui-icons': ['@mui/icons-material'],
          // 动效库
          'motion': ['framer-motion'],
          // Axios
          'axios': ['axios'],
        },
      },
    },
  },
});
