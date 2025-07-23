import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface EvolutionConfig {
  id?: string;
  server_url: string;
  api_key: string;
  ativo: boolean;
}

interface EvolutionInstance {
  id: string;
  instance_name: string;
  status: string;
  numero?: string;
  qr_code?: string;
  ativo: boolean;
  webhook_url?: string;
}

interface ConnectionStatus {
  connected: boolean;
  error?: string;
}

/**
 * Hook simplificado para gerenciar a integração com Evolution API
 * Foco na facilidade de uso e clareza
 */
export function useEvolutionIntegration() {
  const [config, setConfig] = useState<EvolutionConfig>({
    server_url: '',
    api_key: '',
    ativo: false
  });
  const [instances, setInstances] = useState<EvolutionInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  
  const { toast } = useToast();

  // Carrega todas as configurações
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Carregar configuração global
      const { data: globalConfig } = await supabase
        .from('evolution_api_global_config')
        .select('*')
        .eq('ativo', true)
        .maybeSingle();
      
      if (globalConfig) {
        setConfig({
          id: globalConfig.id,
          server_url: globalConfig.server_url,
          api_key: globalConfig.api_key,
          ativo: globalConfig.ativo
        });
        setConnected(true);
      }
      
      // Carregar instâncias
      const { data: instancesData } = await supabase
        .from('evolution_api_config')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (instancesData) {
        setInstances(instancesData.map(inst => ({
          id: inst.id,
          instance_name: inst.instance_name,
          status: inst.status || 'disconnected',
          numero: inst.numero,
          qr_code: inst.qr_code,
          ativo: inst.ativo,
          webhook_url: inst.webhook_url
        })));
      }
      
      logger.info('Dados da integração Evolution carregados', {
        component: 'useEvolutionIntegration'
      });
      
    } catch (error) {
      logger.error('Erro ao carregar dados da integração', {
        component: 'useEvolutionIntegration'
      }, error as Error);
      
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações da integração",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Salva configuração global
  const saveGlobalConfig = useCallback(async (newConfig: Omit<EvolutionConfig, 'id'>) => {
    try {
      if (!newConfig.server_url || !newConfig.api_key) {
        throw new Error('URL do servidor e chave da API são obrigatórios');
      }

      let savedConfig;
      
      if (config.id) {
        // Atualizar configuração existente
        const { data, error } = await supabase
          .from('evolution_api_global_config')
          .update(newConfig)
          .eq('id', config.id)
          .select()
          .single();
        
        if (error) throw error;
        savedConfig = data;
      } else {
        // Desativar configurações existentes e criar nova
        await supabase
          .from('evolution_api_global_config')
          .update({ ativo: false })
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        const { data, error } = await supabase
          .from('evolution_api_global_config')
          .insert({ ...newConfig, ativo: true })
          .select()
          .single();
        
        if (error) throw error;
        savedConfig = data;
      }

      setConfig({
        id: savedConfig.id,
        server_url: savedConfig.server_url,
        api_key: savedConfig.api_key,
        ativo: savedConfig.ativo
      });
      
      setConnected(true);
      
      toast({
        title: "Sucesso",
        description: "Configuração salva com sucesso",
      });
      
      logger.info('Configuração global Evolution salva', {
        component: 'useEvolutionIntegration'
      });
      
      return true;
    } catch (error) {
      logger.error('Erro ao salvar configuração global', {
        component: 'useEvolutionIntegration'
      }, error as Error);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar configuração",
        variant: "destructive",
      });
      
      return false;
    }
  }, [config.id, toast]);

  // Testa conexão com a API
  const testConnection = useCallback(async (): Promise<ConnectionStatus> => {
    try {
      if (!config.server_url || !config.api_key) {
        return { connected: false, error: 'Configuração incompleta' };
      }

      const response = await fetch(`${config.server_url}/manager/findInstance`, {
        method: 'GET',
        headers: {
          'apikey': config.api_key,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return { connected: true };
      } else {
        return { connected: false, error: `Erro ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Erro de conexão' 
      };
    }
  }, [config.server_url, config.api_key]);

  // Cria nova instância
  const createInstance = useCallback(async (instanceName: string) => {
    try {
      if (!connected) {
        throw new Error('Evolution API não está configurada');
      }

      const webhookUrl = `${window.location.origin}/api/webhooks/evolution/${instanceName}`;
      
      // Criar instância na Evolution API
      const response = await fetch(`${config.server_url}/manager/create`, {
        method: 'POST',
        headers: {
          'apikey': config.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instanceName,
          token: instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          webhook: webhookUrl,
          webhook_by_events: true,
          events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
          reject_call: true,
          msg_call: "Chamadas não são atendidas",
          groups_ignore: true,
          always_online: true,
          read_messages: true,
          read_status: true
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Obter empresa_id do usuário atual
      const { data: profileData } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profileData?.empresa_id) {
        throw new Error('Empresa não encontrada para o usuário');
      }

      // Salvar no banco local
      const { data, error } = await supabase
        .from('evolution_api_config')
        .insert({
          empresa_id: profileData.empresa_id,
          instance_name: instanceName,
          webhook_url: webhookUrl,
          webhook_events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
          ativo: true,
          status: 'disconnected'
        })
        .select()
        .single();

      if (error) throw error;

      const newInstance: EvolutionInstance = {
        id: data.id,
        instance_name: data.instance_name,
        status: data.status,
        ativo: data.ativo,
        webhook_url: data.webhook_url
      };

      setInstances(prev => [newInstance, ...prev]);

      toast({
        title: "Sucesso",
        description: `Instância ${instanceName} criada com sucesso`,
      });

      logger.info('Instância criada com sucesso', {
        component: 'useEvolutionIntegration',
        metadata: { instanceName }
      });

      return true;
    } catch (error) {
      logger.error('Erro ao criar instância', {
        component: 'useEvolutionIntegration',
        metadata: { instanceName }
      }, error as Error);

      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar instância",
        variant: "destructive",
      });

      return false;
    }
  }, [connected, config, toast]);

  // Deleta instância
  const deleteInstance = useCallback(async (instanceName: string) => {
    try {
      if (!connected) {
        throw new Error('Evolution API não está configurada');
      }

      // Deletar da Evolution API
      const response = await fetch(`${config.server_url}/manager/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': config.api_key,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Deletar do banco local
      const { error } = await supabase
        .from('evolution_api_config')
        .delete()
        .eq('instance_name', instanceName);

      if (error) {
        logger.error('Erro ao deletar instância do banco', {
          component: 'useEvolutionIntegration',
          metadata: { instanceName }
        }, error);
      }

      setInstances(prev => prev.filter(inst => inst.instance_name !== instanceName));

      toast({
        title: "Sucesso",
        description: `Instância ${instanceName} deletada com sucesso`,
      });

      logger.info('Instância deletada com sucesso', {
        component: 'useEvolutionIntegration',
        metadata: { instanceName }
      });

      return true;
    } catch (error) {
      logger.error('Erro ao deletar instância', {
        component: 'useEvolutionIntegration',
        metadata: { instanceName }
      }, error as Error);

      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao deletar instância",
        variant: "destructive",
      });

      return false;
    }
  }, [connected, config, toast]);

  // Conecta instância
  const connectInstance = useCallback(async (instanceName: string) => {
    try {
      if (!connected) {
        throw new Error('Evolution API não está configurada');
      }

      const response = await fetch(`${config.server_url}/manager/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': config.api_key,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Conectando",
        description: `Iniciando conexão da instância ${instanceName}`,
      });

      logger.info('Comando de conexão enviado', {
        component: 'useEvolutionIntegration',
        metadata: { instanceName }
      });

      // Recarregar dados após alguns segundos para atualizar status
      setTimeout(() => {
        loadData();
      }, 3000);

      return true;
    } catch (error) {
      logger.error('Erro ao conectar instância', {
        component: 'useEvolutionIntegration',
        metadata: { instanceName }
      }, error as Error);

      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao conectar instância",
        variant: "destructive",
      });

      return false;
    }
  }, [connected, config, toast, loadData]);

  // Carrega dados ao inicializar
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Estado
    config,
    instances,
    loading,
    connected,

    // Ações
    loadData,
    saveGlobalConfig,
    testConnection,
    createInstance,
    deleteInstance,
    connectInstance
  };
}