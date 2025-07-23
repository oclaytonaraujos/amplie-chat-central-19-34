import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ErrorBoundaryAdmin } from '@/components/admin/ErrorBoundaryAdmin';

// Componentes consolidados por área
import EmpresasTab from '@/components/admin/EmpresasTab';
import UsuariosTab from '@/components/admin/UsuariosTab';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import PlanosGerenciamento from '@/components/admin/PlanosGerenciamento';
import IntegracoesCentralizadas from '@/components/admin/IntegracoesCentralizadas';
import ConfiguracoesAvancadas from '@/components/admin/ConfiguracoesAvancadas';
import QueueMonitoring from '@/components/admin/QueueMonitoring';

export default function SuperAdmin() {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const { isAdminAuthenticated, loading: adminAuthLoading } = useAdminAuth();

  if (authLoading || roleLoading || adminAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/painel" replace />;
  }

  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout title="Super Admin" description="Gerencie todas as empresas e configurações da plataforma">
      <ErrorBoundaryAdmin>
        <Tabs defaultValue="analytics" className="space-y-8">
          <div className="admin-card-elevated p-2 rounded-xl">
            <TabsList className="grid w-full grid-cols-7 admin-glass border-0 bg-transparent p-1 gap-1">
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:admin-status-success data-[state=active]:text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="empresas"
                className="data-[state=active]:admin-status-success data-[state=active]:text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              >
                Empresas
              </TabsTrigger>
              <TabsTrigger 
                value="usuarios"
                className="data-[state=active]:admin-status-success data-[state=active]:text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              >
                Usuários
              </TabsTrigger>
              <TabsTrigger 
                value="planos"
                className="data-[state=active]:admin-status-success data-[state=active]:text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              >
                Planos
              </TabsTrigger>
              <TabsTrigger 
                value="integracoes"
                className="data-[state=active]:admin-status-success data-[state=active]:text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              >
                Integrações
              </TabsTrigger>
              <TabsTrigger 
                value="configuracoes"
                className="data-[state=active]:admin-status-success data-[state=active]:text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              >
                Configurações
              </TabsTrigger>
              <TabsTrigger 
                value="filas"
                className="data-[state=active]:admin-status-success data-[state=active]:text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              >
                Monitoramento
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analytics" className="mt-8">
            <Card className="admin-card-elevated border-0 rounded-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-admin-accent-light">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-admin-text-primary">Dashboard Analytics</CardTitle>
                    <CardDescription className="text-admin-text-secondary mt-1">
                      Métricas gerais, relatórios e visão consolidada da plataforma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <AnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="empresas" className="mt-8">
            <Card className="admin-card-elevated border-0 rounded-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-admin-accent-light">
                    <span className="text-white text-lg">🏢</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-admin-text-primary">Gestão de Empresas</CardTitle>
                    <CardDescription className="text-admin-text-secondary mt-1">
                      Gerencie todas as empresas cadastradas na plataforma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <EmpresasTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="mt-8">
            <Card className="admin-card-elevated border-0 rounded-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-admin-accent-light">
                    <span className="text-white text-lg">👥</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-admin-text-primary">Gestão de Usuários</CardTitle>
                    <CardDescription className="text-admin-text-secondary mt-1">
                      Visualize e gerencie usuários de todas as empresas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <UsuariosTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planos" className="mt-8">
            <Card className="admin-card-elevated border-0 rounded-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-admin-accent-light">
                    <span className="text-white text-lg">💎</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-admin-text-primary">Gestão de Planos</CardTitle>
                    <CardDescription className="text-admin-text-secondary mt-1">
                      Configure planos, permissões e funcionalidades da plataforma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <PlanosGerenciamento />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integracoes" className="mt-8">
            <Card className="admin-card-elevated border-0 rounded-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-admin-accent-light">
                    <span className="text-white text-lg">🔗</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-admin-text-primary">Central de Integrações</CardTitle>
                    <CardDescription className="text-admin-text-secondary mt-1">
                      WhatsApp, Evolution API, n8n, webhooks e todas as configurações de integração
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <IntegracoesCentralizadas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="mt-8">
            <Card className="admin-card-elevated border-0 rounded-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-admin-accent-light">
                    <span className="text-white text-lg">⚙️</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-admin-text-primary">Configurações do Sistema</CardTitle>
                    <CardDescription className="text-admin-text-secondary mt-1">
                      API Keys, configurações avançadas e permissões do sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ConfiguracoesAvancadas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filas" className="mt-8">
            <Card className="admin-card-elevated border-0 rounded-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-admin-accent-light">
                    <span className="text-white text-lg">📈</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-admin-text-primary">Monitoramento do Sistema</CardTitle>
                    <CardDescription className="text-admin-text-secondary mt-1">
                      Filas de mensagens, logs e performance da plataforma
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <QueueMonitoring />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ErrorBoundaryAdmin>
    </AdminLayout>
  );
}