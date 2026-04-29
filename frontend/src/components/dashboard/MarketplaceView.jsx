import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Car, Film, Music, Activity, ShoppingCart, Loader2 } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function MarketplaceView() {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/rewards')
      .then(res => setRewards(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (reward) => {
    if (user.pontos < reward.custoPontos) {
      Swal.fire({
        title: 'Saldo Insuficiente',
        text: `Você precisa de ${reward.custoPontos} pontos para resgatar este item.`,
        icon: 'error',
        confirmButtonColor: '#22a055'
      });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Confirmar resgate',
      text: `Deseja resgatar "${reward.nome}" por ${reward.custoPontos} pontos?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22a055',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, resgatar!',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api.post('/api/rewards/redeem', { rewardId: reward.id });
        await refreshUser(); // Atualiza saldo globalmente
        
        Swal.fire({
          title: 'Resgate Concluído!',
          html: `<p>${res.data.mensagem}</p><p class="mt-4 text-sm text-gray-500">Seu código:</p><div class="text-2xl font-mono font-bold text-green-700 tracking-widest mt-1 bg-green-50 p-3 rounded-lg border border-green-200">${res.data.codigo}</div>`,
          icon: 'success',
          confirmButtonColor: '#22a055'
        });
      } catch (err) {
        Swal.fire({
          title: 'Ops!',
          text: err.response?.data?.erro || 'Erro ao realizar resgate.',
          icon: 'error',
          confirmButtonColor: '#22a055'
        });
      }
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <ShoppingBag className="text-green-600" /> Marketplace <span className="text-gray-400 font-normal text-lg">(Recompensas)</span>
           </h1>
           <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" /> {user?.pontos || 0} pts
           </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {rewards.filter(r => r.ativo).map(reward => {
              // Identifica visualmente o item pelo nome
              const n = reward.nome.toLowerCase();
              let style = { isCash: false, icon: <ShoppingBag />, bg: 'bg-green-600 text-white', label: reward.nome.replace('Gift Card ', '').substring(0, 8) };
              
              if (n.includes('ifood')) style = { isCash: false, icon: <ShoppingCart />, bg: 'bg-red-500 text-white', label: 'iFood' };
              else if (n.includes('uber')) style = { isCash: false, icon: <Car />, bg: 'bg-black text-white', label: 'Uber' };
              else if (n.includes('netflix')) style = { isCash: false, icon: <Film />, bg: 'bg-red-600 text-white', label: 'Netflix' };
              else if (n.includes('spotify')) style = { isCash: false, icon: <Music />, bg: 'bg-green-500 text-white', label: 'Spotify' };
              else if (n.includes('centauro')) style = { isCash: false, icon: <Activity />, bg: 'bg-red-500 text-white', label: 'Centauro' };
              else if (n.includes('amazon')) style = { isCash: false, icon: <ShoppingCart />, bg: 'bg-gray-900 text-white', label: 'Amazon' };
              else if (reward.tipo === 'cash') style = { isCash: true, label: reward.nome.replace('Gift Card ConectaBem ', ''), color: 'text-green-600' };

              return (
                <div 
                  key={reward.id} 
                  onClick={() => handleRedeem(reward)}
                  className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-shadow cursor-pointer group bg-white"
                >
                   {style.isCash ? (
                     <div className={`text-4xl font-bold ${style.color} h-16 flex items-center text-center leading-tight`}>
                       {style.label}
                     </div>
                   ) : (
                     <div className={`w-24 h-16 rounded-xl flex items-center justify-center gap-2 font-bold text-lg ${style.bg}`}>
                       {style.icon} {style.label}
                     </div>
                   )}
                   <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full group-hover:bg-green-100 transition-colors">
                     {reward.custoPontos.toLocaleString('pt-BR')} pts
                   </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center">
           <a href="#" className="text-green-600 font-medium hover:underline">Ver todos os produtos</a>
        </div>
      </div>
    </div>
  );
}
