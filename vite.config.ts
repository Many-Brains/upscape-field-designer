import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*'],
      manifest: {
        name: 'Upscape Field Designer',
        short_name: 'Upscape',
        description: 'Capture site lighting designs in the field',
        theme_color: '#181818',
        background_color: '#181818',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/styles\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mapbox-tiles',
              expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/geocoding\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mapbox-geocode',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
})
