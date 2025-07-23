import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeOptimizations } from './utils/remove-unused'
import { initPerformanceOptimizations } from './utils/performance-optimizations'
import { initPerformanceMonitor } from './utils/performance-monitor'

// Inicializar otimizações críticas de forma assíncrona para reduzir TBT
requestIdleCallback(() => {
  initializeOptimizations();
  initPerformanceOptimizations();
});

// Inicializar monitor de performance
initPerformanceMonitor();

// Preload critical resources
const preloadCritical = () => {
  // Preload CSS crítico
  const criticalFonts = [
    '/fonts/Inter-Regular.woff2',
    '/fonts/Inter-Medium.woff2'
  ];
  
  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Executar preload apenas se necessário
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preloadCritical);
} else {
  preloadCritical();
}

createRoot(document.getElementById("root")!).render(<App />);
