import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, tudo que começa com /api é repassado para o
// back-end local (http://localhost:3001). Assim não precisa configurar
// VITE_API_URL para rodar no seu computador.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
