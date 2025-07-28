// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // 使用5174端口避免冲突
    host: '0.0.0.0', // 暴露到所有网络接口
  },
  build: {
    outDir: 'dist', // 输出目录
  },
});
