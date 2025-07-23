import { useState } from 'react';
import { MessageSquare, User, Plus } from 'lucide-react';
import { FilterBar } from '@/components/atendimento/FilterBar';
import { AtendimentosListReal } from '@/components/atendimento/AtendimentosListReal';
import { ChatWhatsAppReal } from '@/components/atendimento/ChatWhatsAppReal';
import { ClienteInfo } from '@/components/atendimento/ClienteInfo';
import { ContactsList } from '@/components/atendimento/ContactsList';
import { TransferDialog } from '@/components/atendimento/TransferDialog';
import { ConfirmSaveContactDialog } from '@/components/contatos/ConfirmSaveContactDialog';
import { NovoContatoDialog } from '@/components/contatos/NovoContatoDialog';
import { useContactCheck } from '@/hooks/useContactCheck';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAtendimentoReal } from '@/hooks/useAtendimentoReal';

interface Conversa {
  id: string;
  agente_id: string | null;
  canal: string | null;
  contato_id: string | null;
  created_at: string | null;
  empresa_id: string | null;
  prioridade: string | null;
  setor: string | null;
  status: string | null;
  tags: string[] | null;
  updated_at: string | null;
  contatos?: {
    id: string;
    nome: string;
    telefone: string | null;
    email: string | null;
  } | null;
  profiles?: {
    id: string;
    nome: string;
    email: string;
  } | null;
}

// Dados de contatos mockados para nova conversa
const contatosMockInicial = [
  {
    id: 1,
    nome: 'Carlos Mendes',
    telefone: '+55 11 91234-5678',
    email: 'carlos.mendes@email.com',
    status: 'online' as const,
    ultimoContato: '2 dias atrás'
  },
  {
    id: 2,
    nome: 'Fernanda Costa',
    telefone: '+55 11 98765-4321',
    email: 'fernanda.costa@email.com',
    status: 'offline' as const,
    ultimoContato: '1 semana atrás'
  },
  {
    id: 3,
    nome: 'Ricardo Silva',
    telefone: '+55 11 95555-1234',
    status: 'online' as const,
    ultimoContato: '3 dias atrás'
  },
  {
    id: 4,
    nome: 'Juliana Santos',
    telefone: '+55 11 97777-8888',
    email: 'juliana.santos@email.com',
    status: 'offline' as const,
    ultimoContato: '5 dias atrás'
  }
];

