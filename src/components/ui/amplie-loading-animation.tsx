/**
 * Animação de carregamento da Aplie Chat
 * Efeito de fragmentação e recomposição da logo
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AmplieChatLogoFragment {
  id: number;
  x: number;
  y: number;
  path: string;
  delay: number;
  color: 'neon' | 'electric' | 'purple' | 'fragment';
}

interface AplieLoadingAnimationProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AplieLoadingAnimation: React.FC<AplieLoadingAnimationProps> = ({
  isVisible,
  onAnimationComplete,
  className,
  size = 'lg'
}) => {
  const [isAnimating, setIsAnimating] = useState(true);

  // Define tamanhos baseados na prop size
  const sizeMap = {
    sm: { width: 80, height: 80, strokeWidth: 1 },
    md: { width: 120, height: 120, strokeWidth: 1.5 },
    lg: { width: 160, height: 160, strokeWidth: 2 },
    xl: { width: 200, height: 200, strokeWidth: 2.5 }
  };

  const { width, height, strokeWidth } = sizeMap[size];

  // Fragmentos da logo baseados na imagem fornecida
  const logoFragments: AmplieChatLogoFragment[] = [
    // Fragmentos principais do chip/coração
    { id: 1, x: 40, y: 20, path: "M40,20 L60,30 L50,50 Z", delay: 0, color: 'neon' },
    { id: 2, x: 60, y: 30, path: "M60,30 L80,20 L70,50 Z", delay: 0.1, color: 'electric' },
    { id: 3, x: 80, y: 20, path: "M80,20 L100,40 L80,60 Z", delay: 0.2, color: 'purple' },
    { id: 4, x: 20, y: 40, path: "M20,40 L40,20 L30,70 Z", delay: 0.15, color: 'neon' },
    { id: 5, x: 100, y: 40, path: "M100,40 L120,30 L110,70 Z", delay: 0.25, color: 'electric' },
    
    // Fragmentos da rede neural/conexões
    { id: 6, x: 30, y: 70, path: "M30,70 L50,50 L40,90 Z", delay: 0.3, color: 'fragment' },
    { id: 7, x: 70, y: 50, path: "M70,50 L90,70 L80,30 Z", delay: 0.35, color: 'purple' },
    { id: 8, x: 50, y: 90, path: "M50,90 L70,80 L60,110 Z", delay: 0.4, color: 'neon' },
    { id: 9, x: 90, y: 70, path: "M90,70 L110,90 L100,50 Z", delay: 0.45, color: 'electric' },
    
    // Fragmentos menores (partículas)
    { id: 10, x: 10, y: 10, path: "M10,10 L20,15 L15,25 Z", delay: 0.5, color: 'fragment' },
    { id: 11, x: 130, y: 15, path: "M130,15 L140,10 L135,25 Z", delay: 0.55, color: 'neon' },
    { id: 12, x: 15, y: 120, path: "M15,120 L25,115 L20,135 Z", delay: 0.6, color: 'electric' },
    { id: 13, x: 125, y: 110, path: "M125,110 L135,120 L130,95 Z", delay: 0.65, color: 'purple' },
    
    // Conectores (linhas da rede)
    { id: 14, x: 40, y: 60, path: "M40,60 L80,60", delay: 0.7, color: 'fragment' },
    { id: 15, x: 60, y: 40, path: "M60,40 L60,80", delay: 0.75, color: 'neon' },
    { id: 16, x: 30, y: 50, path: "M30,50 L90,50", delay: 0.8, color: 'electric' }
  ];

  const getColorClass = (color: string, type: 'fill' | 'stroke' = 'fill') => {
    const prefix = type === 'fill' ? 'fill' : 'stroke';
    switch (color) {
      case 'neon': return `${prefix}-amplie-neon`;
      case 'electric': return `${prefix}-amplie-electric`;
      case 'purple': return `${prefix}-amplie-purple`;
      default: return `${prefix}-amplie-fragment`;
    }
  };

  // Configurações de animação sem tipagem conflitante
  const fragmentInitial = {
    scale: 0,
    opacity: 0,
    x: 0,
    y: 0,
    rotate: 0
  };

  const fragmentAnimate = {
    scale: 1,
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0
  };

  const fragmentExit = {
    scale: 0,
    opacity: 0,
    x: 0,
    y: 0,
    rotate: 0
  };

  // Animação do container principal
  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  // Efeito de loop da animação
  useEffect(() => {
    if (!isVisible) return;

    const animationCycle = () => {
      setIsAnimating(false);
      setTimeout(() => {
        setIsAnimating(true);
      }, 500);
    };

    const interval = setInterval(animationCycle, 4000);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Callback quando animação termina
  useEffect(() => {
    if (!isVisible && onAnimationComplete) {
      onAnimationComplete();
    }
  }, [isVisible, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-background/95 backdrop-blur-sm",
      className
    )}>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative"
        style={{ width: width + 40, height: height + 40 }}
      >
        {/* SVG Container */}
        <svg
          width={width + 40}
          height={height + 40}
          viewBox="0 0 160 160"
          className="absolute inset-0"
        >
          <defs>
            {/* Filtros para efeitos de brilho */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Gradientes */}
            <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--amplie-neon))" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="hsl(var(--amplie-electric))" stopOpacity="0.6"/>
            </linearGradient>
          </defs>

          <AnimatePresence mode="wait">
            {isAnimating && logoFragments.map((fragment) => (
              <motion.g key={fragment.id}>
                <motion.path
                  d={fragment.path}
                  className={getColorClass(fragment.color)}
                  strokeWidth={strokeWidth}
                  fill={fragment.path.includes('Z') ? undefined : 'none'}
                  stroke={fragment.path.includes('Z') ? 'none' : undefined}
                  filter="url(#glow)"
                  initial={fragmentInitial}
                  animate={fragmentAnimate}
                  exit={fragmentExit}
                  custom={fragment.delay}
                  transition={{ delay: fragment.delay }}
                />
              </motion.g>
            ))}
          </AnimatePresence>
        </svg>

        {/* Efeitos de partículas flutuantes */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-amplie-neon opacity-60"
              animate={{
                x: [0, Math.random() * 40 - 20, 0],
                y: [0, Math.random() * 40 - 20, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%'
              }}
            />
          ))}
        </div>

        {/* Texto de carregamento */}
        <motion.div
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.p
            className="text-sm font-medium text-muted-foreground text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Aplie Chat
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AplieLoadingAnimation;