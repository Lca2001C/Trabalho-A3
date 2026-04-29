import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  MoreVertical,
  Leaf
} from 'lucide-react';

import AdminDashboardOverview from '../components/admin_dashboard/AdminDashboardOverview';
import AdminDonationsView from '../components/admin_dashboard/AdminDonationsView';
import AdminOngsView from '../components/admin_dashboard/AdminOngsView';
import AdminReportsView from '../components/admin_dashboard/AdminReportsView';
import AdminUsersView from '../components/admin_dashboard/AdminUsersView';
import AdminSettingsView from '../components/admin_dashboard/AdminSettingsView';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedONG, setSelectedONG] = useState(null);
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    logout();
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'doacoes', name: 'Doações', icon: HeartHandshake },
    { id: 'ongs', name: 'ONGs', icon: Building2 },
    { id: 'usuarios', name: 'Usuários', icon: Users },
    { id: 'relatorios', name: 'Relatórios', icon: FileText },
    { id: 'configuracoes', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
             <Leaf className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">ConectaBem</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'ongs') setSelectedONG(null); // Reset ONG details when switching tabs
                }}
                className={`w-full flex items-center px-3 py-3 rounded-xl transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                {item.name}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
           <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
               <Leaf className="text-white w-5 h-5" />
             </div>
             <span className="text-xl font-bold text-gray-900">ConectaBem</span>
           </div>
           <button className="p-2 text-gray-500">
             <MoreVertical className="w-6 h-6" />
           </button>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto h-full">
          {activeTab === 'dashboard' && <AdminDashboardOverview setActiveTab={setActiveTab} />}
          {activeTab === 'doacoes' && <AdminDonationsView />}
          {activeTab === 'ongs' && <AdminOngsView selectedONG={selectedONG} setSelectedONG={setSelectedONG} />}
          {activeTab === 'relatorios' && <AdminReportsView />}
          {activeTab === 'usuarios' && <AdminUsersView />}
          {activeTab === 'configuracoes' && <AdminSettingsView />}
        </div>
      </main>

    </div>
  );
}