export default function Atendimento() {
  const [selectedAtendimento, setSelectedAtendimento] = useState<Conversa | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [contatos, setContatos] = useState(contatosMockInicial);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { atualizarStatusConversa } = useAtendimentoReal();

  // Hook para gerenciar verificação e salvamento de contatos
  const {
    pendingContact,
    showConfirmDialog,
    showNovoContatoDialog,
    setShowConfirmDialog,
    setShowNovoContatoDialog,
    handleFinalizarWithContactCheck,
    handleConfirmSave,
    handleCancelSave,
    handleContactSaved
  } = useContactCheck();

  const handleSelectAtendimento = (conversa: Conversa) => {
    setSelectedAtendimento(conversa);
    setShowContacts(false);
    if (isMobile) {
      setShowChat(true);
    }
  };

  const handleReturnToList = () => {
    setShowChat(false);
    setShowContacts(false);
  };

  const handleSairConversa = () => {
    setSelectedAtendimento(null);
    if (isMobile) {
      setShowChat(false);
    }
  };

  const handleTransferir = () => {
    setShowTransferDialog(true);
  };

  const handleFinalizar = async () => {
    if (!selectedAtendimento) return;

    // Criar um objeto compatível com o hook de verificação de contatos
    const atendimentoParaVerificacao = {
      id: selectedAtendimento.id,
      cliente: selectedAtendimento.contatos?.nome || 'Cliente Desconhecido',
      telefone: selectedAtendimento.contatos?.telefone || '',
      ultimaMensagem: '',
      tempo: '',
      setor: selectedAtendimento.setor || '',
      status: selectedAtendimento.status as 'ativo' | 'em-atendimento' | 'pendente' | 'finalizado'
    };

    // Agente atual (normalmente viria do contexto de autenticação)
    const agenteAtual = 'Ana Silva';
    const setorAtual = 'Suporte';

    // Usa o hook para verificar se deve salvar contato
    handleFinalizarWithContactCheck(
      atendimentoParaVerificacao,
      contatos,
      agenteAtual,
      setorAtual,
      async () => {
        // Atualizar status da conversa para finalizado
        await atualizarStatusConversa(selectedAtendimento.id, 'finalizado');
        setSelectedAtendimento(null);
        if (isMobile) {
          setShowChat(false);
        }
        toast({
          title: "Atendimento finalizado",
          description: "O atendimento foi finalizado com sucesso.",
        });
      }
    );
  };

  const handleNovaConversa = () => {
    setShowContacts(true);
    if (isMobile) {
      setShowChat(true);
    }
  };

  const handleSelectContact = (contato: typeof contatos[0]) => {
    // Simular criação de nova conversa
    const novaConversa: Conversa = {
      id: `novo-${Date.now()}`,
      contato_id: contato.id.toString(),
      agente_id: null,
      canal: 'whatsapp',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      empresa_id: null,
      prioridade: 'normal',
      setor: 'Suporte',
      status: 'ativo',
      tags: [],
      contatos: {
        id: contato.id.toString(),
        nome: contato.nome,
        telefone: contato.telefone,
        email: contato.email || null
      }
    };
    
    setSelectedAtendimento(novaConversa);
    setShowContacts(false);
    if (isMobile) {
      setShowChat(true);
    }
  };

  const handleConfirmTransfer = async (agente: string, motivo: string) => {
    if (!selectedAtendimento) return;

    console.log('Transferir para:', agente, 'Motivo:', motivo);
    
    // Atualizar status para pendente (aguardando novo agente)
    await atualizarStatusConversa(selectedAtendimento.id, 'pendente');
    
    toast({
      title: "Atendimento transferido",
      description: `Atendimento transferido para ${agente} com sucesso.`,
    });
    
    setShowTransferDialog(false);
    setSelectedAtendimento(null);
    if (isMobile) {
      setShowChat(false);
    }
  };

  const handleContatoAdicionado = (novoContato: any) => {
    setContatos(prev => [...prev, { ...novoContato, id: prev.length + 1 }]);
    handleContactSaved();
    toast({
      title: "Contato salvo",
      description: `${novoContato.nome} foi adicionado aos contatos com sucesso.`
    });
  };

  // Cliente simulado para informações detalhadas
  const clienteInfo = selectedAtendimento?.contatos ? {
    id: selectedAtendimento.contatos.id,
    nome: selectedAtendimento.contatos.nome,
    telefone: selectedAtendimento.contatos.telefone || '',
    email: selectedAtendimento.contatos.email || '',
    dataCadastro: '15/03/2023',
    tags: selectedAtendimento.tags || [],
    historico: []
  } : null;

  // Layout mobile: mostra lista, contatos ou chat baseado no estado
  if (isMobile) {
    return (
      <div className="min-h-screen">
        {!showChat ? (
          // Mostra lista de atendimentos
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
              <FilterBar />
              <Button 
                onClick={handleNovaConversa}
                className="bg-green-500 hover:bg-green-600 text-white ml-2 w-10 h-10 p-0"
                size="icon"
                title="Nova conversa"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AtendimentosListReal 
                onSelectAtendimento={handleSelectAtendimento}
                selectedAtendimento={selectedAtendimento}
                isMobile={isMobile}
              />
            </div>
          </div>
        ) : showContacts ? (
          // Mostra lista de contatos
          <ContactsList
            contatos={contatos}
            onSelectContact={handleSelectContact}
            onReturnToList={handleReturnToList}
            onAdicionarContato={handleContatoAdicionado}
          />
        ) : (
          // Mostra chat
          <div className="h-screen">
            <ChatWhatsAppReal
              conversaId={selectedAtendimento!.id}
              nomeCliente={selectedAtendimento!.contatos?.nome || 'Cliente'}
              telefoneCliente={selectedAtendimento!.contatos?.telefone || ''}
              onReturnToList={handleReturnToList}
              onSairConversa={handleSairConversa}
              onTransferir={handleTransferir}
              onFinalizar={handleFinalizar}
            />
          </div>
        )}
      </div>
    );
  }

  // Layout desktop: três colunas
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Coluna esquerda: Lista de atendimentos */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Atendimentos</h2>
              <Button 
                onClick={handleNovaConversa}
                className="bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova conversa
              </Button>
            </div>
            <FilterBar />
          </div>
          <div className="flex-1 overflow-hidden">
            <AtendimentosListReal 
              onSelectAtendimento={handleSelectAtendimento}
              selectedAtendimento={selectedAtendimento}
              isMobile={false}
            />
          </div>
        </div>

        {/* Coluna central: Chat */}
        <div className="flex-1 flex flex-col">
          {showContacts ? (
            <ContactsList
              contatos={contatos}
              onSelectContact={handleSelectContact}
              onReturnToList={handleReturnToList}
              onAdicionarContato={handleContatoAdicionado}
            />
          ) : selectedAtendimento ? (
            <ChatWhatsAppReal
              conversaId={selectedAtendimento.id}
              nomeCliente={selectedAtendimento.contatos?.nome || 'Cliente'}
              telefoneCliente={selectedAtendimento.contatos?.telefone || ''}
              onSairConversa={handleSairConversa}
              onTransferir={handleTransferir}
              onFinalizar={handleFinalizar}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um atendimento
                </h3>
                <p className="text-gray-500">
                  Escolha uma conversa para começar o atendimento
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Coluna direita: Informações do cliente */}
        <div className="w-80 border-l border-gray-200 bg-white">
          {clienteInfo ? (
            <ClienteInfo 
              cliente={clienteInfo}
              onSalvarObservacao={(obs) => console.log('Salvar observação:', obs)}
              onAdicionarTag={(tag) => console.log('Adicionar tag:', tag)}
            />
          ) : (
            <div className="p-6 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Selecione um atendimento para ver as informações do cliente</p>
            </div>
          )}
        </div>
      </div>

      {/* Diálogos */}
      <TransferDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        onConfirm={handleConfirmTransfer}
      />

      <ConfirmSaveContactDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        contact={pendingContact}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      <NovoContatoDialog
        open={showNovoContatoDialog}
        onOpenChange={setShowNovoContatoDialog}
        onSave={handleContatoAdicionado}
        initialData={pendingContact}
      />
    </div>
  );
}
