import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000, // <--- Inserisci qui la porta che preferisci
    strictPort: true,
    host: true // Importante per Code With Me: permette le connessioni esterne// Opzionale: se la 3000 è occupata, Vite fallisce invece di provare la 3001
  }
})