import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@store': path.resolve(__dirname, './src/store'),
      '@mocks': path.resolve(__dirname, './src/mocks'),
      '@interfaces': path.resolve(__dirname, './src/interfaces'),
      '@router': path.resolve(__dirname, './src/router'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
