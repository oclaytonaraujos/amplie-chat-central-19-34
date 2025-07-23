/**
 * Sistema de preload inteligente para otimização de carregamento
 */

import { useState, useEffect, useCallback } from 'react';

// Cache de componentes já carregados
const componentCache = new Map<string, Promise<any>>();

// Preload baseado na rota atual e padrões de navegação
export const useIntelligentPreload = () => {
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set());

  // Mapear rotas críticas baseadas na rota atual
  const getRelatedRoutes = useCallback((currentPath: string): string[] => {
    const routeMap: Record<string, string[]> = {
      '/': ['/dashboard', '/atendimento', '/contatos'],
      '/auth': ['/dashboard', '/painel'],
      '/dashboard': ['/atendimento', '/contatos', '/kanban'],
      '/painel': ['/dashboard', '/atendimento', '/usuarios'],
      '/atendimento': ['/contatos', '/kanban', '/chat-interno'],
      '/contatos': ['/atendimento', '/usuarios'],
      '/kanban': ['/atendimento', '/contatos'],
      '/chatbot': ['/chatbot/flow-builder', '/automations'],
      '/usuarios': ['/setores', '/gerenciar-equipe'],
      '/setores': ['/usuarios', '/configuracoes/gerais']
    };

    return routeMap[currentPath] || [];
  }, []);

  // Preload componentes de forma inteligente
  const preloadRoute = useCallback(async (routePath: string): Promise<void> => {
    if (preloadedRoutes.has(routePath) || componentCache.has(routePath)) {
      return;
    }

    try {
      // Marcar como sendo carregado
      setPreloadedRoutes(prev => new Set([...prev, routePath]));

      // Mapear rotas para componentes
      const routeToComponent: Record<string, () => Promise<any>> = {
        '/dashboard': () => import('@/pages/Dashboard'),
        '/painel': () => import('@/pages/Painel'),
        '/atendimento': () => import('@/pages/Atendimento'),
        '/contatos': () => import('@/pages/Contatos'),
        '/kanban': () => import('@/pages/Kanban'),
        '/chatbot': () => import('@/pages/ChatBot'),
        '/usuarios': () => import('@/pages/Usuarios'),
        '/setores': () => import('@/pages/Setores'),
        '/chat-interno': () => import('@/pages/ChatInterno'),
        '/automations': () => import('@/pages/Automations'),
        '/gerenciar-equipe': () => import('@/pages/GerenciarEquipe'),
        '/meu-perfil': () => import('@/pages/MeuPerfil'),
        '/configuracoes/gerais': () => import('@/pages/configuracoes/ConfiguracoesGerais'),
      };

      const componentLoader = routeToComponent[routePath];
      if (componentLoader && !componentCache.has(routePath)) {
        const componentPromise = componentLoader();
        componentCache.set(routePath, componentPromise);
        await componentPromise;
      }
    } catch (error) {
      console.warn(`Failed to preload route ${routePath}:`, error);
      // Remove da lista de preloadedRoutes se falhou
      setPreloadedRoutes(prev => {
        const newSet = new Set(prev);
        newSet.delete(routePath);
        return newSet;
      });
    }
  }, [preloadedRoutes]);

  // Preload baseado na rota atual
  const preloadRelatedRoutes = useCallback(async (currentPath: string) => {
    const relatedRoutes = getRelatedRoutes(currentPath);
    
    // Preload em paralelo com throttling
    const preloadPromises = relatedRoutes
      .filter(route => !preloadedRoutes.has(route))
      .slice(0, 3) // Limitar a 3 rotas por vez
      .map(route => preloadRoute(route));

    await Promise.allSettled(preloadPromises);
  }, [getRelatedRoutes, preloadRoute, preloadedRoutes]);

  // Preload com base em interação do usuário
  const preloadOnHover = useCallback((routePath: string) => {
    if (!preloadedRoutes.has(routePath)) {
      // Debounce hover events
      setTimeout(() => preloadRoute(routePath), 100);
    }
  }, [preloadRoute, preloadedRoutes]);

  return {
    preloadRelatedRoutes,
    preloadOnHover,
    preloadedRoutes: Array.from(preloadedRoutes),
    cacheSize: componentCache.size
  };
};

// Preload de recursos críticos
export const preloadCriticalResources = () => {
  // Preload apenas se há bandwidth suficiente
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection.effectiveType === '2g' || connection.saveData) {
      return; // Não preload em conexões lentas
    }
  }

  requestIdleCallback(() => {
    // Preload componentes UI críticos
    const criticalComponents = [
      () => import('@/components/ui/button'),
      () => import('@/components/ui/input'),
      () => import('@/components/ui/dialog'),
      () => import('@/components/ui/table'),
      () => import('@/components/ui/card'),
    ];

    criticalComponents.forEach(loader => {
      try {
        loader();
      } catch (error) {
        console.warn('Failed to preload critical component:', error);
      }
    });
  });
};

// Hook para cache de dados
export const useDataCache = <T>(key: string, fetcher: () => Promise<T>, ttl: number = 5 * 60 * 1000) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = `cache_${key}`;
  const timestampKey = `cache_${key}_timestamp`;

  const fetchData = useCallback(async (force = false) => {
    try {
      // Verificar cache
      if (!force) {
        const cached = localStorage.getItem(cacheKey);
        const timestamp = localStorage.getItem(timestampKey);
        
        if (cached && timestamp) {
          const age = Date.now() - parseInt(timestamp);
          if (age < ttl) {
            setData(JSON.parse(cached));
            return;
          }
        }
      }

      setLoading(true);
      setError(null);
      
      const result = await fetcher();
      
      // Armazenar no cache
      localStorage.setItem(cacheKey, JSON.stringify(result));
      localStorage.setItem(timestampKey, Date.now().toString());
      
      setData(result);
    } catch (err) {
      setError(err as Error);
      // Tentar usar cache em caso de erro
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setData(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  }, [cacheKey, timestampKey, fetcher, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData(true) };
};