import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  CircleDollarSign, 
  Package, 
  ClipboardList, 
  FileText, 
  User, 
  LogOut, 
  Leaf
} from 'lucide-react';

import OngDashboardOverview from '../components/ong_dashboard/OngDashboardOverview';
import OngDonationsView from '../components/ong_dashboard/OngDonationsView';
import OngFinanceView from '../components/ong_dashboard/OngFinanceView';
import OngItemsView from '../components/ong_dashboard/OngItemsView';
import OngRequestsView from '../components/ong_dashboard/OngRequestsView';
import OngReceiptsView from '../components/ong_dashboard/OngReceiptsView';
import OngProfileView from '../components/ong_dashboard/OngProfileView';

export default function InstitutionDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    logout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'doacoes', label: 'Doações recebidas', icon: HeartHandshake },
    { id: 'financeiro', label: 'Financeiro', icon: CircleDollarSign },
    { id: 'itens', label: 'Itens recebidos', icon: Package },
    { id: 'solicitacoes', label: 'Solicitações', icon: ClipboardList },
    { id: 'comprovantes', label: 'Comprovantes', icon: FileText },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 md:h-screen sticky top-0 flex-shrink-0 flex flex-col z-10">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-green-900 tracking-tight">ConectaBem</span>
        </div>
        
        <nav className="p-4 flex-grow space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-green-600' : 'text-gray-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {activeTab === 'dashboard' && <OngDashboardOverview setActiveTab={setActiveTab} />}
        {activeTab === 'doacoes' && <OngDonationsView />}
        {activeTab === 'financeiro' && <OngFinanceView />}
        {activeTab === 'itens' && <OngItemsView />}
        {activeTab === 'solicitacoes' && <OngRequestsView />}
        {activeTab === 'comprovantes' && <OngReceiptsView />}
        {activeTab === 'perfil' && <OngProfileView />}
      </main>

    </div>
  );
}
