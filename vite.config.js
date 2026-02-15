import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'src/blog.html'),
        cart: resolve(__dirname, 'src/cart.html'),
        admin: resolve(__dirname, 'src/admin.html'),
        success: resolve(__dirname, 'src/success.html')
      }
    }
  },
  define: {
    'process.env.VITE_STRIPE_PUBLISHABLE_KEY': 
      JSON.stringify(process.env.VITE_STRIPE_PUBLISHABLE_KEY)
  }
});