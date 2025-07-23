import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: mode === 'production' ? 'esbuild' : false,
    cssMinify: mode === 'production',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks otimizados para reduzir TBT
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            return 'vendor';
          }
          
          // Chunks por página para melhor code splitting
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            return `page-${pageName.toLowerCase()}`;
          }
          
          // Chunks por funcionalidade
          if (id.includes('/components/admin/')) {
            return 'admin-components';
          }
          
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          
          if (id.includes('/components/flow/')) {
            return 'flow-components';
          }
          
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
          
          if (id.includes('/services/')) {
            return 'services';
          }
        }
      }
    },
    chunkSizeWarningLimit: 300, // Reduzido para alertar chunks grandes
    assetsInlineLimit: 2048 // Reduzido para melhorar cacheability
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react'
    ],
    exclude: ['@xyflow/react'] // Lazy load para reduzir bundle inicial
  }
}));
