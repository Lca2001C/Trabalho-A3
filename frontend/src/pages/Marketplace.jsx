import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Coins, 
  Ticket, 
  Gift, 
  Utensils, 
  Gamepad2, 
  Pill, 
  Car, 
  Music, 
  Beer 
} from 'lucide-react';

export default function Marketplace() {
  const navigate = useNavigate();
  const { user: usuario, refreshUser } = useAuth();

  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarketplace() {
      try {
        const rewardsRes = await api.get('/api/rewards');
        setRecompensas(rewardsRes.data);
      } catch (error) {
        console.error('Erro ao carregar marketplace:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMarketplace();
  }, []);

  const handleResgatar = async (recompensa) => {
    // 1. Pop-up de Confirmação com Loading Integrado
    const result = await Swal.fire({
      title: 'Resgatar Recompensa?',
      text: `Você deseja trocar ${recompensa.custoPontos} pontos por "${recompensa.nome}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, Resgatar!',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb', // blue-600
      cancelButtonColor: '#4b5563',  // gray-600
      background: '#1e293b',         // slate-800
      color: '#f8fafc',              // slate-50
      showLoaderOnConfirm: true,
      customClass: {
        popup: 'rounded-2xl border border-slate-700 shadow-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-bold',
        cancelButton: 'rounded-xl px-6 py-2.5 font-bold'
      },
      preConfirm: async () => {
        try {
          const res = await api.post('/api/rewards/redeem', { rewardId: recompensa.id });
          return res.data;
        } catch (error) {
          Swal.showValidationMessage(
            error.response?.data?.erro || 'ops! Ocorreu um erro inesperado. Tente novamente.'
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed && result.value) {
      // 2. Pop-up de Sucesso com o Código em Destaque
      await Swal.fire({
        title: 'Resgate Concluído!',
        html: `
          <p style="margin-bottom: 15px; color: #cbd5e1; font-size: 15px;">Aqui está o seu código de resgate. Copie-o abaixo:</p>
          <div style="background: #0f172a; padding: 16px; border-radius: 12px; border: 2px dashed #475569; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-family: monospace; font-size: 1.5rem; font-weight: 800; letter-spacing: 2px; color: #60a5fa;">
              ${result.value.codigo}
            </span>
          </div>
          <p style="margin-top: 15px; font-size: 0.875rem; color: #94a3b8;">${result.value.mensagem}</p>
        `,
        icon: 'success',
        confirmButtonText: 'Incrível!',
        confirmButtonColor: '#2563eb', // blue-600 (Cor da marca)
        background: '#1e293b',
        color: '#f8fafc',
        customClass: {
          popup: 'rounded-3xl border border-slate-700 shadow-2xl',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-lg w-full max-w-xs'
        }
      });
      
      // Atualiza saldo do usuário e navega para o dashboard (SPA, sem reload)
      await refreshUser();
      navigate('/dashboard');
    }
  };

  // Helper simples para associar visual com base no nome do item
  const getVisuals = (nome) => {
    const n = nome.toLowerCase();
    if (n.includes('ifood')) return { icone: <Utensils size={32} className="text-orange-500" />, bgIcone: 'bg-orange-50' };
    if (n.includes('steam') || n.includes('xbox')) return { icone: <Gamepad2 size={32} className="text-blue-500" />, bgIcone: 'bg-blue-50' };
    if (n.includes('farmácia') || n.includes('saúde')) return { icone: <Pill size={32} className="text-red-500" />, bgIcone: 'bg-red-50' };
    if (n.includes('uber') || n.includes('99')) return { icone: <Car size={32} className="text-gray-700" />, bgIcone: 'bg-gray-100' };
    if (n.includes('spotify') || n.includes('deezer')) return { icone: <Music size={32} className="text-green-500" />, bgIcone: 'bg-green-50' };
    if (n.includes('zé delivery')) return { icone: <Beer size={32} className="text-yellow-600" />, bgIcone: 'bg-yellow-50' };
    
    // Fallback padrão
    return { icone: <Ticket size={32} className="text-indigo-500" />, bgIcone: 'bg-indigo-50' };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      
      {/* ── Cabeçalho (Navbar simples) ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center p-2 mr-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Voltar para o Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Marketplace de Recompensas
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* ── Banner de Saldo ── */}
        <div className="bg-blue-600 rounded-3xl p-8 mb-10 shadow-lg text-white flex flex-col sm:flex-row items-center sm:justify-between relative overflow-hidden">
          {/* Fundo decorativo */}
          <div className="absolute -right-10 -top-10 opacity-10">
            <Coins size={200} />
          </div>
          
          <div className="relative z-10 flex items-center mb-4 sm:mb-0">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm mr-5">
              <Coins size={32} className="text-white" />
            </div>
            <div>
              <p className="text-blue-100 mb-1 font-medium text-sm sm:text-base">Saldo Atual</p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Você tem {usuario?.pontos || 0} pontos <span className="text-blue-200 font-medium text-xl sm:text-2xl">disponíveis</span>
              </h2>
            </div>
          </div>
        </div>

        {/* ── Grid de Recompensas ── */}
        {loading ? (
          <div className="text-center text-gray-500 py-10">
            Carregando recompensas disponíveis...
          </div>
        ) : recompensas.length === 0 ? (
          <div className="text-center text-gray-500 py-10 font-medium">
            Nenhuma recompensa disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recompensas.map((item) => {
              const { icone, bgIcone } = getVisuals(item.nome);
              return (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
                  
                  {/* Ícone & Nome */}
                  <div className="flex items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 mr-4 ${bgIcone}`}>
                      {icone}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight mb-1">{item.nome}</h3>
                      
                      {/* Badge de Custo */}
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.custoPontos} pts
                      </div>
                    </div>
                  </div>

                  {/* Descrição Curta */}
                  <p className="text-sm text-gray-500 flex-grow mb-4">
                    {item.descricao}
                  </p>

                  {/* Info Adicional (Estoque) */}
                  <div className="mb-6 flex items-center justify-between text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1">
                      <Ticket size={14} className="text-gray-400" />
                      {item.estoque > 0 ? `${item.estoque} disponíveis` : 'Esgotado'}
                    </span>
                  </div>

                  {/* Botão de Regaste */}
                  <button
                    onClick={() => handleResgatar(item)}
                    disabled={item.estoque <= 0}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white transition-colors mt-auto focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      item.estoque > 0 
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {item.estoque > 0 ? 'Resgatar Recompensa' : 'Esgotado'}
                  </button>
                  
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
