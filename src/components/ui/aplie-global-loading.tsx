/**
 * Componente global de loading da Aplie Chat
 * Gerencia o estado de carregamento da aplicação
 */
import React, { useEffect } from 'react';
import AplieLoadingAnimation from './amplie-loading-animation';
import { useLoadingAnimation } from '@/hooks/useLoadingAnimation';

interface AplieGlobalLoadingProps {
  isAppLoading?: boolean;
  onLoadingComplete?: () => void;
  minDuration?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AplieGlobalLoading: React.FC<AplieGlobalLoadingProps> = ({
  isAppLoading = true,
  onLoadingComplete,
  minDuration = 3000,
  size = 'lg',
  className
}) => {
  const { isVisible, setLoading } = useLoadingAnimation({
    minDuration,
    autoHide: true
  });

  // Atualiza estado baseado na prop externa
  useEffect(() => {
    setLoading(isAppLoading);
  }, [isAppLoading, setLoading]);

  // Callback quando animação termina
  const handleAnimationComplete = () => {
    if (onLoadingComplete) {
      onLoadingComplete();
    }
  };

  return (
    <AplieLoadingAnimation
      isVisible={isVisible}
      onAnimationComplete={handleAnimationComplete}
      size={size}
      className={className}
    />
  );
};

// Hook para controlar loading de qualquer lugar da aplicação
export const useAplieLoading = () => {
  const { isLoading, setLoading, hideAnimation, showAnimation } = useLoadingAnimation();

  return {
    isLoading,
    startLoading: () => setLoading(true),
    stopLoading: () => setLoading(false),
    hideLoading: hideAnimation,
    showLoading: showAnimation
  };
};

export default AplieGlobalLoading;