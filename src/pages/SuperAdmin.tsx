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
          <div className="overflow-x-auto pb-2 px-2">
            <TabsList className="grid w-max grid-cols-7 min-w-full lg:min-w-0 bg-card/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl p-2">
              <TabsTrigger value="analytics" className="admin-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl font-medium transition-all duration-300 px-4 py-3">Dashboard</TabsTrigger>
              <TabsTrigger value="empresas" className="admin-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl font-medium transition-all duration-300 px-4 py-3">Empresas</TabsTrigger>
              <TabsTrigger value="usuarios" className="admin-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl font-medium transition-all duration-300 px-4 py-3">Usuários</TabsTrigger>
              <TabsTrigger value="planos" className="admin-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl font-medium transition-all duration-300 px-4 py-3">Planos</TabsTrigger>
              <TabsTrigger value="integracoes" className="admin-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl font-medium transition-all duration-300 px-4 py-3">Integrações</TabsTrigger>
              <TabsTrigger value="configuracoes" className="admin-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl font-medium transition-all duration-300 px-4 py-3">Configurações</TabsTrigger>
              <TabsTrigger value="filas" className="admin-tab-trigger data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl font-medium transition-all duration-300 px-4 py-3">Monitoramento</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analytics" className="animate-scale-in-smooth mx-2">
            <Card className="admin-card rounded-2xl overflow-hidden shadow-lg border-0">
              <CardHeader className="bg-primary/5 border-b border-border/50 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <CardTitle className="text-xl text-primary font-bold">Dashboard Analytics</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  Métricas gerais, relatórios e visão consolidada da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <AnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="empresas" className="animate-scale-in-smooth mx-2">
            <Card className="admin-card rounded-2xl overflow-hidden shadow-lg border-0">
              <CardHeader className="bg-accent/5 border-b border-border/50 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <CardTitle className="text-xl text-accent font-bold">Gestão de Empresas</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  Gerencie todas as empresas cadastradas na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <EmpresasTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="animate-scale-in-smooth mx-2">
            <Card className="admin-card rounded-2xl overflow-hidden shadow-lg border-0">
              <CardHeader className="bg-secondary/5 border-b border-border/50 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                  <CardTitle className="text-xl text-secondary-foreground font-bold">Gestão de Usuários</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  Visualize e gerencie usuários de todas as empresas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <UsuariosTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planos" className="animate-scale-in-smooth mx-2">
            <Card className="admin-card rounded-2xl overflow-hidden shadow-lg border-0">
              <CardHeader className="bg-muted/30 border-b border-border/50 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-muted-foreground rounded-full animate-pulse"></div>
                  <CardTitle className="text-xl text-muted-foreground font-bold">Gestão de Planos</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  Configure planos, permissões e funcionalidades da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <PlanosGerenciamento />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integracoes" className="animate-scale-in-smooth mx-2">
            <Card className="admin-card rounded-2xl overflow-hidden shadow-lg border-0">
              <CardHeader className="bg-primary/5 border-b border-border/50 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <CardTitle className="text-xl text-primary font-bold">Central de Integrações</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  WhatsApp, Evolution API, n8n, webhooks e todas as configurações de integração
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <IntegracoesCentralizadas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="animate-scale-in-smooth mx-2">
            <Card className="admin-card rounded-2xl overflow-hidden shadow-lg border-0">
              <CardHeader className="bg-secondary/5 border-b border-border/50 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                  <CardTitle className="text-xl text-secondary-foreground font-bold">Configurações do Sistema</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  API Keys, configurações avançadas e permissões do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <ConfiguracoesAvancadas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filas" className="animate-scale-in-smooth mx-2">
            <Card className="admin-card rounded-2xl overflow-hidden shadow-lg border-0">
              <CardHeader className="bg-accent/5 border-b border-border/50 p-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <CardTitle className="text-xl text-accent-foreground font-bold">Monitoramento do Sistema</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  Filas de mensagens, logs e performance da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <QueueMonitoring />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ErrorBoundaryAdmin>
    </AdminLayout>
  );
}