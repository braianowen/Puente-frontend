import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Configuración específica para el build
  build: {
    outDir: 'dist', // Asegura que el build vaya a esta carpeta
    emptyOutDir: true, // Limpia el directorio antes de cada build
    sourcemap: false // Opcional: desactiva sourcemaps para producción
  },
  
  // Configuración del servidor de desarrollo (opcional para Docker)
  server: {
    host: true, // Escucha en todas las interfaces
    port: 3000,
    strictPort: true,
    // Configura proxy para API (coherente con tu nginx.conf)
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // Configuración para preview (opcional)
  preview: {
    port: 3000,
    strictPort: true
  }
});