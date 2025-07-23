/**
 * Hook para gerenciar a animação de carregamento da Aplie Chat
 */
import { useState, useEffect } from 'react';

interface UseLoadingAnimationProps {
  minDuration?: number; // Duração mínima em ms
  autoHide?: boolean;   // Se deve esconder automaticamente quando carregamento terminar
}

export const useLoadingAnimation = ({
  minDuration = 2000,
  autoHide = true
}: UseLoadingAnimationProps = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [loadingStartTime] = useState(Date.now());

  // Função para definir o estado de carregamento
  const setLoading = (loading: boolean) => {
    if (!loading && autoHide) {
      const elapsed = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minDuration - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
        setIsVisible(false);
      }, remainingTime);
    } else {
      setIsLoading(loading);
      if (!loading) setIsVisible(false);
    }
  };

  // Função para forçar esconder a animação
  const hideAnimation = () => {
    setIsLoading(false);
    setIsVisible(false);
  };

  // Função para mostrar a animação novamente
  const showAnimation = () => {
    setIsLoading(true);
    setIsVisible(true);
  };

  // Auto-hide após um tempo máximo (15 segundos)
  useEffect(() => {
    const maxTimeout = setTimeout(() => {
      if (autoHide && isLoading) {
        hideAnimation();
      }
    }, 15000);

    return () => clearTimeout(maxTimeout);
  }, [autoHide, isLoading]);

  return {
    isLoading,
    isVisible,
    setLoading,
    hideAnimation,
    showAnimation
  };
};