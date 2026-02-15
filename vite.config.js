import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cart: resolve(__dirname, 'cart.html'),
        blog: resolve(__dirname, 'blog.html'),
        admin: resolve(__dirname, 'admin.html'),
        success: resolve(__dirname, 'success.html')
      }
    }
  }
});