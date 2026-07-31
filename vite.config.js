import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
    },
  },
  server: {
    port: 8080,
    host: '127.0.0.1',
    proxy: {
      '/ticket': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/lanus': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/tenant_management': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/lvs': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/dns_module': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/hyperv': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/nat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/vm_collection': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/asset': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/processes': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/process': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/vms': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/tickets': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ticket_types': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/components/style/var" as *;`,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    testTimeout: 15000, 
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    globals: true,
    setupFiles: ['tests/setup.js'],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      reportsDirectory: 'tests/coverage',
      include: ['src/**/*.{js,vue}'],
      exclude: [
        'src/main.js',
        'src/store/**',
        'src/router/config.js',
        'src/config/config.prod.js',
      ],
    },
  },
});
