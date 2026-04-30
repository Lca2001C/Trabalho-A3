import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Star, 
  Clock, 
  Heart, 
  ChevronRight, 
  X, 
  Zap, 
  Lock,
  CheckCircle2,
  Trophy,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Swal from 'sweetalert2';

// ─── DADOS MOCK ──────────────────────────────────────────────────────────────
const mockProducts = [
  // ABA: Resgatar com Pontos
  { 
    id: 1, 
    nome: '10% OFF em Loja Sustentável', 
    fornecedor: 'EcoParceiro', 
    categoria: 'Cupons', 
    tipo: 'pontos', 
    custo: 150, 
    impacto: 'Reduz o consumo de plástico', 
    imgEmoji: '🏷️', 
    desc: 'Cupom válido para qualquer produto no site da EcoParceiro. Promova o consumo consciente.' 
  },
  { 
    id: 2, 
    nome: 'Ingresso de Cinema (2D)', 
    fornecedor: 'CineImpacto', 
    categoria: 'Experiências', 
    tipo: 'pontos', 
    custo: 800, 
    nivelMinimo: 'Prata', 
    impacto: 'Apoia a cultura local', 
    imgEmoji: '🎬', 
    desc: 'Válido para qualquer sessão 2D em cinemas parceiros de segunda a quinta-feira.' 
  },
  { 
    id: 3, 
    nome: 'Ecobag Algodão Orgânico', 
    fornecedor: 'ONG ConectaBem', 
    categoria: 'Brindes', 
    tipo: 'pontos', 
    custo: 1200, 
    nivelMinimo: 'Prata', 
    impacto: 'Substitui 500 sacolas plásticas', 
    imgEmoji: '🛍️', 
    desc: 'Ecobag resistente feita à mão por comunidades apoiadas pela nossa rede.',
    ofertaRelampago: true,
    expiresAt: Date.now() + 86400000 // +24h
  },
  { 
    id: 4, 
    nome: 'Selo "Doador do Mês"', 
    fornecedor: 'Plataforma', 
    categoria: 'Destaque Social', 
    tipo: 'pontos', 
    custo: 200, 
    impacto: 'Inspira novos doadores', 
    imgEmoji: '🏅', 
    desc: 'Um selo exclusivo que aparecerá no seu perfil público por 30 dias.' 
  },
  { 
    id: 5, 
    nome: 'Certificado de Impacto Ambiental', 
    fornecedor: 'ConectaBem', 
    categoria: 'Certificados', 
    tipo: 'pontos', 
    custo: 50, 
    impacto: 'Reconhecimento oficial', 
    imgEmoji: '📜', 
    desc: 'Documento digital que certifica sua contribuição direta para as causas ambientais.' 
  },

  // ABA: Comprar e Apoiar
  { 
    id: 6, 
    nome: 'Vaso de Cerâmica Artesanal', 
    fornecedor: 'Artesãos do Bem', 
    categoria: 'Artesanato', 
    tipo: 'compra', 
    custo: 49.90, 
    bonus_pts: 50, 
    impacto: 'Gera renda para 2 famílias', 
    imgEmoji: '🏺', 
    desc: 'Peça única produzida manualmente através de técnicas ancestrais.' 
  },
  { 
    id: 7, 
    nome: 'E-book: Receitas Sociais', 
    fornecedor: 'ONG Cozinha Solidária', 
    categoria: 'Digital', 
    tipo: 'compra', 
    custo: 19.90, 
    bonus_pts: 20, 
    impacto: 'Alimenta 5 crianças hoje', 
    imgEmoji: '📖', 
    desc: 'Aprenda receitas incríveis enquanto ajuda a financiar cozinhas comunitárias.' 
  },
  { 
    id: 8, 
    nome: 'Adote uma muda de árvore', 
    fornecedor: 'Refloresta Brasil', 
    categoria: 'Simbólico', 
    tipo: 'compra', 
    custo: 15.00, 
    bonus_pts: 30, 
    impacto: 'Planta 1 árvore nativa', 
    imgEmoji: '🌳', 
    desc: 'Sua doação simbólica cobre o custo de plantio e manutenção de uma nova muda.' 
  }
];

import api from '../../services/api';

