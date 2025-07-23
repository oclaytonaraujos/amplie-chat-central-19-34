
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect, startTransition } from "react";

// Core providers e configurações críticas
import { ThemeProvider } from "@/hooks/useTheme";
import { queryClient } from "@/config/queryClient";
import { setupGlobalErrorHandling } from "@/utils/production-logger";
import { EvolutionApiProvider } from "@/contexts/EvolutionApiContext";

// Lazy load componentes críticos - Layout NÃO lazy para manter navegação fluida
const AuthProvider = lazy(() => import("@/hooks/useAuth").then(m => ({ default: m.AuthProvider })));
// AdminAuthProvider NÃO deve ser lazy para evitar problemas na rota /admin
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute").then(m => ({ default: m.ProtectedRoute })));
import { Layout } from "@/components/layout/Layout";

// Páginas - todas lazy loaded
const Auth = lazy(() => import("@/pages/Auth"));
const SuperAdmin = lazy(() => import("@/pages/SuperAdmin"));
const Painel = lazy(() => import("@/pages/Painel"));
const Dashboard = lazy(() => import("@/pages/DashboardOptimized"));
const Atendimento = lazy(() => import("@/pages/Atendimento"));
const Contatos = lazy(() => import("@/pages/Contatos"));
const Kanban = lazy(() => import("@/pages/Kanban"));
const ChatBot = lazy(() => import("@/pages/ChatBot"));
const FlowBuilder = lazy(() => import("@/pages/FlowBuilder"));
const Usuarios = lazy(() => import("@/pages/Usuarios"));
const Setores = lazy(() => import("@/pages/Setores"));

// Páginas menos críticas - carregamento sob demanda
const ChatInterno = lazy(() => import("@/pages/ChatInterno"));
const Automations = lazy(() => import("@/pages/Automations"));
const GerenciarEquipe = lazy(() => import("@/pages/GerenciarEquipe"));
const MeuPerfil = lazy(() => import("@/pages/MeuPerfil"));
const PlanoFaturamento = lazy(() => import("@/pages/PlanoFaturamento"));
const MelhoriasDashboard = lazy(() => import("@/pages/MelhoriasDashboard"));

// Páginas de configuração - carregamento tardio
const ConfiguracoesGerais = lazy(() => import("@/pages/configuracoes/ConfiguracoesGerais"));
const ConfiguracoesAvancadas = lazy(() => import("@/pages/configuracoes/ConfiguracoesAvancadas"));
const PreferenciasNotificacao = lazy(() => import("@/pages/configuracoes/PreferenciasNotificacao"));
const Aparencia = lazy(() => import("@/pages/configuracoes/Aparencia"));
const Idioma = lazy(() => import("@/pages/configuracoes/Idioma"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Fallback otimizado para Core Web Vitals (app completo)
const FastFallback = () => (
  <div className="h-screen w-full bg-background flex items-center justify-center">
    <div className="loading-spinner" />
    <div className="sr-only">Carregando...</div>
  </div>
);

// Fallback otimizado para conteúdo da página (apenas área do conteúdo)
const PageContentFallback = () => (
  <div className="flex items-center justify-center h-40 w-full">
    <div className="loading-spinner" />
    <div className="sr-only">Carregando página...</div>
  </div>
);

// Preload inteligente com base na rota atual e padrões de uso
const preloadCriticalPages = () => {
  requestIdleCallback(() => {
    const currentPath = window.location.pathname;
    
    // Mapear rotas críticas por contexto
    const criticalRoutes: Record<string, string[]> = {
      '/': ['@/pages/Atendimento', '@/pages/Contatos'],
      '/painel': ['@/pages/Atendimento', '@/pages/Contatos'],
      '/dashboard': ['@/pages/Atendimento', '@/pages/Contatos'],
      '/auth': ['@/pages/Painel']
    };

    const routesToPreload = criticalRoutes[currentPath] || [];
    
    // Preload apenas se não estamos em conexão lenta
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === '2g' || connection.saveData) {
        return; // Skip preload em conexões lentas
      }
    }

    routesToPreload.forEach(route => {
      try {
        import(route);
      } catch (error) {
        console.warn(`Failed to preload ${route}:`, error);
      }
    });
  });
};

