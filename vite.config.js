import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          web3: ['wagmi', 'viem', 'ethers']
        }
      }
    }
  },
  define: {
    'process.env.VITE_USDT_RECIPIENT': JSON.stringify(process.env.VITE_USDT_RECIPIENT),
    'process.env.VITE_BSC_SCAN_API_KEY': JSON.stringify(process.env.VITE_BSC_SCAN_API_KEY)
  },
  envPrefix: 'VITE_',
  server: {
    port: 3002,
    strictPort: true
  }
});
