
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect, startTransition } from "react";

// Animação de carregamento da Aplie Chat
import AplieLoadingAnimation from "@/components/ui/amplie-loading-animation";

// Core providers e configurações críticas
import { ThemeProvider } from "@/hooks/useTheme";
import { queryClient } from "@/config/queryClient";
import { setupGlobalErrorHandling } from "@/utils/production-logger";

// Lazy load TUDO para máxima performance
const AuthProvider = lazy(() => import("@/hooks/useAuth").then(m => ({ default: m.AuthProvider })));
const AdminAuthProvider = lazy(() => import("@/hooks/useAdminAuth").then(m => ({ default: m.AdminAuthProvider })));
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute").then(m => ({ default: m.ProtectedRoute })));
const Layout = lazy(() => import("@/components/layout/Layout").then(m => ({ default: m.Layout })));

// Páginas - todas lazy loaded
const Auth = lazy(() => import("@/pages/Auth"));
const SuperAdmin = lazy(() => import("@/pages/SuperAdmin"));
const Painel = lazy(() => import("@/pages/Painel"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
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

// Fallback com animação da Aplie Chat
const ApliePageLoader = () => (
  <AplieLoadingAnimation isVisible={true} size="md" />
);

// Preload inteligente apenas das rotas mais usadas
const preloadCriticalPages = () => {
  requestIdleCallback(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/painel') {
      import('@/pages/Dashboard');
      import('@/pages/Atendimento');
    }
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
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Painel" description="Visão geral do sistema">
              <Painel />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/auth" element={
        <Suspense fallback={<ApliePageLoader />}>
          <Auth />
        </Suspense>
      } />
      
      <Route path="/admin" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <SuperAdmin />
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/painel" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Painel" description="Visão geral do sistema">
              <Painel />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/dashboard" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Dashboard" description="Métricas e estatísticas">
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/atendimento" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Atendimento" description="Central de atendimento">
              <Atendimento />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/contatos" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Contatos" description="Gerenciamento de contatos">
              <Contatos />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      {/* Rotas menos críticas com lazy loading tardio */}
      <Route path="/kanban" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Kanban" description="Quadro de tarefas">
              <Kanban />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/chatbot" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="ChatBot" description="Automação inteligente">
              <ChatBot />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/chatbot/flow-builder/:id" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <FlowBuilder />
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/usuarios" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Usuários" description="Gerenciamento de usuários">
              <Usuarios />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/setores" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Setores" description="Organização por setores">
              <Setores />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      {/* Rotas de baixa prioridade */}
      <Route path="/automations" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Automações" description="Fluxos de automação">
              <Automations />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/chat-interno" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Chat Interno" description="Comunicação interna">
              <ChatInterno />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/gerenciar-equipe" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Gerenciar Equipe" description="Administração da equipe">
              <GerenciarEquipe />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/meu-perfil" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Meu Perfil" description="Configurações pessoais">
              <MeuPerfil />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/plano-faturamento" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Plano e Faturamento" description="Gerenciamento financeiro">
              <PlanoFaturamento />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />

      {/* Configurações - carregamento sob demanda */}
      <Route path="/configuracoes/gerais" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Configurações Gerais" description="Configurações do sistema">
              <ConfiguracoesGerais />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/configuracoes/avancadas" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Configurações Avançadas" description="Configurações técnicas">
              <ConfiguracoesAvancadas />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/configuracoes/notificacoes" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Notificações" description="Preferências de notificação">
              <PreferenciasNotificacao />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/configuracoes/aparencia" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Aparência" description="Personalização visual">
              <Aparencia />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="/configuracoes/idioma" element={
        <Suspense fallback={<ApliePageLoader />}>
          <ProtectedRoute>
            <Layout title="Idioma" description="Configurações de idioma">
              <Idioma />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      } />
      
      <Route path="*" element={
        <Suspense fallback={<ApliePageLoader />}>
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
        <Suspense fallback={<ApliePageLoader />}>
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
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
