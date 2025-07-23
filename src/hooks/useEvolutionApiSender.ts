
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendMessageParams {
  telefone: string;
  mensagem: string;
  tipo: 'texto' | 'imagem' | 'documento' | 'audio' | 'video' | 'botoes' | 'lista';
  opcoes?: {
    imageUrl?: string;
    caption?: string;
    documentUrl?: string;
    fileName?: string;
    audioUrl?: string;
    videoUrl?: string;
    botoes?: Array<{ id: string; text: string }>;
    footer?: string;
    lista?: {
      title: string;
      description: string;
      buttonText: string;
      sections: Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
      }>;
      footerText?: string;
    };
  };
  conversaId?: string;
  instanceName?: string;
}

export function useEvolutionApiSender() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `whatsapp-attachments/${fileName}`;

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw new Error('Falha no upload do arquivo');
    }
  };

  const sendMessage = async (params: SendMessageParams) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chatbot-sender-evolution', {
        body: params
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }

      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem via Evolution API:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendTextMessage = async (telefone: string, mensagem: string, conversaId?: string) => {
    return sendMessage({
      telefone,
      mensagem,
      tipo: 'texto',
      conversaId
    });
  };

  const sendImageMessage = async (telefone: string, imageFile: File, caption?: string, conversaId?: string) => {
    const imageUrl = await uploadFile(imageFile);
    return sendMessage({
      telefone,
      mensagem: caption || '',
      tipo: 'imagem',
      opcoes: {
        imageUrl,
        caption
      },
      conversaId
    });
  };

  const sendDocumentMessage = async (telefone: string, documentFile: File, conversaId?: string) => {
    const documentUrl = await uploadFile(documentFile);
    return sendMessage({
      telefone,
      mensagem: documentFile.name,
      tipo: 'documento',
      opcoes: {
        documentUrl,
        fileName: documentFile.name
      },
      conversaId
    });
  };

  const sendAudioMessage = async (telefone: string, audioFile: File, conversaId?: string) => {
    const audioUrl = await uploadFile(audioFile);
    return sendMessage({
      telefone,
      mensagem: '',
      tipo: 'audio',
      opcoes: {
        audioUrl
      },
      conversaId
    });
  };

  const sendVideoMessage = async (telefone: string, videoFile: File, caption?: string, conversaId?: string) => {
    const videoUrl = await uploadFile(videoFile);
    return sendMessage({
      telefone,
      mensagem: caption || '',
      tipo: 'video',
      opcoes: {
        videoUrl,
        caption
      },
      conversaId
    });
  };

  const sendButtonsMessage = async (
    telefone: string, 
    mensagem: string, 
    botoes: Array<{ id: string; text: string }>,
    footer?: string,
    conversaId?: string
  ) => {
    return sendMessage({
      telefone,
      mensagem,
      tipo: 'botoes',
      opcoes: {
        botoes,
        footer
      },
      conversaId
    });
  };

  const sendListMessage = async (
    telefone: string,
    listOptions: {
      title: string;
      description: string;
      buttonText: string;
      sections: Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
      }>;
      footerText?: string;
    },
    conversaId?: string
  ) => {
    return sendMessage({
      telefone,
      mensagem: listOptions.title,
      tipo: 'lista',
      opcoes: {
        lista: listOptions
      },
      conversaId
    });
  };

  return {
    sendMessage,
    sendTextMessage,
    sendImageMessage,
    sendDocumentMessage,
    sendAudioMessage,
    sendVideoMessage,
    sendButtonsMessage,
    sendListMessage,
    uploadFile,
    isLoading
  };
}
