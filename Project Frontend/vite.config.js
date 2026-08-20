import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons')) {
            return 'vendor-ui'
          }
          if (id.includes('node_modules/formik') || id.includes('node_modules/yup')) {
            return 'vendor-form'
          }
          if (id.includes('node_modules/react-use-cart')) {
            return 'vendor-cart'
          }
          if (id.includes('node_modules/swiper')) {
            return 'vendor-swiper'
          }
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios'
          }
        }
      }
    },
  }
})
