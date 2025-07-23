import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Settings, Webhook, Activity } from 'lucide-react';
import { WebhooksCentralizados } from './WebhooksCentralizados';
import IntegracaoSimples from './IntegracaoSimples';
import { InstanciasWhatsAppAdmin } from './InstanciasWhatsAppAdmin';

export default function IntegracoesCentralizadas() {
  return (
    <Tabs defaultValue="configuracao" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="configuracao" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          API Global
        </TabsTrigger>
        <TabsTrigger value="instancias" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Instâncias
        </TabsTrigger>
        <TabsTrigger value="webhooks" className="flex items-center gap-2">
          <Webhook className="w-4 h-4" />
          Webhooks
        </TabsTrigger>
        <TabsTrigger value="monitoramento" className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Monitoramento
        </TabsTrigger>
      </TabsList>

      <TabsContent value="configuracao">
        <IntegracaoSimples />
      </TabsContent>

      <TabsContent value="instancias">
        <InstanciasWhatsAppAdmin />
      </TabsContent>

      <TabsContent value="webhooks">
        <WebhooksCentralizados />
      </TabsContent>

      <TabsContent value="monitoramento">
        <div className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Monitoramento de webhooks em desenvolvimento</p>
            <p className="text-sm">Esta funcionalidade estará disponível em breve</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}