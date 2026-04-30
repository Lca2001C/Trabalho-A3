import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Novos componentes de layout Admin
import AdminSidebar from '../components/admin_dashboard/AdminSidebar';
import AdminTopbar from '../components/admin_dashboard/AdminTopbar';

// Views Administrativas Existentes
import AdminDashboardOverview from '../components/admin_dashboard/AdminDashboardOverview';
import AdminDonationsView from '../components/admin_dashboard/AdminDonationsView';
import AdminOngsView from '../components/admin_dashboard/AdminOngsView';
import AdminReportsView from '../components/admin_dashboard/AdminReportsView';
import AdminUsersView from '../components/admin_dashboard/AdminUsersView';
import AdminSettingsView from '../components/admin_dashboard/AdminSettingsView';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedONG, setSelectedONG] = useState(null);
  
  const { user: usuario, logout } = useAuth();

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'ongs') setSelectedONG(null);
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-secondary)] overflow-x-hidden">
      
      {/* Sidebar Admin Redesenhada */}
      <AdminSidebar 
        currentView={activeTab} 
        onViewChange={handleTabChange} 
        onLogout={logout} 
      />

      {/* Área Principal */}
      <div className="flex-1 flex flex-col md:ml-[210px] transition-all duration-300">
        
        {/* Topbar Admin Redesenhada */}
        <AdminTopbar usuario={usuario} />

        {/* Conteúdo Dinâmico com Padding Padrão */}
        <main className="px-8 pb-10">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <AdminDashboardOverview setActiveTab={handleTabChange} />}
            {activeTab === 'doacoes' && <AdminDonationsView />}
            {activeTab === 'ongs' && <AdminOngsView selectedONG={selectedONG} setSelectedONG={setSelectedONG} />}
            {activeTab === 'relatorios' && <AdminReportsView />}
            {activeTab === 'usuarios' && <AdminUsersView />}
            {activeTab === 'configuracoes' && <AdminSettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
}
