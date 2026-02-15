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
  define: {
    // Ensure environment variables are properly replaced
    'process.env.VITE_STRIPE_PUBLISHABLE_KEY': 
      JSON.stringify(process.env.VITE_STRIPE_PUBLISHABLE_KEY)
  },
  server: {
    port: 3000
  }
});