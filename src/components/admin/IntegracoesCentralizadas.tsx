import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Activity, 
  TestTube, 
  BarChart3,
  MessageSquare,
  Workflow,
  Webhook,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import IntegracaoSimples from './IntegracaoSimples';


export default function IntegracoesCentralizadas() {
  // Redirecionar para o novo componente simples
  return <IntegracaoSimples />;

}