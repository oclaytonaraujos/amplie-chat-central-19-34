import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MessageSquare, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  RefreshCw, 
  Search,
  Eye,
  Link,
  Unlink,
  Settings,
  Trash2,
  Plus,
  Info,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEvolutionAPIComplete } from '@/hooks/useEvolutionAPIComplete';
import { QRCodeModal } from './QRCodeModal';
import { CriarInstanciaDialog } from './CriarInstanciaDialog';
import { InstanceStatsCard } from './InstanceStatsCard';
import { InstanceDetailsDialog } from './InstanceDetailsDialog';
import { InstanceBulkActions } from './InstanceBulkActions';
import { InstanceStatusMonitor } from './InstanceStatusMonitor';
import { WebhookConfigurationCenter } from './WebhookConfigurationCenter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InstanciaCompleta {
  id: string;
  instance_name: string;
  status: string;
  numero?: string;
  qr_code?: string;
  ativo: boolean;
  empresa_id?: string;
  empresa_nome?: string;
  descricao?: string;
  webhook_url?: string;
  webhook_status?: 'ativo' | 'inativo' | 'erro';
  created_at: string;
  updated_at: string;
}

interface Empresa {
  id: string;
  nome: string;
}

export function InstanciasWhatsAppAdmin() {
  const [instancias, setInstancias] = useState<InstanciaCompleta[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstance, setSelectedInstance] = useState<InstanciaCompleta | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [webhookFilter, setWebhookFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'created' | 'company'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showWebhookCenter, setShowWebhookCenter] = useState(false);
  
  const { toast } = useToast();
  const {
    connectInstance,
    getConnectionState,
    deleteInstance,
    configureCompleteWebhook,
    checkWebhookStatus,
    findWebhook
  } = useEvolutionAPIComplete();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadInstancias(),
        loadEmpresas()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das instâncias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInstancias = async () => {
    try {
      const { data: instancesData, error: instancesError } = await supabase
        .from('evolution_api_config')
        .select(`
          *,
          empresas:empresa_id (
            id,
            nome
          )
        `)
        .order('created_at', { ascending: false });

      if (instancesError) throw instancesError;

      const instanciasFormatadas = await Promise.all(
        (instancesData || []).map(async (instance) => {
          // Verificar status da conexão via Evolution API
          let connectionStatus = 'unknown';
          let qrCode = null;
          let webhookStatus: 'ativo' | 'inativo' | 'erro' = 'inativo';
          
          try {
            const connectionState = await getConnectionState(instance.instance_name);
            if (connectionState && connectionState.instance) {
              connectionStatus = connectionState.instance.state || 'disconnected';
              qrCode = connectionState.instance.qrcode || null;
            }

            // Verificar status do webhook
            const webhookResult = await findWebhook(instance.instance_name);
            if (webhookResult) {
              webhookStatus = 'ativo';
            }
          } catch (error) {
            console.error(`Erro ao verificar status da instância ${instance.instance_name}:`, error);
          }

          return {
            id: instance.id,
            instance_name: instance.instance_name,
            status: connectionStatus,
            numero: instance.numero,
            qr_code: qrCode,
            ativo: instance.ativo,
            empresa_id: instance.empresa_id,
            empresa_nome: instance.empresas?.nome,
            descricao: instance.descricao,
            webhook_status: webhookStatus,
            created_at: instance.created_at,
            updated_at: instance.updated_at
          };
        })
      );

      setInstancias(instanciasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
    }
  };

  const loadEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleConnect = async (instancia: InstanciaCompleta) => {
    try {
      setRefreshing(instancia.id);
      const result = await connectInstance(instancia.instance_name);
      
      if (result) {
        setSelectedInstance(instancia);
        setShowQRModal(true);
        
        // Aguardar um pouco e recarregar para pegar o QR code
        setTimeout(() => {
          loadInstancias();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar instância",
        variant: "destructive",
      });
    } finally {
      setRefreshing(null);
    }
  };

  const handleConfigureWebhook = async (instancia: InstanciaCompleta) => {
    try {
      setRefreshing(instancia.id);
      const result = await configureCompleteWebhook(instancia.instance_name);
      
      if (result) {
        toast({
          title: "Sucesso",
          description: "Webhook configurado com sucesso",
        });
        await loadInstancias();
      }
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao configurar webhook",
        variant: "destructive",
      });
    } finally {
      setRefreshing(null);
    }
  };

  const handleDelete = async (instancia: InstanciaCompleta) => {
    if (!confirm(`Tem certeza que deseja excluir a instância "${instancia.instance_name}"?`)) {
      return;
    }

    try {
      setRefreshing(instancia.id);
      const result = await deleteInstance(instancia.instance_name);
      
      if (result) {
        toast({
          title: "Sucesso",
          description: "Instância excluída com sucesso",
        });
        await loadInstancias();
      }
    } catch (error) {
      console.error('Erro ao excluir instância:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir instância",
        variant: "destructive",
      });
    } finally {
      setRefreshing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800">Conectando</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Desconectado</Badge>;
    }
  };

  const getWebhookBadge = (status: 'ativo' | 'inativo' | 'erro') => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800">Webhook Ativo</Badge>;
      case 'erro':
        return <Badge className="bg-red-100 text-red-800">Webhook Erro</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Webhook Inativo</Badge>;
    }
  };

  // Filtros e ordenação
  const filteredAndSortedInstancias = instancias
    .filter(instancia => {
      // Filtro de texto
      const textMatch = instancia.instance_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instancia.empresa_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instancia.numero?.includes(searchTerm);
      
      // Filtro de status
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'connected' && (instancia.status === 'open' || instancia.status === 'connected')) ||
        (statusFilter === 'disconnected' && instancia.status === 'disconnected') ||
        (statusFilter === 'connecting' && instancia.status === 'connecting');
      
      // Filtro de webhook
      const webhookMatch = webhookFilter === 'all' ||
        (webhookFilter === 'active' && instancia.webhook_status === 'ativo') ||
        (webhookFilter === 'inactive' && instancia.webhook_status !== 'ativo');
      
      return textMatch && statusMatch && webhookMatch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.instance_name.localeCompare(b.instance_name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'company':
          comparison = (a.empresa_nome || '').localeCompare(b.empresa_nome || '');
          break;
        case 'created':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Estatísticas
  const stats = {
    total: instancias.length,
    connected: instancias.filter(i => i.status === 'open' || i.status === 'connected').length,
    disconnected: instancias.filter(i => i.status === 'disconnected').length,
    webhook_active: instancias.filter(i => i.webhook_status === 'ativo').length,
    webhook_inactive: instancias.filter(i => i.webhook_status !== 'ativo').length,
  };

  const handleInstanceSelection = (instanceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInstances(prev => [...prev, instanceId]);
    } else {
      setSelectedInstances(prev => prev.filter(id => id !== instanceId));
    }
  };

  const handleShowDetails = (instancia: InstanciaCompleta) => {
    setSelectedInstance(instancia);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Instâncias WhatsApp</h2>
          <p className="text-muted-foreground">
            Gerencie todas as instâncias WhatsApp do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowWebhookCenter(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Config Webhooks
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Instância
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <InstanceStatsCard stats={stats} loading={loading} />

      {/* Monitor de Status em Tempo Real */}
      <InstanceStatusMonitor 
        instances={instancias}
        onStatusUpdate={(instanceName, status) => {
          setInstancias(prev => prev.map(inst => 
            inst.instance_name === instanceName 
              ? { ...inst, status }
              : inst
          ));
        }}
      />

      {/* Ações em Lote */}
      <InstanceBulkActions
        instances={instancias}
        selectedInstances={selectedInstances}
        onSelectionChange={setSelectedInstances}
        onRefresh={loadData}
      />

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome da instância, empresa ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="connected">Conectado</SelectItem>
                  <SelectItem value="disconnected">Desconectado</SelectItem>
                  <SelectItem value="connecting">Conectando</SelectItem>
                </SelectContent>
              </Select>

              <Select value={webhookFilter} onValueChange={setWebhookFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Webhook" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Webhooks</SelectItem>
                  <SelectItem value="active">Webhook Ativo</SelectItem>
                  <SelectItem value="inactive">Webhook Inativo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Data de Criação</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Instâncias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Instâncias Cadastradas ({filteredAndSortedInstancias.length})
            {searchTerm || statusFilter !== 'all' || webhookFilter !== 'all' ? (
              <span className="text-sm font-normal text-muted-foreground">
                de {instancias.length} total
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedInstancias.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma instância encontrada</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== 'all' || webhookFilter !== 'all' 
                  ? 'Tente ajustar os filtros de pesquisa' 
                  : 'Crie a primeira instância para começar'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedInstancias.map((instancia) => (
                <div key={instancia.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedInstances.includes(instancia.id)}
                        onCheckedChange={(checked) => handleInstanceSelection(instancia.id, !!checked)}
                      />
                      {getStatusIcon(instancia.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{instancia.instance_name}</span>
                          {instancia.empresa_nome && (
                            <Badge variant="outline" className="text-xs">
                              {instancia.empresa_nome}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {instancia.numero && (
                            <span>📱 {instancia.numero}</span>
                          )}
                          {instancia.descricao && (
                            <span>• {instancia.descricao}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(instancia.status)}
                          {getWebhookBadge(instancia.webhook_status || 'inativo')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleShowDetails(instancia)}
                      >
                        <Info className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>

                      {instancia.status === 'disconnected' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleConnect(instancia)}
                          disabled={refreshing === instancia.id}
                        >
                          {refreshing === instancia.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Link className="w-4 h-4 mr-1" />
                              Conectar
                            </>
                          )}
                        </Button>
                      )}

                      {instancia.webhook_status === 'inativo' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleConfigureWebhook(instancia)}
                          disabled={refreshing === instancia.id}
                        >
                          {refreshing === instancia.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Settings className="w-4 h-4 mr-1" />
                              Config Webhook
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(instancia)}
                        disabled={refreshing === instancia.id}
                      >
                        {refreshing === instancia.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal QR Code */}
      <QRCodeModal
        open={showQRModal}
        onOpenChange={(open) => {
          setShowQRModal(open);
          if (!open) {
            setSelectedInstance(null);
          }
        }}
        qrCode={selectedInstance?.qr_code}
        instanceName={selectedInstance?.instance_name || ''}
        onRefresh={() => loadInstancias()}
        isLoading={refreshing !== null}
      />

      {/* Dialog Criar Instância */}
      <CriarInstanciaDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          loadInstancias();
        }}
      />

      {/* Dialog Detalhes da Instância */}
      <InstanceDetailsDialog
        open={showDetailsDialog}
        onOpenChange={(open) => {
          setShowDetailsDialog(open);
          if (!open) {
            setSelectedInstance(null);
          }
        }}
        instance={selectedInstance}
        onRefresh={loadData}
      />

      {/* Centro de Configuração de Webhooks */}
      {showWebhookCenter && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-4xl max-h-[90vh] overflow-auto">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Configuração de Webhooks</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedInstance ? `Instância: ${selectedInstance.instance_name}` : 'Configuração global'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowWebhookCenter(false)}
                >
                  Fechar
                </Button>
              </CardHeader>
              <CardContent>
                <WebhookConfigurationCenter 
                  instanceName={selectedInstance?.instance_name}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}