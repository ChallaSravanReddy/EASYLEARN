import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@botpress/webchat/react': '@botpress/webchat/dist/webchat-react-ui.es.js',
    },
  },
});