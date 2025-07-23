import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeOptimizations } from './utils/remove-unused'

// Inicializar otimizações
initializeOptimizations();

createRoot(document.getElementById("root")!).render(<App />);