export default function MarketplaceView({ cupons, usuario, refreshUser }) {
  const { user } = useAuth(); // Fallback if prop not provided
  const currentUser = usuario || user;
  
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pontos'); // 'pontos' ou 'compra'
  const [filter, setFilter] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Busca recompensas reais do backend
  useEffect(() => {
    async function fetchRewards() {
      try {
        setLoading(true);
        const res = await api.get('/api/rewards');
        const categoryMap = {
          cupom: 'Cupons',
          giftcard: 'Gift Cards',
          brinde: 'Brindes',
          experiencia: 'Experiências',
          certificado: 'Certificados',
          artesanato: 'Artesanato',
          digital: 'Digital',
          simbolico: 'Simbólico'
        };

        const backendRewards = res.data.map(r => ({
          id: r.id,
          nome: r.nome,
          fornecedor: 'Parceiro ConectaBem',
          categoria: categoryMap[r.tipo] || (r.tipo.charAt(0).toUpperCase() + r.tipo.slice(1)),
          tipo: r.preco > 0 ? 'compra' : 'pontos',
          custo: r.preco > 0 ? r.preco : r.custoPontos,
          bonus_pts: r.pontosBonus,
          impacto: 'Gera impacto positivo direto',
          imgEmoji: r.tipo === 'cupom' ? '🏷️' : r.tipo === 'digital' ? '📖' : r.tipo === 'artesanato' ? '🏺' : '🎁',
          imagemUrl: r.imagemUrl,
          desc: r.descricao,
          estoque: r.estoque
        }));

        setRewards(backendRewards);
      } catch (err) {
        console.error('Erro ao buscar recompensas:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRewards();
  }, []);

  // Lógica do contador regressivo (simulado)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const expiresAt = now + 3600000; // Simula expiração em 1h
      const diff = expiresAt - now;
      
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pills = activeTab === 'pontos' 
    ? ['Todos', 'Cupons', 'Gift Cards', 'Brindes', 'Experiências', 'Certificados']
    : ['Todos', 'Artesanato', 'Digital', 'Brindes', 'Simbólico'];

  const filteredProducts = rewards.filter(p => 
    p.tipo === activeTab && (filter === 'Todos' || p.categoria === filter)
  );

  const handleAction = async (product) => {
    if (activeTab === 'pontos') {
      if (currentUser.pontos < product.custo) {
        Swal.fire({ title: 'Saldo Insuficiente', text: 'Você ainda não tem pontos suficientes.', icon: 'error' });
        return;
      }
      
      const confirm = await Swal.fire({
        title: 'Confirmar Resgate',
        text: `Deseja trocar ${product.custo} pontos por "${product.nome}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: 'var(--green-primary)',
        confirmButtonText: 'Sim, resgatar!'
      });

      if (confirm.isConfirmed) {
        try {
          const res = await api.post('/api/rewards/redeem', { rewardId: product.id });
          await Swal.fire({
            title: 'Resgatado!',
            html: `Sua recompensa já está disponível!<br/>Código: <b>${res.data.codigo}</b>`,
            icon: 'success'
          });
          setSelectedProduct(null);
          if (refreshUser) refreshUser(); // Atualiza os pontos no layout
        } catch (err) {
          Swal.fire('Erro', err.response?.data?.erro || 'Erro ao processar resgate.', 'error');
        }
      }
    } else {
      // Abre o modal de checkout simulado
      setSelectedProduct(product);
      setShowCheckout(true);
    }
  };

  const handleFinishPurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowCheckout(false);
      setSelectedProduct(null);
      Swal.fire({
        title: 'Compra Confirmada!',
        text: 'Seu pagamento foi aprovado. Seus pontos de bônus foram creditados!',
        icon: 'success',
        confirmButtonColor: 'var(--green-primary)'
      });
      if (refreshUser) refreshUser();
    }, 2500);
  };

  const getUserLevel = (pts) => {
    if (pts < 500) return 'Bronze';
    if (pts < 2000) return 'Prata';
    if (pts < 5000) return 'Ouro';
    return 'Diamante';
  };

  const userLevel = getUserLevel(currentUser?.pontos || 0);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER DO MARKETPLACE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[22px] font-medium" style={{ color: 'var(--text-primary)' }}>Marketplace</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Use seus pontos ou compre produtos de impacto social.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-[10px] rounded-[10px]"
             style={{ backgroundColor: 'var(--green-light)' }}>
          <Trophy size={18} className="text-[var(--green-dark)]" />
          <span className="text-[15px] font-medium" style={{ color: 'var(--green-text)' }}>
            Seu saldo: <span className="font-bold">{currentUser?.pontos || 0} pts</span>
          </span>
        </div>
      </div>

      {/* ABAS */}
      <div className="flex gap-8 border-b mb-8" style={{ borderColor: 'var(--border)' }}>
        <button 
          onClick={() => { setActiveTab('pontos'); setFilter('Todos'); }}
          className="pb-3 text-[14px] font-medium transition-all relative"
          style={{ color: activeTab === 'pontos' ? 'var(--green-primary)' : 'var(--text-secondary)' }}
        >
          Resgatar com Pontos
          {activeTab === 'pontos' && <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{ backgroundColor: 'var(--green-primary)' }} />}
        </button>
        <button 
          onClick={() => { setActiveTab('compra'); setFilter('Todos'); }}
          className="pb-3 text-[14px] font-medium transition-all relative"
          style={{ color: activeTab === 'compra' ? 'var(--green-primary)' : 'var(--text-secondary)' }}
        >
          Comprar e Apoiar
          {activeTab === 'compra' && <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{ backgroundColor: 'var(--green-primary)' }} />}
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-2 mb-8">
        {pills.map(p => (
          <button 
            key={p}
            onClick={() => setFilter(p)}
            className="px-[14px] py-[6px] rounded-full text-[12px] font-medium transition-all border"
            style={{ 
              backgroundColor: filter === p ? 'var(--green-primary)' : 'var(--bg-secondary)',
              color: filter === p ? '#ffffff' : 'var(--text-secondary)',
              borderColor: filter === p ? 'var(--green-primary)' : 'var(--border)'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* GRID DE PRODUTOS */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p, idx) => {
            const isLocked = p.nivelMinimo && userLevel === 'Bronze' && p.nivelMinimo !== 'Bronze';
            const canAfford = activeTab === 'pontos' ? user?.pontos >= p.custo : true;

            return (
              <div 
                key={p.id}
                onClick={() => !isLocked && setSelectedProduct(p)}
                className="card-base group overflow-hidden cursor-pointer flex flex-col hover:shadow-lg transition-all"
                style={{ 
                  animation: `fadeIn 0.2s ease-out forwards ${idx * 40}ms`,
                  opacity: 0,
                  transform: 'translateY(8px)'
                }}
              >
                {/* Imagem / Banner */}
                <div className="h-[140px] relative overflow-hidden bg-[var(--bg-secondary)] flex items-center justify-center">
                  {p.imgEmoji && !p.imagemUrl && <span className="text-5xl">{p.imgEmoji}</span>}
                  {p.imagemUrl && (
                    <img 
                      src={p.imagemUrl} 
                      alt={p.nome} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  )}
                  
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase"
                       style={{ backgroundColor: 'var(--green-primary)' }}>
                    {p.categoria}
                  </div>

                  {p.nivelMinimo && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold"
                         style={{ backgroundColor: 'var(--amber-light)', color: 'var(--amber-text)' }}>
                      Nível {p.nivelMinimo}
                    </div>
                  )}

                  {p.ofertaRelampago && (
                    <div className="absolute top-0 left-0 w-full text-center py-1 text-[11px] font-bold text-white"
                         style={{ backgroundColor: 'var(--coral-text)' }}>
                      ⚡ Oferta relâmpago
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-[14px] flex-1 flex flex-col">
                  <div className="flex flex-col gap-1 mb-2">
                    <h3 className="text-[14px] font-medium leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      {p.nome}
                    </h3>
                    <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      por {p.fornecedor}
                    </span>
                  </div>

                  <p className="text-[12px] line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {p.desc}
                  </p>

                  <div className="mt-auto flex items-center gap-2 text-[11px] font-medium" style={{ color: 'var(--green-dark)' }}>
                    <Heart size={12} className="fill-current" />
                    {p.impacto}
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div className="p-[14px] pt-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    {activeTab === 'pontos' ? (
                      <span className="text-[16px] font-medium" style={{ color: 'var(--green-primary)' }}>
                        {p.custo} pts
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>
                          R$ {p.custo.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: 'var(--green-dark)' }}>
                          + {p.bonus_pts} pts
                        </span>
                      </div>
                    )}
                    {p.ofertaRelampago && (
                      <div className="text-[11px] font-bold text-red-500 mt-0.5">
                        {timeLeft}
                      </div>
                    )}
                  </div>

                  <button 
                    disabled={!canAfford}
                    className="px-[14px] py-[7px] rounded-lg text-[12px] font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--green-primary)' }}
                  >
                    {activeTab === 'pontos' ? 'Resgatar' : 'Comprar'}
                  </button>
                </div>

                {/* Overlay de Bloqueio por Nível */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 z-10 transition-opacity">
                    <Lock size={24} className="text-white mb-2" />
                    <span className="text-white text-[13px] font-bold">Desbloqueie no nível {p.nivelMinimo}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Nenhum item nesta categoria ainda</h3>
          <button 
            onClick={() => setFilter('Todos')}
            className="mt-4 text-[13px] font-medium" 
            style={{ color: 'var(--green-primary)' }}
          >
            Ver todos os itens
          </button>
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          
          <div className="relative w-full max-w-[480px] card-base bg-[var(--bg-primary)] p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <X size={20} style={{ color: 'var(--text-muted)' }} />
            </button>

            <div className="h-[200px] rounded-xl mb-6 overflow-hidden flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border)]">
              {selectedProduct.imagemUrl ? (
                <img src={selectedProduct.imagemUrl} alt={selectedProduct.nome} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl">{selectedProduct.imgEmoji}</span>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-[2px] rounded text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: 'var(--green-primary)' }}>
                  {selectedProduct.categoria}
                </span>
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  por {selectedProduct.fornecedor}
                </span>
              </div>
              <h2 className="text-[20px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {selectedProduct.nome}
              </h2>
            </div>

            <p className="text-[14px] leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              {selectedProduct.desc}
            </p>

            <div className="p-4 rounded-xl mb-8 flex items-start gap-3"
                 style={{ backgroundColor: 'var(--green-light)', border: '0.5px solid var(--green-dark)', borderOpacity: 0.1 }}>
              <Heart size={18} className="text-[var(--green-dark)] mt-0.5" />
              <div>
                <span className="text-[13px] font-bold block" style={{ color: 'var(--green-text)' }}>Seu Impacto</span>
                <span className="text-[13px]" style={{ color: 'var(--green-text)' }}>{selectedProduct.impacto}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-3 rounded-xl border font-medium text-[14px] transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleAction(selectedProduct)}
                className="flex-[2] py-3 rounded-xl text-white font-medium text-[14px] transition-all shadow-lg shadow-emerald-200"
                style={{ backgroundColor: 'var(--green-primary)' }}
              >
                {selectedProduct.tipo === 'pontos' ? `Resgatar por ${selectedProduct.custo} pts` : `Comprar por R$ ${selectedProduct.custo.toFixed(2)}`}
              </button>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                ⭐ 128 pessoas já resgataram este item
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CHECKOUT SIMULADO */}
      {showCheckout && selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isProcessing && setShowCheckout(false)} />
          
          <div className="relative w-full max-w-[400px] card-base bg-[var(--bg-primary)] p-0 overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="p-6 text-center border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>Finalizar Apoio</h3>
              <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Escaneie o QR Code para pagar com PIX</p>
            </div>

            <div className="p-8 flex flex-col items-center">
              <div className="relative w-48 h-48 bg-white p-3 rounded-2xl shadow-inner mb-6 border-2 border-emerald-500/20">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ConectaBemPurchase_${selectedProduct.id}`} 
                  alt="QR Code PIX"
                  className={`w-full h-full transition-opacity duration-300 ${isProcessing ? 'opacity-20' : 'opacity-100'}`}
                />
                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <span className="text-[12px] font-bold text-emerald-600">Processando...</span>
                  </div>
                )}
              </div>

              <div className="w-full space-y-3 mb-6">
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>Produto:</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedProduct.nome}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-secondary)' }}>Valor:</span>
                  <span className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>R$ {selectedProduct.custo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <span className="text-emerald-700">Você ganhará:</span>
                  <span className="font-bold text-emerald-700">+{selectedProduct.bonus_pts} pontos</span>
                </div>
              </div>

              <button 
                onClick={handleFinishPurchase}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl text-white font-bold text-[14px] transition-all bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                {isProcessing ? 'Aguardando Pagamento...' : 'Simular Pagamento Confirmado'}
              </button>
              
              <button 
                onClick={() => setShowCheckout(false)}
                disabled={isProcessing}
                className="mt-4 text-[12px] font-medium opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS para animação fadeIn */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Icone Loader localmente se não importado
function Loader2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
