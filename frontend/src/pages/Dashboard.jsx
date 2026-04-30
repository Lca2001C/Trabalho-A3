import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Novos componentes de layout e UI
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import DashboardOverviewV2 from '../components/dashboard/DashboardOverviewV2';
import ProfileView from '../components/dashboard/ProfileView';

// Componentes existentes do Wizard e outras Views
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
  categoria: 'Roupas',
  descricao: '',
  conservacao: 'Usado - Em bom estado',
  cep: '',
  endereco: '',
  institutionId: null,
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
  const [formData, setFormData] = useState(INITIAL_FORM);

  const navigateTo = useCallback((view) => setCurrentView(view), []);

  const handleDonationSuccess = useCallback(() => {
    setFormData(INITIAL_FORM);
    navigateTo('dashboard');
    Promise.all([
      api.get('/api/donations'),
      refreshUser(),
    ]).then(([res]) => setDoacoes(res.data)).catch(() => {});
  }, [navigateTo, refreshUser]);

  const itemSubmit = useDonationSubmit({ onSuccess: handleDonationSuccess });
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

  if (loadingDados) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-secondary)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--green-primary)] opacity-20" />
          <span className="text-sm font-medium text-[var(--text-muted)]">Carregando painel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-secondary)] overflow-x-hidden">
      
      {/* Sidebar Redesenhada */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={navigateTo} 
        onLogout={logout} 
      />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col md:ml-[210px] transition-all duration-300">
        
        {/* Topbar Redesenhada */}
        <Topbar 
          usuario={usuario} 
          onNewDonation={() => navigateTo('donate_type')} 
          onProfileClick={() => navigateTo('profile')}
        />

        {/* Views Dinâmicas */}
        <main className="px-8 pb-10">
          
          {currentView === 'dashboard' && (
            <DashboardOverviewV2
              usuario={usuario}
              doacoes={doacoes}
              cupons={cupons}
              myPosition={myPosition}
              onNewDonation={() => navigateTo('donate_type')}
              onViewRanking={() => navigateTo('ranking')}
              onViewAllDonations={() => navigateTo('donations')}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView 
              usuario={usuario} 
              onUpdate={refreshUser} 
            />
          )}

          {/* ── Wizard de Doação (Pode ser melhorado visualmente depois) ── */}
          {currentView === 'donate_type' && (
            <div className="max-w-3xl mx-auto pt-6">
              <DonateTypeView
                onBack={() => navigateTo('dashboard')}
                onSelectItems={() => navigateTo('donate_details')}
                onSelectFinancial={() => navigateTo('financial_value')}
              />
            </div>
          )}
          {currentView === 'donate_details' && (
            <div className="max-w-3xl mx-auto pt-6">
              <DonateDetailsView
                onBack={() => navigateTo('donate_type')}
                onNext={() => navigateTo('donate_pickup')}
                formData={formData}
                setFormData={setFormData}
              />
            </div>
          )}
          {currentView === 'donate_pickup' && (
            <div className="max-w-3xl mx-auto pt-6">
              <DonatePickupView
                onBack={() => navigateTo('donate_details')}
                onNext={() => navigateTo('donate_review')}
                formData={formData}
                setFormData={setFormData}
              />
            </div>
          )}
          {currentView === 'donate_review' && (
            <div className="max-w-3xl mx-auto pt-6">
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
            </div>
          )}

          {/* ── Wizard Financeiro ── */}
          {currentView === 'financial_value' && (
            <div className="max-w-3xl mx-auto pt-6">
              <FinancialDonateValueView
                onBack={() => navigateTo('donate_type')}
                onNext={() => navigateTo('financial_payment')}
                formData={formData}
                setFormData={setFormData}
              />
            </div>
          )}
          {currentView === 'financial_payment' && (
            <div className="max-w-3xl mx-auto pt-6">
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
            </div>
          )}

          {/* ── Outras Views ── */}
          {currentView === 'marketplace' && <MarketplaceView cupons={cupons} usuario={usuario} />}
          {currentView === 'ranking' && <RankingView />}
          {currentView === 'donations' && <DonationsView doacoes={doacoes} />}
          {currentView === 'receipts' && <ReceiptsView doacoes={doacoes} />}
        </main>
      </div>
    </div>
  );
}
