import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa" //

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Yumaste Shop',
        short_name: 'Yumaste',
        description: 'La tua piattaforma per ordinare food kit e ingredienti',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        // AGGIUNTA DEGLI SCREENSHOT PER LA RICHER UI
        screenshots: [
          {
            src: 'Catalogo_Box.png', // Assicurati di averlo copiato in public/
            sizes: '1920x1080', // Inserisci le dimensioni esatte della tua immagine qui
            type: 'image/png',
            form_factor: 'wide' // Indica che è per Desktop
          },
          {
            src: 'mobile_screenshot.png', // Il nuovo screenshot verticale da mettere in public/
            sizes: '1080x1920', // Dimensioni orientative verticali
            type: 'image/png' // form_factor omesso (o "narrow") indica Mobile
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 9000,
    strictPort: true,
    host: true
  }
})