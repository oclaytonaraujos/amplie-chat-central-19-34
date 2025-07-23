import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Wifi, WifiOff, Settings, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEvolutionIntegration } from '@/hooks/useEvolutionIntegration';

interface EvolutionConfig {
  id?: string;
  server_url: string;
  api_key: string;
  ativo: boolean;
}

interface InstanciaWhatsApp {
  id: string;
  instance_name: string;
  status: string;
  numero?: string;
  qr_code?: string;
  ativo: boolean;
}

export default function IntegracaoSimples() {
  const [configGlobal, setConfigGlobal] = useState<EvolutionConfig>({
    server_url: '',
    api_key: '',
    ativo: false
  });
  const [instancias, setInstancias] = useState<InstanciaWhatsApp[]>([]);
  const [novaInstancia, setNovaInstancia] = useState('');
  const [loading, setLoading] = useState(true);
  const [testando, setTestando] = useState(false);
  const [conectado, setConectado] = useState(false);
  
  const { toast } = useToast();
  const evolution = useEvolutionIntegration();

  // Usar dados do hook
  useEffect(() => {
    // Carregar configuração apenas se os campos locais estão vazios
    if (evolution.config.server_url && !configGlobal.server_url) {
      setConfigGlobal(evolution.config);
    }
    setInstancias(evolution.instances);
    setLoading(evolution.loading);
    setConectado(evolution.connected);
  }, [evolution.config, evolution.instances, evolution.loading, evolution.connected]);

  const salvarConfiguracao = async () => {
    setTestando(true);
    const sucesso = await evolution.saveGlobalConfig({
      server_url: configGlobal.server_url,
      api_key: configGlobal.api_key,
      ativo: true
    });
    setTestando(false);
  };

  const criarInstancia = async () => {
    if (!novaInstancia.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a instância",
        variant: "destructive",
      });
      return;
    }

    const sucesso = await evolution.createInstance(novaInstancia.trim());
    if (sucesso) {
      setNovaInstancia('');
    }
  };

  const deletarInstancia = async (instanceName: string) => {
    await evolution.deleteInstance(instanceName);
  };

  const conectarInstancia = async (instanceName: string) => {
    await evolution.connectInstance(instanceName);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
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
      case 'connected':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'connecting':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Conectando</Badge>;
      default:
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Desconectado</Badge>;
    }
  };

  if (evolution.loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integração WhatsApp</h2>
        <p className="text-muted-foreground">
          Configure sua conexão com a Evolution API de forma simples
        </p>
      </div>

      {/* Configuração da Evolution API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração da Evolution API
            {conectado && <Badge variant="secondary" className="bg-green-100 text-green-800">Conectado</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="server_url">URL do Servidor</Label>
              <Input
                id="server_url"
                placeholder="https://sua-evolution-api.com"
                value={configGlobal.server_url}
                onChange={(e) => setConfigGlobal(prev => ({ ...prev, server_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_key">Chave da API</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Sua chave da API"
                value={configGlobal.api_key}
                onChange={(e) => setConfigGlobal(prev => ({ ...prev, api_key: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={salvarConfiguracao} disabled={testando}>
              {testando ? 'Testando...' : 'Salvar e Testar'}
            </Button>
            {evolution.config.server_url && (
              <Button 
                variant="outline" 
                onClick={() => setConfigGlobal(evolution.config)}
              >
                Carregar Configuração Existente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instâncias WhatsApp */}
      {evolution.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Instâncias WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Criar nova instância */}
            <div className="flex gap-2">
              <Input
                placeholder="Nome da nova instância"
                value={novaInstancia}
                onChange={(e) => setNovaInstancia(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && criarInstancia()}
              />
              <Button onClick={criarInstancia} disabled={!novaInstancia.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Criar
              </Button>
            </div>

            {/* Lista de instâncias */}
            <div className="space-y-3">
              {evolution.instances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma instância criada ainda</p>
                  <p className="text-sm">Crie sua primeira instância para começar</p>
                </div>
              ) : (
                evolution.instances.map((instancia) => (
                  <div key={instancia.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(instancia.status)}
                      <div>
                        <div className="font-medium">{instancia.instance_name}</div>
                        {instancia.numero && (
                          <div className="text-sm text-muted-foreground">{instancia.numero}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(instancia.status)}
                      
                      {instancia.status === 'disconnected' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => conectarInstancia(instancia.instance_name)}
                        >
                          Conectar
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deletarInstancia(instancia.instance_name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aviso se não estiver conectado */}
      {!evolution.connected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <div className="font-medium">Configuração Necessária</div>
                <div className="text-sm">Configure a Evolution API acima para começar a usar o WhatsApp</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}