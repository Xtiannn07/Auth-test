import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'esnext', // This enables support for top-level await
    chunkSizeWarningLimit: 1000, // Increased from default 500kb to 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          // Group React and related packages
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // If you're using any state management libraries
          'state-management': ['redux', 'react-redux', 'recoil', 'zustand'].filter(
            dep => {
              try {
                return !!require.resolve(dep)
              } catch (e) {
                return false
              }
            }
          ),
          
          // UI libraries if you're using any
          'ui-libs': ['@mui/material', '@emotion/react', '@emotion/styled', 'antd', 'chakra-ui'].filter(
            dep => {
              try {
                return !!require.resolve(dep)
              } catch (e) {
                return false
              }
            }
          )
        }
      }
    }
  }
})