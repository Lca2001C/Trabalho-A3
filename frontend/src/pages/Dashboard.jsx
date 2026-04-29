import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Gift, 
  Trophy, 
  ShoppingBag, 
  FileText, 
  User, 
  LogOut,
  Leaf
} from 'lucide-react';
import { SidebarItem } from '../components/dashboard/SharedComponents';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import { 
  DonateTypeView, 
  DonateDetailsView, 
  DonatePickupView, 
  DonateReviewView, 
  FinancialDonateValueView, 
  FinancialDonatePaymentView,
  useDonationSubmit,
} from '../components/dashboard/DonationFlow';
import MarketplaceView from '../components/dashboard/MarketplaceView';
import RankingView from '../components/dashboard/RankingView';
import DonationsView from '../components/dashboard/DonationsView';
import ReceiptsView from '../components/dashboard/ReceiptsView';

// Estado inicial compartilhado pelo wizard de doação
const INITIAL_FORM = {
  // Item
  categoria: 'Roupas',
  descricao: '',
  conservacao: 'Usado - Em bom estado',
  cep: '',
  endereco: '',
  institutionId: null,   // ONG destinatária (item e financeiro)
  // Financeiro
  valor: 50,
  metodoPagamento: 'pix',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: usuario, logout, refreshUser } = useAuth();
  
  const [doacoes, setDoacoes] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [loadingDados, setLoadingDados] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [myPosition, setMyPosition] = useState('--');

  // Estado compartilhado entre todas as etapas do wizard
  const [formData, setFormData] = useState(INITIAL_FORM);

  const navigateTo = useCallback((view) => setCurrentView(view), []);

  // ── Callback chamado após doação bem-sucedida ──
  const handleDonationSuccess = useCallback(() => {
    setFormData(INITIAL_FORM); // reseta o wizard
    navigateTo('dashboard');
    // Rebusca as doações para atualizar o histórico e os pontos
    Promise.all([
      api.get('/api/donations'),
      refreshUser(),
    ]).then(([res]) => setDoacoes(res.data)).catch(() => {});
  }, [navigateTo, refreshUser]);

  // ── Hook de submissão (item) ──
  const itemSubmit = useDonationSubmit({ onSuccess: handleDonationSuccess });

  // ── Hook de submissão (financeiro) ──
  const financialSubmit = useDonationSubmit({ onSuccess: handleDonationSuccess });

  useEffect(() => {
    if (usuario?.role === 'ADMIN') { navigate('/admin/dashboard'); return; }
    if (usuario?.role === 'INSTITUTION') { navigate('/ong/dashboard'); return; }

    async function fetchData() {
      try {
        refreshUser();
        const [donationsRes, redemptionsRes, rankingRes] = await Promise.all([
          api.get('/api/donations'),
          api.get('/api/rewards/my-redemptions'),
          api.get('/api/rewards/ranking')
        ]);
        setDoacoes(donationsRes.data);
        setCupons(redemptionsRes.data);
        const rankData = rankingRes.data;
        const pos = rankData.myPosition?.pos || rankData.ranking?.find(r => r.isMe)?.pos || '--';
        setMyPosition(pos);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoadingDados(false);
      }
    }
    fetchData();
  }, [navigate]);

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    logout();
  };

  if (loadingDados) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Carregando painel...</div>;
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-2 text-green-700 cursor-pointer" onClick={() => navigate('/')}>
            <Leaf className="w-6 h-6 fill-current" />
            <span className="text-xl font-bold">ConectaBem</span>
          </div>
          <nav className="mt-2 px-4 space-y-1">
            <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
            <SidebarItem icon={<Gift />} label="Minhas doações" active={currentView === 'donations'} onClick={() => navigateTo('donations')} />
            <SidebarItem icon={<Trophy />} label="Ranking" active={currentView === 'ranking'} onClick={() => navigateTo('ranking')} />
            <SidebarItem icon={<ShoppingBag />} label="Marketplace" active={currentView === 'marketplace'} onClick={() => navigateTo('marketplace')} />
            <SidebarItem icon={<FileText />} label="Meus comprovantes" active={currentView === 'receipts'} onClick={() => navigateTo('receipts')} />
          </nav>
        </div>
        <div className="p-4 mb-4 space-y-1">
          <SidebarItem icon={<User />} label="Perfil" />
          <SidebarItem icon={<LogOut />} label="Sair" className="text-gray-400 hover:text-red-500" onClick={handleLogout} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {currentView === 'dashboard' && (
          <DashboardOverview
            onNewDonation={() => navigateTo('donate_type')}
            onViewRanking={() => navigateTo('ranking')}
            onViewAllDonations={() => navigateTo('donations')}
            usuario={usuario}
            doacoes={doacoes}
            cupons={cupons}
            myPosition={myPosition}
          />
        )}

        {/* ── Wizard de Doação de Item ── */}
        {currentView === 'donate_type' && (
          <DonateTypeView
            onBack={() => navigateTo('dashboard')}
            onSelectItems={() => navigateTo('donate_details')}
            onSelectFinancial={() => navigateTo('financial_value')}
          />
        )}
        {currentView === 'donate_details' && (
          <DonateDetailsView
            onBack={() => navigateTo('donate_type')}
            onNext={() => navigateTo('donate_pickup')}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentView === 'donate_pickup' && (
          <DonatePickupView
            onBack={() => navigateTo('donate_details')}
            onNext={() => navigateTo('donate_review')}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentView === 'donate_review' && (
          <DonateReviewView
            onBack={() => navigateTo('donate_pickup')}
            onConfirm={() => {
              const cepLimpo = formData.cep ? formData.cep.replace(/\D/g, '') : '';
              itemSubmit.submitDonation({
                tipo: 'item',
                item: `${formData.categoria}: ${formData.descricao} (CEP: ${cepLimpo}, Endereço: ${formData.endereco})`,
                ...(formData.institutionId && { institutionId: formData.institutionId }),
              });
            }}
            formData={formData}
            submitting={itemSubmit.submitting}
            feedback={itemSubmit.feedback}
          />
        )}

        {/* ── Wizard de Doação Financeira ── */}
        {currentView === 'financial_value' && (
          <FinancialDonateValueView
            onBack={() => navigateTo('donate_type')}
            onNext={() => navigateTo('financial_payment')}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentView === 'financial_payment' && (
          <FinancialDonatePaymentView
            onBack={() => navigateTo('financial_value')}
            onConfirm={() =>
              financialSubmit.submitDonation({
                tipo: 'financeira',
                valor: formData.valor,
                ...(formData.institutionId && { institutionId: formData.institutionId }),
              })
            }
            formData={formData}
            setFormData={setFormData}
            submitting={financialSubmit.submitting}
            feedback={financialSubmit.feedback}
          />
        )}

        {/* ── Outras Views ── */}
        {currentView === 'marketplace' && <MarketplaceView cupons={cupons} usuario={usuario} />}
        {currentView === 'ranking' && <RankingView />}
        {currentView === 'donations' && <DonationsView doacoes={doacoes} />}
        {currentView === 'receipts' && <ReceiptsView doacoes={doacoes} />}
      </main>
    </div>
  );
}
