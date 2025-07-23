
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import NovoUsuarioSuperAdminDialog from './NovoUsuarioSuperAdminDialog';
import EditarUsuarioSuperAdminDialog from './EditarUsuarioSuperAdminDialog';
import ExcluirUsuarioSuperAdminDialog from './ExcluirUsuarioSuperAdminDialog';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  setor: string;
  status: string;
  empresa_id: string;
  created_at: string;
  empresas?: {
    nome: string;
  };
}

export default function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEmpresa, setFiltroEmpresa] = useState('all');
  const [filtroCargo, setFiltroCargo] = useState('all');
  const [busca, setBusca] = useState('');
  const [empresas, setEmpresas] = useState<{id: string, nome: string}[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [novoUsuarioOpen, setNovoUsuarioOpen] = useState(false);
  const [editarUsuarioOpen, setEditarUsuarioOpen] = useState(false);
  const [excluirUsuarioOpen, setExcluirUsuarioOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsuarios();
    fetchEmpresas();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          empresas (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const handleUsuarioCreated = () => {
    fetchUsuarios();
    setNovoUsuarioOpen(false);
  };

  const handleUsuarioUpdated = () => {
    fetchUsuarios();
    setEditarUsuarioOpen(false);
    setSelectedUsuario(null);
  };

  const handleUsuarioDeleted = () => {
    fetchUsuarios();
    setExcluirUsuarioOpen(false);
    setSelectedUsuario(null);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'online': { className: 'admin-status-success border-none font-semibold', label: '🟢 Online' },
      'offline': { className: 'bg-admin-surface text-admin-text-secondary border-admin-border-subtle font-semibold', label: '⚫ Offline' },
      'ausente': { className: 'admin-status-warning border-none font-semibold', label: '🟡 Ausente' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { className: 'bg-admin-surface text-admin-text-secondary border-admin-border-subtle', label: status };
    
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getCargoBadge = (cargo: string) => {
    const cargoMap = {
      'super_admin': { className: 'admin-status-danger border-none font-semibold', label: '👑 Super Admin' },
      'admin': { className: 'admin-status-success border-none font-semibold', label: '🛡️ Administrador' },
      'agente': { className: 'admin-status-warning border-none font-semibold', label: '💬 Agente' },
      'usuario': { className: 'bg-admin-surface text-admin-text-secondary border-admin-border-subtle font-semibold', label: '👤 Usuário' },
    };

    const cargoInfo = cargoMap[cargo as keyof typeof cargoMap] || { className: 'bg-admin-surface text-admin-text-secondary border-admin-border-subtle', label: cargo };
    
    return (
      <Badge className={cargoInfo.className}>
        {cargoInfo.label}
      </Badge>
    );
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchEmpresa = filtroEmpresa === 'all' || usuario.empresa_id === filtroEmpresa;
    const matchCargo = filtroCargo === 'all' || usuario.cargo === filtroCargo;
    const matchBusca = !busca || 
      usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busca.toLowerCase());
    
    return matchEmpresa && matchCargo && matchBusca;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-muted rounded w-40 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="h-10 bg-muted rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-48 animate-pulse"></div>
        </div>
        <div className="border rounded-lg">
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-muted rounded flex-1 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-admin-text-primary">Usuários do Sistema</h3>
          <p className="text-admin-text-secondary mt-1">Gerencie todos os usuários da plataforma</p>
        </div>
        <Button 
          onClick={() => setNovoUsuarioOpen(true)}
          className="bg-admin-accent hover:bg-admin-accent-light text-white border-0 font-semibold transition-all duration-200 hover:scale-105"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <div className="admin-glass p-4 rounded-xl border border-admin-border-subtle">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <Input
            placeholder="🔍 Buscar por nome ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-sm border-admin-border-subtle focus:border-admin-accent transition-colors"
          />
          <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
            <SelectTrigger className="w-48 border-admin-border-subtle focus:border-admin-accent">
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent className="admin-glass border-admin-border-subtle">
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroCargo} onValueChange={setFiltroCargo}>
            <SelectTrigger className="w-48 border-admin-border-subtle focus:border-admin-accent">
              <SelectValue placeholder="Filtrar por cargo" />
            </SelectTrigger>
            <SelectContent className="admin-glass border-admin-border-subtle">
              <SelectItem value="all">Todos os cargos</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="agente">Agente</SelectItem>
              <SelectItem value="usuario">Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="admin-card-elevated rounded-xl overflow-hidden border-0">
        <Table>
          <TableHeader>
            <TableRow className="border-admin-border-subtle hover:bg-admin-surface">
              <TableHead className="font-semibold text-admin-text-primary">Nome</TableHead>
              <TableHead className="font-semibold text-admin-text-primary">Email</TableHead>
              <TableHead className="font-semibold text-admin-text-primary">Empresa</TableHead>
              <TableHead className="font-semibold text-admin-text-primary">Cargo</TableHead>
              <TableHead className="font-semibold text-admin-text-primary">Setor</TableHead>
              <TableHead className="font-semibold text-admin-text-primary">Status</TableHead>
              <TableHead className="font-semibold text-admin-text-primary">Data Cadastro</TableHead>
              <TableHead className="font-semibold text-admin-text-primary">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuariosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-admin-text-secondary py-12">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">👥</span>
                    <p className="font-medium">Nenhum usuário encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <TableRow key={usuario.id} className="border-admin-border-subtle hover:bg-admin-surface admin-hover-lift">
                  <TableCell className="font-semibold text-admin-text-primary">{usuario.nome}</TableCell>
                  <TableCell className="text-admin-text-secondary">{usuario.email}</TableCell>
                  <TableCell className="text-admin-text-secondary">{usuario.empresas?.nome || 'N/A'}</TableCell>
                  <TableCell>{getCargoBadge(usuario.cargo)}</TableCell>
                  <TableCell className="text-admin-text-secondary">{usuario.setor || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(usuario.status)}</TableCell>
                  <TableCell className="text-admin-text-secondary font-medium">
                    {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUsuario(usuario);
                          setEditarUsuarioOpen(true);
                        }}
                        className="admin-hover-lift border-admin-border-subtle hover:bg-admin-accent hover:text-white transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUsuario(usuario);
                          setExcluirUsuarioOpen(true);
                        }}
                        className="admin-status-danger border-none admin-hover-lift"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <NovoUsuarioSuperAdminDialog
        open={novoUsuarioOpen}
        onOpenChange={setNovoUsuarioOpen}
        onUsuarioCreated={handleUsuarioCreated}
        empresas={empresas}
      />

      {selectedUsuario && (
        <>
          <EditarUsuarioSuperAdminDialog
            open={editarUsuarioOpen}
            onOpenChange={setEditarUsuarioOpen}
            usuario={selectedUsuario}
            onUsuarioUpdated={handleUsuarioUpdated}
            empresas={empresas}
          />
          <ExcluirUsuarioSuperAdminDialog
            open={excluirUsuarioOpen}
            onOpenChange={setExcluirUsuarioOpen}
            usuario={selectedUsuario}
            onUsuarioDeleted={handleUsuarioDeleted}
          />
        </>
      )}
    </div>
  );
}
