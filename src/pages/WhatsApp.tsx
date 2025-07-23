import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { WhatsAppConnectionsEmpresa } from '@/components/whatsapp/WhatsAppConnectionsEmpresa';

export default function WhatsApp() {
  return (
    <Layout title="WhatsApp" description="Gerenciar conexões WhatsApp">
      <div className="flex-1 space-y-6 p-6">
        <WhatsAppConnectionsEmpresa />
      </div>
    </Layout>
  );
}