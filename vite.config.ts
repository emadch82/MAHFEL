import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression2';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          overlay: true,
        },
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
          },
          '/uploads': {
            target: 'http://localhost:5000',
            changeOrigin: true,
          },
        },
      },
      plugins: [
        react(),
        ...(mode === 'production' ? [
          viteCompression({ algorithm: 'gzip', threshold: 1024 }),
          viteCompression({ algorithm: 'brotliCompress', threshold: 1024 }),
        ] : []),
      ],
      build: {
        target: 'es2020',
        minify: 'esbuild',
        cssMinify: 'esbuild',
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
            },
          },
        },
        chunkSizeWarningLimit: 1000,
        reportCompressedSize: false,
        sourcemap: false,
      },
      optimizeDeps: {
        include: ['react', 'react-dom'],
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      css: {
        devSourcemap: true,
      },
    };
});
