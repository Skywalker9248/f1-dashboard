import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          react: ['react', 'react-dom', 'react-router-dom'],
          // MUI + styling
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled', 'styled-components'],
          // Charts
          echarts: ['echarts', 'echarts-for-react'],
          // HTTP client
          axios: ['axios'],
        },
      },
    },
  },
})