function AppRoutes() {
  useEffect(() => {
    startTransition(() => {
      preloadCriticalPages();
    });
  }, []);

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Layout title="Painel" description="Visão geral do sistema">
            <Suspense fallback={<PageContentFallback />}>
              <Painel />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/auth" element={
        <Suspense fallback={<FastFallback />}>
          <Auth />
        </Suspense>
      } />
      
      <Route path="/admin" element={
        <Suspense fallback={<FastFallback />}>
          <ProtectedRoute>
            <SuperAdmin />
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/painel" element={
        <ProtectedRoute>
          <Layout title="Painel" description="Visão geral do sistema">
            <Suspense fallback={<PageContentFallback />}>
              <Painel />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout title="Dashboard" description="Métricas e estatísticas">
            <Suspense fallback={<PageContentFallback />}>
              <Dashboard />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/atendimento" element={
        <ProtectedRoute>
          <Layout title="Atendimento" description="Central de atendimento">
            <Suspense fallback={<PageContentFallback />}>
              <Atendimento />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/contatos" element={
        <ProtectedRoute>
          <Layout title="Contatos" description="Gerenciamento de contatos">
            <Suspense fallback={<PageContentFallback />}>
              <Contatos />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rotas menos críticas com lazy loading tardio */}
      <Route path="/kanban" element={
        <ProtectedRoute>
          <Layout title="Kanban" description="Quadro de tarefas">
            <Suspense fallback={<PageContentFallback />}>
              <Kanban />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/chatbot" element={
        <ProtectedRoute>
          <Layout title="ChatBot" description="Automação inteligente">
            <Suspense fallback={<PageContentFallback />}>
              <ChatBot />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/chatbot/flow-builder/:id" element={
        <Suspense fallback={<FastFallback />}>
          <ProtectedRoute>
            <FlowBuilder />
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/usuarios" element={
        <ProtectedRoute>
          <Layout title="Usuários" description="Gerenciamento de usuários">
            <Suspense fallback={<PageContentFallback />}>
              <Usuarios />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/setores" element={
        <ProtectedRoute>
          <Layout title="Setores" description="Organização por setores">
            <Suspense fallback={<PageContentFallback />}>
              <Setores />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rotas de baixa prioridade */}
      <Route path="/automations" element={
        <ProtectedRoute>
          <Layout title="Automações" description="Fluxos de automação">
            <Suspense fallback={<PageContentFallback />}>
              <Automations />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/chat-interno" element={
        <ProtectedRoute>
          <Layout title="Chat Interno" description="Comunicação interna">
            <Suspense fallback={<PageContentFallback />}>
              <ChatInterno />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/gerenciar-equipe" element={
        <ProtectedRoute>
          <Layout title="Gerenciar Equipe" description="Administração da equipe">
            <Suspense fallback={<PageContentFallback />}>
              <GerenciarEquipe />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/meu-perfil" element={
        <ProtectedRoute>
          <Layout title="Meu Perfil" description="Configurações pessoais">
            <Suspense fallback={<PageContentFallback />}>
              <MeuPerfil />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/plano-faturamento" element={
        <ProtectedRoute>
          <Layout title="Plano e Faturamento" description="Gerenciamento financeiro">
            <Suspense fallback={<PageContentFallback />}>
              <PlanoFaturamento />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Configurações - carregamento sob demanda */}
      <Route path="/configuracoes/gerais" element={
        <ProtectedRoute>
          <Layout title="Configurações Gerais" description="Configurações do sistema">
            <Suspense fallback={<PageContentFallback />}>
              <ConfiguracoesGerais />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes/avancadas" element={
        <ProtectedRoute>
          <Layout title="Configurações Avançadas" description="Configurações técnicas">
            <Suspense fallback={<PageContentFallback />}>
              <ConfiguracoesAvancadas />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes/notificacoes" element={
        <ProtectedRoute>
          <Layout title="Notificações" description="Preferências de notificação">
            <Suspense fallback={<PageContentFallback />}>
              <PreferenciasNotificacao />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes/aparencia" element={
        <ProtectedRoute>
          <Layout title="Aparência" description="Personalização visual">
            <Suspense fallback={<PageContentFallback />}>
              <Aparencia />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes/idioma" element={
        <ProtectedRoute>
          <Layout title="Idioma" description="Configurações de idioma">
            <Suspense fallback={<PageContentFallback />}>
              <Idioma />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={
        <Suspense fallback={<FastFallback />}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  );
}

const App = () => {
  useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <EvolutionApiProvider>
          <Suspense fallback={<FastFallback />}>
            <AuthProvider>
              <AdminAuthProvider>
                <TooltipProvider>
                  <Toaster />
                  <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </TooltipProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </Suspense>
      </EvolutionApiProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
};

export default App;
