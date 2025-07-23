
import React, { useState, useEffect } from 'react';
import { WhatsAppChatContainer } from './whatsapp/WhatsAppChatContainer';
import { useAtendimentoReal } from '@/hooks/useAtendimentoReal';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatWhatsAppRealProps {
  conversaId: string;
  nomeCliente: string;
  telefoneCliente: string;
  onReturnToList?: () => void;
  onSairConversa?: () => void;
  onTransferir?: () => void;
  onFinalizar?: () => void;
}

export function ChatWhatsAppReal({ 
  conversaId, 
  nomeCliente, 
  telefoneCliente,
  onReturnToList,
  onSairConversa,
  onTransferir,
  onFinalizar
}: ChatWhatsAppRealProps) {
  const isMobile = useIsMobile();
  const { 
    mensagensConversa, 
    loadMensagensConversa, 
    atualizarStatusConversa 
  } = useAtendimentoReal();

  const mensagens = mensagensConversa[conversaId] || [];
  
  const contato = {
    id: conversaId,
    nome: nomeCliente,
    telefone: telefoneCliente
  };

  useEffect(() => {
    if (conversaId) {
      loadMensagensConversa(conversaId);
      atualizarStatusConversa(conversaId, 'em-atendimento');
    }
  }, [conversaId, loadMensagensConversa, atualizarStatusConversa]);

  const handleUpdateMessageStatus = (messageId: string, status: string) => {
    // Implementar atualização de status da mensagem
    console.log('Atualizar status da mensagem:', messageId, status);
  };

  return (
    <div className="h-full">
      <WhatsAppChatContainer
        conversaId={conversaId}
        contato={contato}
        mensagens={mensagens}
        onUpdateMessageStatus={handleUpdateMessageStatus}
        onReturnToList={onReturnToList}
      />
    </div>
  );
}
