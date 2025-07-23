import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Webhook, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  Trash2,
  Play,
  Copy,
  RefreshCw,
  Settings,
  Link2
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEvolutionAPIComplete } from '@/hooks/useEvolutionAPIComplete';

interface WebhookConfig {
  id: string;
  instance_id: string;
  instance_name?: string;
  empresa_nome?: string;
  webhook_url: string;
  webhook_events: string[];
  status: 'ativo' | 'inativo' | 'erro';
  auto_generated: boolean;
  last_test_at?: string;
  last_test_status?: 'success' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

interface EvolutionInstance {
  id: string;
  instance_name: string;
  status: string;
  empresa_id?: string;
  empresa_nome?: string;
  ativo: boolean;
}

const WEBHOOK_EVENTS = [
  { id: 'MESSAGES_UPSERT', label: 'Mensagens (Envio/Recebimento)', description: 'Todas as mensagens enviadas e recebidas' },
  { id: 'CONNECTION_UPDATE', label: 'Status da Conexão', description: 'Mudanças no status de conexão do WhatsApp' },
  { id: 'QRCODE_UPDATED', label: 'QR Code Atualizado', description: 'Quando um novo QR Code é gerado' },
  { id: 'CALL_UPDATE', label: 'Chamadas', description: 'Eventos de chamadas de voz e vídeo' },
  { id: 'GROUP_UPDATE', label: 'Grupos', description: 'Atualizações em grupos (criação, saída, etc.)' },
  { id: 'PRESENCE_UPDATE', label: 'Presença Online', description: 'Status de online/offline dos contatos' },
  { id: 'CHATS_UPSERT', label: 'Conversas', description: 'Criação e atualização de conversas' },
  { id: 'CONTACTS_UPSERT', label: 'Contatos', description: 'Adição e atualização de contatos' }
];

export default function WebhooksAdmin() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [instances, setInstances] = useState<EvolutionInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const { toast } = useToast();
  const { configureCompleteWebhook, checkWebhookStatus } = useEvolutionAPIComplete();

