import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionAPIComplete } from '@/hooks/useEvolutionAPIComplete';
import { 
  Webhook, 
  TestTube, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Settings,
  Globe,
  MessageSquare,
  Info
} from 'lucide-react';

interface WebhookConfig {
  url: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'error';
  last_test?: string;
  test_result?: boolean;
}

interface WebhookConfigurationCenterProps {
  instanceName?: string;
}

/**
 * Centro unificado de configuração de webhooks
 * Centraliza todas as configurações de webhook em um local para evitar duplicação
 */
export function WebhookConfigurationCenter({ instanceName }: WebhookConfigurationCenterProps) {
  const [webhookConfigs, setWebhookConfigs] = useState<{
    evolution: WebhookConfig;
    system: WebhookConfig;
    n8n_receive: WebhookConfig;
    n8n_send: WebhookConfig;
  }>({
    evolution: {
      url: 'https://obtpghqvrygzcukdaiej.supabase.co/functions/v1/whatsapp-webhook-evolution',
      enabled: true,
      status: 'active',
    },
    system: {
      url: '',
      enabled: false,
      status: 'inactive',
    },
    n8n_receive: {
      url: localStorage.getItem('n8n-receive-webhook-url') || '',
      enabled: !!localStorage.getItem('n8n-receive-webhook-url'),
      status: 'inactive',
    },
    n8n_send: {
      url: localStorage.getItem('n8n-send-webhook-url') || '',
      enabled: !!localStorage.getItem('n8n-send-webhook-url'),
      status: 'inactive',
    },
  });

  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();
  const { configureCompleteWebhook, checkWebhookStatus, findWebhook } = useEvolutionAPIComplete();

  const updateWebhookConfig = (type: keyof typeof webhookConfigs, updates: Partial<WebhookConfig>) => {
    setWebhookConfigs(prev => ({
      ...prev,
      [type]: { ...prev[type], ...updates }
    }));

    // Persistir configurações locais
    if (type === 'n8n_receive') {
      localStorage.setItem('n8n-receive-webhook-url', updates.url || '');
    } else if (type === 'n8n_send') {
      localStorage.setItem('n8n-send-webhook-url', updates.url || '');
    }
  };

  const testWebhook = async (type: keyof typeof webhookConfigs) => {
    const config = webhookConfigs[type];
    if (!config.url) {
      toast({
        title: "URL necessária",
        description: "Configure uma URL antes de testar",
        variant: "destructive",
      });
      return;
    }

    setTesting(type);
    
    try {
      const startTime = Date.now();
      
      // Para webhook da Evolution API, usar método específico
      if (type === 'evolution' && instanceName) {
        const result = await checkWebhookStatus(instanceName);
        const responseTime = Date.now() - startTime;
        
        updateWebhookConfig(type, {
          status: result.configured ? 'active' : 'error',
          last_test: new Date().toISOString(),
          test_result: result.configured
        });

        toast({
          title: result.configured ? "Webhook ativo" : "Webhook inativo",
          description: `Status verificado em ${responseTime}ms`,
          variant: result.configured ? "default" : "destructive",
        });
        return;
      }

      // Para outros webhooks, fazer teste HTTP
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          type: type,
        }),
      });

      const responseTime = Date.now() - startTime;
      const success = response.ok || response.type === 'opaque'; // no-cors retorna opaque

      updateWebhookConfig(type, {
        status: success ? 'active' : 'error',
        last_test: new Date().toISOString(),
        test_result: success
      });

      toast({
        title: success ? "Teste enviado" : "Erro no teste",
        description: `Webhook testado em ${responseTime}ms`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      updateWebhookConfig(type, {
        status: 'error',
        last_test: new Date().toISOString(),
        test_result: false
      });

      toast({
        title: "Erro no teste",
        description: "Não foi possível testar o webhook",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const configureEvolutionWebhook = async () => {
    if (!instanceName) {
      toast({
        title: "Instância necessária",
        description: "Selecione uma instância para configurar",
        variant: "destructive",
      });
      return;
    }

    setTesting('evolution');
    
    try {
      const result = await configureCompleteWebhook(instanceName);
      
      if (result) {
        updateWebhookConfig('evolution', {
          status: 'active',
          last_test: new Date().toISOString(),
          test_result: true
        });

        toast({
          title: "Webhook configurado",
          description: "Webhook da Evolution API configurado com sucesso",
        });
      }
    } catch (error) {
      updateWebhookConfig('evolution', {
        status: 'error',
        last_test: new Date().toISOString(),
        test_result: false
      });

      toast({
        title: "Erro na configuração",
        description: "Não foi possível configurar o webhook",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${name} copiado para a área de transferência`,
    });
  };

  const getStatusBadge = (status: 'active' | 'inactive' | 'error') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Inativo</Badge>;
    }
  };

  const WebhookConfigCard = ({ 
    title, 
    description, 
    type, 
    config, 
    onTest, 
    onConfigure,
    readOnly = false 
  }: {
    title: string;
    description: string;
    type: keyof typeof webhookConfigs;
    config: WebhookConfig;
    onTest?: () => void;
    onConfigure?: () => void;
    readOnly?: boolean;
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {getStatusBadge(config.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`webhook-${type}`}>URL do Webhook</Label>
          <div className="flex gap-2">
            <Input
              id={`webhook-${type}`}
              value={config.url}
              onChange={(e) => updateWebhookConfig(type, { url: e.target.value })}
              placeholder="https://exemplo.com/webhook"
              readOnly={readOnly}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(config.url, title)}
              disabled={!config.url}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => updateWebhookConfig(type, { enabled: checked })}
              disabled={readOnly}
            />
            <Label>Habilitado</Label>
          </div>

          <div className="flex gap-2">
            {onConfigure && (
              <Button
                variant="outline"
                size="sm"
                onClick={onConfigure}
                disabled={testing === type}
              >
                {testing === type ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onTest || (() => testWebhook(type))}
              disabled={!config.url || testing === type}
            >
              {testing === type ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {config.last_test && (
          <div className="text-xs text-muted-foreground">
            Último teste: {new Date(config.last_test).toLocaleString()}
            {config.test_result !== undefined && (
              <span className={`ml-2 ${config.test_result ? 'text-green-600' : 'text-red-600'}`}>
                {config.test_result ? '✓ Sucesso' : '✗ Falha'}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Centro de Configuração de Webhooks</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as configurações de webhook em um local centralizado
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure os webhooks na ordem: Evolution API → Sistema → n8n. 
          O webhook da Evolution API é obrigatório para o funcionamento básico.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="evolution" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evolution">Evolution API</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="n8n">n8n Receive</TabsTrigger>
          <TabsTrigger value="send">n8n Send</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="space-y-4">
          <WebhookConfigCard
            title="Webhook Evolution API"
            description="Webhook principal para receber eventos do WhatsApp via Evolution API"
            type="evolution"
            config={webhookConfigs.evolution}
            onConfigure={configureEvolutionWebhook}
            readOnly={true}
          />
          {!instanceName && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Selecione uma instância específica para configurar o webhook da Evolution API.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <WebhookConfigCard
            title="Webhook do Sistema"
            description="Webhook para eventos internos do sistema (atendimentos, contatos, etc.)"
            type="system"
            config={webhookConfigs.system}
          />
        </TabsContent>

        <TabsContent value="n8n" className="space-y-4">
          <WebhookConfigCard
            title="n8n Webhook de Recebimento"
            description="URL gerada pelo n8n para receber mensagens do WhatsApp"
            type="n8n_receive"
            config={webhookConfigs.n8n_receive}
          />
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Esta URL deve ser configurada no webhook da Evolution API para enviar dados para o n8n.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <WebhookConfigCard
            title="n8n Webhook de Envio"
            description="URL gerada pelo n8n para enviar mensagens através do WhatsApp"
            type="n8n_send"
            config={webhookConfigs.n8n_send}
          />
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Esta URL deve ser usada no código do sistema para enviar mensagens via n8n.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Resumo de Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Resumo de Status dos Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(webhookConfigs).map(([key, config]) => (
              <div key={key} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getStatusBadge(config.status)}
                </div>
                <div className="text-sm font-medium">{key.replace('_', ' ').toUpperCase()}</div>
                <div className="text-xs text-muted-foreground">
                  {config.enabled ? 'Habilitado' : 'Desabilitado'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}