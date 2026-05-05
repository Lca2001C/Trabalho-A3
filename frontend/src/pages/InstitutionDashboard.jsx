import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import OngSidebar from '../components/ong_dashboard/OngSidebar';
import OngTopbar from '../components/ong_dashboard/OngTopbar';
import OngDashboardOverview from '../components/ong_dashboard/OngDashboardOverview';
import OngDonationsView from '../components/ong_dashboard/OngDonationsView';
import OngFinanceView from '../components/ong_dashboard/OngFinanceView';
import OngItemsView from '../components/ong_dashboard/OngItemsView';
import OngRequestsView from '../components/ong_dashboard/OngRequestsView';
import OngReceiptsView from '../components/ong_dashboard/OngReceiptsView';
import OngProfileView from '../components/ong_dashboard/OngProfileView';

export default function InstitutionDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-secondary)] overflow-x-hidden">
      
      {/* Sidebar Redesenhada */}
      <OngSidebar 
        currentView={activeTab} 
        onViewChange={setActiveTab} 
        onLogout={handleLogout} 
      />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col md:ml-[210px] transition-all duration-300">
        
        {/* Topbar Redesenhada */}
        <OngTopbar 
          usuario={user} 
          onWithdraw={() => setActiveTab('financeiro')} 
          onProfileClick={() => setActiveTab('perfil')}
        />

        {/* Views Dinâmicas */}
        <main className="px-8 pb-10">
          {activeTab === 'dashboard' && <OngDashboardOverview setActiveTab={setActiveTab} />}
          {activeTab === 'doacoes' && <OngDonationsView />}
          {activeTab === 'financeiro' && <OngFinanceView />}
          {activeTab === 'itens' && <OngItemsView />}
          {activeTab === 'solicitacoes' && <OngRequestsView />}
          {activeTab === 'comprovantes' && <OngReceiptsView />}
          {activeTab === 'perfil' && <OngProfileView />}
        </main>
      </div>
    </div>
  );
}

