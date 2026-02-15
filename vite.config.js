export default {
  build: {
    outDir: '../dist', // Output to project root, not src
    emptyOutDir: true
  },
  server: {
    port: 3000
  },
  root: 'src'  // Keep src as root for index.html
}