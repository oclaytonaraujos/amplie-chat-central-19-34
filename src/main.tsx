import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeOptimizations } from './utils/remove-unused'
import { initPerformanceOptimizations } from './utils/performance-optimizations'

// Inicializar otimizações críticas
initializeOptimizations();
initPerformanceOptimizations();

createRoot(document.getElementById("root")!).render(<App />);