  // Estados do formulário
  const [formData, setFormData] = useState<{
    instance_id: string;
    webhook_url: string;
    webhook_events: string[];
    status: 'ativo' | 'inativo' | 'erro';
    auto_generated: boolean;
  }>({
    instance_id: '',
    webhook_url: '',
    webhook_events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
    status: 'ativo',
    auto_generated: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar instâncias ativas
      const { data: instancesData, error: instancesError } = await supabase
        .from('evolution_api_config')
        .select(`
          id,
          instance_name,
          status,
          empresa_id,
          ativo,
          empresas:empresa_id (nome)
        `)
        .eq('ativo', true)
        .order('instance_name');

      if (instancesError) throw instancesError;

      const formattedInstances: EvolutionInstance[] = (instancesData || []).map(instance => ({
        id: instance.id,
        instance_name: instance.instance_name,
        status: instance.status || 'disconnected',
        empresa_id: instance.empresa_id,
        empresa_nome: (instance.empresas as any)?.nome,
        ativo: instance.ativo
      }));

      setInstances(formattedInstances);

      // Simular dados de webhook (em implementação real, viria do banco)
      // Por enquanto, criar um webhook automático para cada instância
      const simulatedWebhooks: WebhookConfig[] = formattedInstances.map(instance => ({
        id: `webhook-${instance.id}`,
        instance_id: instance.id,
        instance_name: instance.instance_name,
        empresa_nome: instance.empresa_nome,
        webhook_url: generateWebhookUrl(instance.instance_name),
        webhook_events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
        status: 'ativo' as const,
        auto_generated: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      setWebhooks(simulatedWebhooks);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos webhooks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWebhookUrl = (instanceName: string) => {
    return `https://obtpghqvrygzcukdaiej.supabase.co/functions/v1/whatsapp-webhook-evolution`;
  };

  const handleCreateWebhook = async () => {
    try {
      if (!formData.instance_id) {
        toast({
          title: "Erro",
          description: "Selecione uma instância",
          variant: "destructive",
        });
        return;
      }

      const selectedInstance = instances.find(i => i.id === formData.instance_id);
      if (!selectedInstance) return;

      // Verificar se já existe webhook para esta instância
      const existingWebhook = webhooks.find(w => w.instance_id === formData.instance_id);
      if (existingWebhook && !editingWebhook) {
        toast({
          title: "Webhook já existe",
          description: "Esta instância já possui um webhook configurado",
          variant: "destructive",
        });
        return;
      }

      const newWebhook: WebhookConfig = {
        id: editingWebhook?.id || `webhook-${Date.now()}`,
        instance_id: formData.instance_id,
        instance_name: selectedInstance.instance_name,
        empresa_nome: selectedInstance.empresa_nome,
        webhook_url: formData.webhook_url || generateWebhookUrl(selectedInstance.instance_name),
        webhook_events: formData.webhook_events,
        status: formData.status,
        auto_generated: formData.auto_generated,
        created_at: editingWebhook?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingWebhook) {
        setWebhooks(prev => prev.map(w => w.id === editingWebhook.id ? newWebhook : w));
      } else {
        setWebhooks(prev => [...prev, newWebhook]);
      }

      // Configurar webhook na Evolution API se estiver ativo
      if (newWebhook.status === 'ativo') {
        try {
          await configureCompleteWebhook(selectedInstance.instance_name);
          toast({
            title: "Webhook configurado",
            description: "Webhook criado e configurado na Evolution API",
          });
        } catch (error) {
          toast({
            title: "Webhook criado",
            description: "Webhook criado localmente, mas houve erro na configuração da API",
            variant: "destructive",
          });
        }
      }

      setIsDialogOpen(false);
      resetForm();

    } catch (error: any) {
      console.error('Erro ao criar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar webhook",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      setWebhooks(prev => prev.filter(w => w.id !== webhookId));
      
      toast({
        title: "Sucesso",
        description: "Webhook removido com sucesso",
      });

    } catch (error: any) {
      console.error('Erro ao deletar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar webhook",
        variant: "destructive",
      });
    }
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    if (!webhook.instance_name) return;

    try {
      setTestingWebhook(webhook.id);
      
      // Verificar status do webhook na Evolution API
      const result = await checkWebhookStatus(webhook.instance_name);
      
      // Atualizar status do teste
      setWebhooks(prev => prev.map(w => 
        w.id === webhook.id 
          ? { 
              ...w, 
              last_test_at: new Date().toISOString(),
              last_test_status: result.configured ? 'success' as const : 'failed' as const,
              status: result.configured ? 'ativo' as const : 'erro' as const
            }
          : w
      ));

      toast({
        title: result.configured ? "Webhook ativo" : "Webhook inativo",
        description: result.configured ? "Webhook respondeu corretamente" : "Webhook não está respondendo",
        variant: result.configured ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('Erro ao testar webhook:', error);
      
      setWebhooks(prev => prev.map(w => 
        w.id === webhook.id 
          ? { 
              ...w, 
              last_test_at: new Date().toISOString(),
              last_test_status: 'failed' as const,
              error_message: error.message,
              status: 'erro' as const
            }
          : w
      ));

      toast({
        title: "Erro",
        description: "Erro ao testar webhook",
        variant: "destructive",
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const resetForm = () => {
    setFormData({
      instance_id: '',
      webhook_url: '',
      webhook_events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
      status: 'ativo',
      auto_generated: false
    });
    setEditingWebhook(null);
  };

  const openEditDialog = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setFormData({
      instance_id: webhook.instance_id,
      webhook_url: webhook.webhook_url,
      webhook_events: webhook.webhook_events,
      status: webhook.status,
      auto_generated: webhook.auto_generated
    });
    setIsDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "URL copiada para a área de transferência",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'inativo':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Inativo</Badge>;
      case 'erro':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAvailableInstances = () => {
    const usedInstanceIds = webhooks.map(w => w.instance_id);
    return instances.filter(instance => 
      !usedInstanceIds.includes(instance.id) || 
      (editingWebhook && instance.id === editingWebhook.instance_id)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando webhooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuração de Webhooks</h1>
          <p className="text-muted-foreground">
            Gerencie webhooks para suas instâncias Evolution API. Cada instância pode ter apenas um webhook.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingWebhook ? 'Editar Webhook' : 'Criar Novo Webhook'}
              </DialogTitle>
              <DialogDescription>
                Configure o webhook para receber eventos da instância selecionada
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instance">Instância</Label>
                <Select 
                  value={formData.instance_id} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, instance_id: value }));
                    const instance = instances.find(i => i.id === value);
                    if (instance && !formData.webhook_url) {
                      setFormData(prev => ({ 
                        ...prev, 
                        webhook_url: generateWebhookUrl(instance.instance_name) 
                      }));
                    }
                  }}
                  disabled={!!editingWebhook}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma instância" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableInstances().map((instance) => (
                      <SelectItem key={instance.id} value={instance.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{instance.instance_name}</span>
                          {instance.empresa_nome && (
                            <Badge variant="outline" className="ml-2">
                              {instance.empresa_nome}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_url">URL do Webhook</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook_url"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                    placeholder="https://obtpghqvrygzcukdaiej.supabase.co/functions/v1/whatsapp-webhook-evolution"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.webhook_url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  URL padrão do sistema - gerada automaticamente
                </p>
              </div>

              <div className="space-y-2">
                <Label>Eventos do Webhook</Label>
                <div className="grid grid-cols-1 gap-3">
                  {WEBHOOK_EVENTS.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={event.id}
                        checked={formData.webhook_events.includes(event.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              webhook_events: [...prev.webhook_events, event.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              webhook_events: prev.webhook_events.filter(e => e !== event.id)
                            }));
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={event.id} className="text-sm font-medium">
                          {event.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status === 'ativo'}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, status: checked ? 'ativo' as const : 'inativo' as const }))
                  }
                />
                <Label htmlFor="status">Webhook Ativo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateWebhook}>
                {editingWebhook ? 'Atualizar' : 'Criar'} Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {webhooks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Nenhum webhook configurado
              </h3>
              <p className="text-muted-foreground mb-4">
                Crie webhooks para receber eventos das suas instâncias WhatsApp
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Webhook className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{webhook.instance_name}</CardTitle>
                      <CardDescription>
                        {webhook.empresa_nome && (
                          <Badge variant="outline" className="mr-2">
                            {webhook.empresa_nome}
                          </Badge>
                        )}
                        {webhook.auto_generated && (
                          <Badge variant="secondary" className="mr-2">
                            Auto-gerado
                          </Badge>
                        )}
                        {webhook.webhook_events.length} eventos configurados
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(webhook.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(webhook)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Webhook</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover este webhook? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteWebhook(webhook.id)}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">URL do Webhook</Label>
                  <div className="flex gap-2">
                    <Input
                      value={webhook.webhook_url}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(webhook.webhook_url)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Eventos Configurados</Label>
                  <div className="flex flex-wrap gap-1">
                    {webhook.webhook_events.map(eventId => {
                      const event = WEBHOOK_EVENTS.find(e => e.id === eventId);
                      return (
                        <Badge key={eventId} variant="outline" className="text-xs">
                          {event?.label || eventId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {webhook.last_test_at && (
                  <div className="text-sm text-muted-foreground">
                    Último teste: {new Date(webhook.last_test_at).toLocaleString()} - 
                    <Badge variant={webhook.last_test_status === 'success' ? 'default' : 'destructive'} className="ml-2">
                      {webhook.last_test_status === 'success' ? 'Sucesso' : 'Falha'}
                    </Badge>
                    {webhook.error_message && (
                      <p className="text-red-500 text-xs mt-1">{webhook.error_message}</p>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleTestWebhook(webhook)}
                    disabled={testingWebhook === webhook.id || webhook.status === 'inativo'}
                    variant="outline"
                    className="flex-1"
                  >
                    {testingWebhook === webhook.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Testar Webhook
                      </>
                    )}
                  </Button>
                  
                  {webhook.auto_generated && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (webhook.instance_name) {
                          configureCompleteWebhook(webhook.instance_name)
                            .then(() => {
                              toast({
                                title: "Webhook reconfigurado",
                                description: "Webhook foi reconfigurado na Evolution API",
                              });
                            })
                            .catch((error) => {
                              toast({
                                title: "Erro",
                                description: "Erro ao reconfigurar webhook",
                                variant: "destructive",
                              });
                            });
                        }
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Reconfigurar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}