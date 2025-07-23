
import React from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  Info,
  User,
  VolumeX,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WhatsAppHeaderProps {
  contato: {
    id: string;
    nome: string;
    telefone: string;
    email?: string;
  };
  isTyping?: boolean;
  onReturnToList?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onViewInfo?: () => void;
  onMute?: () => void;
  onBlock?: () => void;
  onDelete?: () => void;
}

export function WhatsAppHeader({
  contato,
  isTyping = false,
  onReturnToList,
  onCall,
  onVideoCall,
  onSearch,
  onViewInfo,
  onMute,
  onBlock,
  onDelete
}: WhatsAppHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Botão de voltar (mobile) */}
          {onReturnToList && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReturnToList}
              className="p-0 h-8 w-8 md:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {/* Avatar e informações do contato */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-green-500 text-white">
                {getInitials(contato.nome)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {contato.nome}
                </h3>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatPhoneNumber(contato.telefone)}</span>
                {isTyping && (
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-blue-500 text-xs">digitando...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ações do header */}
        <div className="flex items-center space-x-1">
          {/* Botão de chamada de voz */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCall}
            className="p-2 h-8 w-8 text-gray-600 hover:text-gray-800"
            title="Chamada de voz"
          >
            <Phone className="w-4 h-4" />
          </Button>
          
          {/* Botão de chamada de vídeo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onVideoCall}
            className="p-2 h-8 w-8 text-gray-600 hover:text-gray-800"
            title="Chamada de vídeo"
          >
            <Video className="w-4 h-4" />
          </Button>
          
          {/* Botão de pesquisa */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearch}
            className="p-2 h-8 w-8 text-gray-600 hover:text-gray-800 hidden md:flex"
            title="Pesquisar"
          >
            <Search className="w-4 h-4" />
          </Button>
          
          {/* Menu de opções */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8 text-gray-600 hover:text-gray-800"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onViewInfo}>
                <Info className="w-4 h-4 mr-2" />
                Informações do contato
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={onSearch} className="md:hidden">
                <Search className="w-4 h-4 mr-2" />
                Pesquisar mensagens
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={onMute}>
                <VolumeX className="w-4 h-4 mr-2" />
                Silenciar notificações
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={onBlock}>
                <User className="w-4 h-4 mr-2" />
                Bloquear contato
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar conversa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
