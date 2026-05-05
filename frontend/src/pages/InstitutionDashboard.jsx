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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-secondary)] overflow-x-hidden relative">
      
      {/* Sidebar Redesenhada com suporte mobile */}
      <OngSidebar 
        currentView={activeTab} 
        onViewChange={(view) => {
          setActiveTab(view);
          closeSidebar();
        }} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col md:ml-[210px] transition-all duration-300 min-w-0">
        
        {/* Topbar Redesenhada */}
        <OngTopbar 
          usuario={user} 
          onWithdraw={() => setActiveTab('financeiro')} 
          onProfileClick={() => setActiveTab('perfil')}
          onToggleMenu={toggleSidebar}
        />

        {/* Views Dinâmicas */}
        <main className="px-4 sm:px-8 pb-10 w-full max-w-7xl mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' && <OngDashboardOverview setActiveTab={setActiveTab} />}
            {activeTab === 'doacoes' && <OngDonationsView />}
            {activeTab === 'financeiro' && <OngFinanceView />}
            {activeTab === 'itens' && <OngItemsView />}
            {activeTab === 'solicitacoes' && <OngRequestsView />}
            {activeTab === 'comprovantes' && <OngReceiptsView />}
            {activeTab === 'perfil' && <OngProfileView />}
          </div>
        </main>
      </div>
    </div>
  );
}

