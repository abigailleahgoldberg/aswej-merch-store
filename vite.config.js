import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: '/index.html',
        blog: '/src/blog.html',
        cart: '/src/cart.html',
        admin: '/src/admin.html',
        success: '/src/success.html'
      }
    }
  },
  server: {
    port: 3000
  }
});