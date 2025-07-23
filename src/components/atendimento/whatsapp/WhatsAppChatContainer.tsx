
import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WhatsAppMessage } from './WhatsAppMessage';
import { WhatsAppInputArea } from './WhatsAppInputArea';
import { WhatsAppHeader } from './WhatsAppHeader';
import { useEvolutionApiSender } from '@/hooks/useEvolutionApiSender';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppChatContainerProps {
  conversaId: string;
  contato: {
    id: string;
    nome: string;
    telefone: string;
    email?: string;
  };
  mensagens: Array<{
    id: string;
    conteudo: string;
    remetente_tipo: 'cliente' | 'agente' | 'sistema';
    remetente_nome: string;
    created_at: string;
    tipo_mensagem: 'texto' | 'imagem' | 'audio' | 'video' | 'documento' | 'localizacao' | 'contato' | 'figurinha' | 'botoes' | 'lista';
    metadata?: any;
    status?: 'enviando' | 'enviado' | 'entregue' | 'lido' | 'erro';
    lida?: boolean;
  }>;
  onLoadMoreMessages?: () => void;
  onUpdateMessageStatus?: (messageId: string, status: string) => void;
  onReturnToList?: () => void;
}

export function WhatsAppChatContainer({
  conversaId,
  contato,
  mensagens,
  onLoadMoreMessages,
  onUpdateMessageStatus,
  onReturnToList
}: WhatsAppChatContainerProps) {
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { sendMessage, uploadFile, isLoading } = useEvolutionApiSender();

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageData: {
    type: 'texto' | 'imagem' | 'audio' | 'video' | 'documento' | 'localizacao' | 'contato' | 'botoes' | 'lista';
    content: string;
    file?: File;
    metadata?: any;
  }) => {
    try {
      let result;
      
      switch (messageData.type) {
        case 'texto':
          result = await sendMessage({
            telefone: contato.telefone,
            mensagem: messageData.content,
            tipo: 'texto',
            conversaId
          });
          break;
          
        case 'imagem':
          if (messageData.file) {
            const fileUrl = await uploadFile(messageData.file);
            result = await sendMessage({
              telefone: contato.telefone,
              mensagem: messageData.content,
              tipo: 'imagem',
              opcoes: {
                imageUrl: fileUrl,
                caption: messageData.content
              },
              conversaId
            });
          }
          break;
          
        case 'audio':
          if (messageData.file) {
            const fileUrl = await uploadFile(messageData.file);
            result = await sendMessage({
              telefone: contato.telefone,
              mensagem: '',
              tipo: 'audio',
              opcoes: {
                audioUrl: fileUrl
              },
              conversaId
            });
          }
          break;
          
        case 'video':
          if (messageData.file) {
            const fileUrl = await uploadFile(messageData.file);
            result = await sendMessage({
              telefone: contato.telefone,
              mensagem: messageData.content,
              tipo: 'video',
              opcoes: {
                videoUrl: fileUrl,
                caption: messageData.content
              },
              conversaId
            });
          }
          break;
          
        case 'documento':
          if (messageData.file) {
            const fileUrl = await uploadFile(messageData.file);
            result = await sendMessage({
              telefone: contato.telefone,
              mensagem: messageData.content,
              tipo: 'documento',
              opcoes: {
                documentUrl: fileUrl,
                fileName: messageData.file.name
              },
              conversaId
            });
          }
          break;
          
        case 'localizacao':
          result = await sendMessage({
            telefone: contato.telefone,
            mensagem: messageData.content,
            tipo: 'texto', // Evolution API não tem tipo específico para localização
            conversaId
          });
          break;
          
        case 'contato':
          result = await sendMessage({
            telefone: contato.telefone,
            mensagem: messageData.content,
            tipo: 'texto', // Evolution API não tem tipo específico para contato
            conversaId
          });
          break;
          
        case 'botoes':
          result = await sendMessage({
            telefone: contato.telefone,
            mensagem: messageData.content,
            tipo: 'botoes',
            opcoes: {
              botoes: messageData.metadata?.buttons || [],
              footer: 'Selecione uma opção'
            },
            conversaId
          });
          break;
          
        case 'lista':
          result = await sendMessage({
            telefone: contato.telefone,
            mensagem: messageData.content,
            tipo: 'lista',
            opcoes: {
              lista: messageData.metadata?.listOptions
            },
            conversaId
          });
          break;
      }
      
      if (result?.success) {
        toast({
          title: "Mensagem enviada",
          description: "Mensagem enviada com sucesso!",
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleReply = (message: any) => {
    setReplyingTo({
      id: message.id,
      content: message.conteudo,
      sender: message.remetente_nome,
      type: message.tipo_mensagem
    });
  };

  const handleForward = (message: any) => {
    // Implementar lógica de encaminhamento
    console.log('Encaminhar mensagem:', message);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Encaminhamento de mensagens será implementado em breve.",
    });
  };

  const handleDelete = (messageId: string) => {
    // Implementar lógica de exclusão
    console.log('Deletar mensagem:', messageId);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Exclusão de mensagens será implementada em breve.",
    });
  };

  const handleStar = (messageId: string) => {
    // Implementar lógica de favoritos
    console.log('Favoritar mensagem:', messageId);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Favoritos serão implementados em breve.",
    });
  };

  const handleDownload = (url: string, fileName: string) => {
    // Implementar lógica de download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <WhatsAppHeader
        contato={contato}
        isTyping={isTyping}
        onReturnToList={onReturnToList}
      />
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {mensagens.map((message) => (
            <WhatsAppMessage
              key={message.id}
              message={message}
              isOwnMessage={message.remetente_tipo === 'agente'}
              onReply={handleReply}
              onForward={handleForward}
              onDelete={handleDelete}
              onStar={handleStar}
              onDownload={handleDownload}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <WhatsAppInputArea
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        disabled={isLoading}
      />
    </div>
  );
}
