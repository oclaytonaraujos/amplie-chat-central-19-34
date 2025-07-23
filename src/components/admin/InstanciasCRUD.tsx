import React, { useState, useEffect } from 'react';
import { Plus, QrCode, Edit, Trash2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeModal } from '@/components/admin/QRCodeModal';
import { useEvolutionIntegration } from '@/hooks/useEvolutionIntegration';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface NovaInstanciaForm {
  instance_name: string;
  webhook_url: string;
  descricao: string;
}

export function InstanciasCRUD() {
  const { user } = useAuth();
  const { toast } = useToast();
  const evolution = useEvolutionIntegration();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [editingInstance, setEditingInstance] = useState<any>(null);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [connectionCheckInterval, setConnectionCheckInterval] = useState<NodeJS.Timeout | null>(null);
  
  const [novaInstancia, setNovaInstancia] = useState<NovaInstanciaForm>({
    instance_name: '',
    webhook_url: '',
    descricao: ''
  });

  // Carrega as instâncias ao montar o componente
  useEffect(() => {
    evolution.loadInstances();
  }, []);

  // Limpa o intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
    };
  }, [connectionCheckInterval]);

  const handleCreateInstance = async () => {
    if (!novaInstancia.instance_name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da instância é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const webhookUrl = novaInstancia.webhook_url || 
      `${window.location.origin}/api/webhooks/evolution/${novaInstancia.instance_name}`;

    const success = await evolution.createInstance({
      instanceName: novaInstancia.instance_name,
      webhook: webhookUrl,
      events: ["APPLICATION_STARTUP", "MESSAGES_UPSERT", "MESSAGE_STATUS_UPDATE", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
      empresa_id: user?.user_metadata?.empresa_id,
      descricao: novaInstancia.descricao
    });

    if (success) {
      setShowCreateDialog(false);
      setNovaInstancia({ instance_name: '', webhook_url: '', descricao: '' });
      await evolution.loadInstances();
      
      toast({
        title: "Sucesso",
        description: "Instância criada com sucesso",
      });
    }
  };

  const handleEditInstance = async () => {
    if (!editingInstance) return;

    const success = await evolution.updateInstance(editingInstance.id, {
      webhook_url: editingInstance.webhook_url,
      descricao: editingInstance.descricao
    });

    if (success) {
      setShowEditDialog(false);
      setEditingInstance(null);
      await evolution.loadInstances();
      
      toast({
        title: "Sucesso",
        description: "Instância atualizada com sucesso",
      });
    }
  };

  const handleDeleteInstance = async (instanceName: string) => {
    const success = await evolution.deleteInstance(instanceName);
    
    if (success) {
      await evolution.loadInstances();
      
      toast({
        title: "Sucesso",
        description: "Instância excluída com sucesso",
      });
    }
  };

  const handleConnectInstance = async (instance: any) => {
    setSelectedInstance(instance);
    setShowQRModal(true);
    setQrCodeLoading(true);

    // Gerar QR code
    const result = await evolution.connectInstance(instance.instance_name);
    setQrCodeLoading(false);
    
    if (result) {
      // Recarregar dados para pegar o QR code atualizado
      await evolution.loadInstances();
      
      // Atualizar a instância selecionada com os novos dados
      const updatedInstance = evolution.instances.find(inst => inst.instance_name === instance.instance_name);
      if (updatedInstance) {
        setSelectedInstance(updatedInstance);
      }

      // Iniciar verificação de conexão automática
      startConnectionCheck(instance.instance_name);
    } else {
      setShowQRModal(false);
      setSelectedInstance(null);
    }
  };

  const startConnectionCheck = (instanceName: string) => {
    // Limpar intervalo anterior se existir
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
    }

    const interval = setInterval(async () => {
      const connectionState = await evolution.getConnectionState(instanceName);
      
      if (connectionState?.state === 'open') {
        // Conexão estabelecida, fechar modal
        setShowQRModal(false);
        setSelectedInstance(null);
        clearInterval(interval);
        setConnectionCheckInterval(null);
        
        // Recarregar instâncias para atualizar status
        await evolution.loadInstances();
        
        toast({
          title: "Conectado!",
          description: "WhatsApp conectado com sucesso",
        });
      } else if (connectionState?.state === 'close') {
        // QR Code expirou, gerar novo
        const result = await evolution.connectInstance(instanceName);
        if (result) {
          await evolution.loadInstances();
          const updatedInstance = evolution.instances.find(inst => inst.instance_name === instanceName);
          if (updatedInstance) {
            setSelectedInstance(updatedInstance);
          }
        }
      }
    }, 5000); // Verificar a cada 5 segundos

    setConnectionCheckInterval(interval);
  };

  const refreshQRCode = async () => {
    if (!selectedInstance) return;
    
    setQrCodeLoading(true);
    const result = await evolution.connectInstance(selectedInstance.instance_name);
    if (result) {
      await evolution.loadInstances();
      const updatedInstance = evolution.instances.find(inst => inst.instance_name === selectedInstance.instance_name);
      if (updatedInstance) {
        setSelectedInstance(updatedInstance);
      }
    }
    setQrCodeLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'close': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Conectado';
      case 'connecting': return 'Conectando';
      case 'close': return 'Desconectado';
      default: return 'Indefinido';
    }
  };

  if (evolution.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Instâncias WhatsApp</h2>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Instância
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Instância</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="instance_name">Nome da Instância</Label>
                <Input
                  id="instance_name"
                  value={novaInstancia.instance_name}
                  onChange={(e) => setNovaInstancia(prev => ({ ...prev, instance_name: e.target.value }))}
                  placeholder="Ex: empresa-principal"
                />
              </div>
              <div>
                <Label htmlFor="webhook_url">URL do Webhook (Opcional)</Label>
                <Input
                  id="webhook_url"
                  value={novaInstancia.webhook_url}
                  onChange={(e) => setNovaInstancia(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder="Deixe vazio para usar URL automática"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={novaInstancia.descricao}
                  onChange={(e) => setNovaInstancia(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição da instância"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateInstance}>
                  Criar Instância
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evolution.instances.map((instance) => (
          <Card key={instance.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{instance.instance_name}</CardTitle>
                <Badge className={getStatusColor(instance.status)}>
                  {getStatusText(instance.status)}
                </Badge>
              </div>
              {instance.descricao && (
                <p className="text-sm text-muted-foreground">{instance.descricao}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {instance.numero && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium mr-2">Número:</span>
                    <span>{instance.numero}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <span className="font-medium mr-2">Empresa:</span>
                  <span>{instance.empresa_nome || 'Não especificada'}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleConnectInstance(instance)}
                    disabled={instance.status === 'open'}
                    className="flex-1"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Conectar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingInstance(instance);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Instância</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a instância "{instance.instance_name}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteInstance(instance.instance_name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {evolution.instances.length === 0 && (
        <div className="text-center py-12">
          <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">Nenhuma instância encontrada</h3>
          <p className="text-sm text-muted-foreground">Crie sua primeira instância WhatsApp para começar</p>
        </div>
      )}

      {/* Modal de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Instância</DialogTitle>
          </DialogHeader>
          {editingInstance && (
            <div className="space-y-4">
              <div>
                <Label>Nome da Instância</Label>
                <Input value={editingInstance.instance_name} disabled />
              </div>
              <div>
                <Label htmlFor="edit_webhook_url">URL do Webhook</Label>
                <Input
                  id="edit_webhook_url"
                  value={editingInstance.webhook_url}
                  onChange={(e) => setEditingInstance(prev => ({ ...prev, webhook_url: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_descricao">Descrição</Label>
                <Input
                  id="edit_descricao"
                  value={editingInstance.descricao}
                  onChange={(e) => setEditingInstance(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditInstance}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de QR Code */}
      <QRCodeModal
        open={showQRModal}
        onOpenChange={(open) => {
          setShowQRModal(open);
          if (!open) {
            setSelectedInstance(null);
            if (connectionCheckInterval) {
              clearInterval(connectionCheckInterval);
              setConnectionCheckInterval(null);
            }
          }
        }}
        qrCode={selectedInstance?.qr_code}
        instanceName={selectedInstance?.instance_name || ''}
        onRefresh={refreshQRCode}
        isLoading={qrCodeLoading}
      />
    </div>
  );
}