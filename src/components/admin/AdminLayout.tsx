import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AdminLayout({ children, title = "Super Admin", description = "Painel administrativo da plataforma" }: AdminLayoutProps) {
  const { user } = useAuth();
  const { adminLogout } = useAdminAuth();

  return (
    <div className="min-h-screen admin-gradient">
      <header className="admin-glass sticky top-0 z-50 border-b border-admin-border-subtle">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="admin-card-elevated p-3 rounded-xl">
                <img 
                  src="/lovable-uploads/eddc7fb8-220e-433f-89b2-915fbe2e2daf.png" 
                  alt="Amplie Icon" 
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <img 
                    src="/lovable-uploads/8ed7aa80-8a43-4375-a757-0f7dd486297f.png" 
                    alt="Amplie Chat Logo" 
                    className="h-7 object-contain"
                  />
                  <span className="text-xl font-bold bg-gradient-to-r from-admin-accent to-admin-accent-light bg-clip-text text-transparent">
                    {title}
                  </span>
                </div>
                <p className="text-sm text-admin-text-secondary font-medium">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="admin-glass px-4 py-2 rounded-lg border border-admin-border-subtle">
                <span className="text-sm font-medium text-admin-text-secondary">
                  {user?.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={adminLogout}
                className="admin-status-danger border-none hover:scale-105 transition-transform duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair do Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}