import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Gift, 
  Tag, 
  AlertCircle,
  Package,
  CircleDollarSign,
  Zap,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

export default function AdminMarketplaceView() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    custoPontos: 0,
    tipo: 'cupom',
    estoque: 0,
    preco: '',
    pontosBonus: '',
    imagemUrl: '',
    ativo: true
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/rewards');
      setRewards(res.data);
    } catch (err) {
      console.error('Erro ao buscar recompensas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (reward = null) => {
    if (reward) {
      setEditingReward(reward);
      setFormData({
        nome: reward.nome,
        descricao: reward.descricao || '',
        custoPontos: reward.custoPontos,
        tipo: reward.tipo,
        estoque: reward.estoque,
        preco: reward.preco || '',
        pontosBonus: reward.pontosBonus || '',
        imagemUrl: reward.imagemUrl || '',
        ativo: reward.ativo
      });
    } else {
      setEditingReward(null);
      setFormData({
        nome: '',
        descricao: '',
        custoPontos: 0,
        tipo: 'cupom',
        estoque: 0,
        preco: '',
        pontosBonus: '',
        imagemUrl: '',
        ativo: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReward) {
        await api.patch(`/api/admin/rewards/${editingReward.id}`, formData);
        Swal.fire('Sucesso', 'Produto atualizado com sucesso!', 'success');
      } else {
        await api.post('/api/admin/rewards', formData);
        Swal.fire('Sucesso', 'Produto cadastrado com sucesso!', 'success');
      }
      setShowModal(false);
      fetchRewards();
    } catch (err) {
      Swal.fire('Erro', err.response?.data?.erro || 'Erro ao salvar produto.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sim, excluir!'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/api/admin/rewards/${id}`);
        Swal.fire('Excluído!', 'O produto foi removido.', 'success');
        fetchRewards();
      } catch (err) {
        Swal.fire('Erro', 'Não foi possível excluir o produto.', 'error');
      }
    }
  };

  const filteredRewards = rewards.filter(r => 
    r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header com Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[22px] font-medium" style={{ color: 'var(--text-primary)' }}>Gestão do Marketplace</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Gerencie produtos para resgate com pontos ou compra direta.
          </p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-[10px] rounded-[10px] text-white text-[14px] font-medium transition-all shadow-lg shadow-emerald-100"
          style={{ backgroundColor: 'var(--green-primary)' }}
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-[10px] rounded-[12px] border text-[13px] outline-none transition-all focus:ring-2 focus:ring-emerald-500/10"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <button className="p-[10px] rounded-[12px] border flex items-center justify-center transition-all hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: 'var(--border)' }}>
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Tabela de Produtos */}
      <div className="card-base overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Produto</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tipo / Categoria</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Custo / Preço</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Estoque</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-6 h-16 bg-[var(--bg-primary)] opacity-50" />
                </tr>
              ))
            ) : filteredRewards.length > 0 ? (
              filteredRewards.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--bg-secondary)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border)] shadow-sm">
                        {r.imagemUrl ? (
                          <img src={r.imagemUrl} alt={r.nome} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">
                            {r.tipo === 'cupom' ? '🏷️' : r.tipo === 'digital' ? '📖' : r.tipo === 'artesanato' ? '🏺' : '🎁'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{r.nome}</div>
                        <div className="text-[11px] max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }}>{r.descricao}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase"
                          style={{ backgroundColor: 'var(--green-light)', color: 'var(--green-dark)' }}>
                      {r.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.preco > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>R$ {r.preco.toFixed(2)}</span>
                        <span className="text-[10px] font-bold" style={{ color: 'var(--green-dark)' }}>+ {r.pontosBonus} pts</span>
                      </div>
                    ) : (
                      <span className="text-[14px] font-medium" style={{ color: 'var(--green-primary)' }}>{r.custoPontos} pts</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{r.estoque} un.</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {r.ativo ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="text-[12px] font-medium text-emerald-600">Ativo</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="text-gray-400" />
                          <span className="text-[12px] font-medium text-gray-500">Inativo</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(r)}
                        className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <div className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Nenhum produto encontrado.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          
          <div className="relative w-full max-w-[500px] card-base bg-[var(--bg-primary)] p-0 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {editingReward ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors">
                <XCircle size={20} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>Nome do Produto</label>
                  <input 
                    required
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: Cupom de Desconto"
                    className="w-full px-4 py-[9px] rounded-lg border text-[13px] outline-none focus:border-emerald-500"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>Descrição</label>
                  <textarea 
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Detalhes do produto..."
                    className="w-full px-4 py-[9px] rounded-lg border text-[13px] outline-none focus:border-emerald-500 min-h-[80px]"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[12px] font-medium flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>URL da Imagem</span>
                    <span className="text-[10px] font-normal opacity-60">Sugestão: Unsplash ou link público</span>
                  </label>
                  <input 
                    type="text"
                    value={formData.imagemUrl}
                    onChange={(e) => setFormData({...formData, imagemUrl: e.target.value})}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-[9px] rounded-lg border text-[13px] outline-none focus:border-emerald-500"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
                  <select 
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full px-4 py-[9px] rounded-lg border text-[13px] outline-none focus:border-emerald-500"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="cupom">Cupom</option>
                    <option value="giftcard">Gift Card</option>
                    <option value="brinde">Brinde Físico</option>
                    <option value="experiencia">Experiência</option>
                    <option value="artesanato">Artesanato</option>
                    <option value="digital">Produto Digital</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>Estoque Inicial</label>
                  <input 
                    type="number"
                    value={formData.estoque}
                    onChange={(e) => setFormData({...formData, estoque: e.target.value})}
                    className="w-full px-4 py-[9px] rounded-lg border text-[13px] outline-none focus:border-emerald-500"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="col-span-2 pt-2 pb-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-[1px] flex-1" style={{ backgroundColor: 'var(--border)' }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Valores e Pontos</span>
                    <div className="h-[1px] flex-1" style={{ backgroundColor: 'var(--border)' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>Custo em Pontos</span>
                    <span className="text-[10px] font-normal opacity-60">Sugestão: 10 pts por R$ 1</span>
                  </label>
                  <input 
                    type="number"
                    value={formData.custoPontos}
                    onChange={(e) => setFormData({...formData, custoPontos: e.target.value, preco: ''})}
                    className="w-full px-4 py-[9px] rounded-lg border text-[13px] outline-none focus:border-emerald-500"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>Preço R$</span>
                    <span className="text-[10px] font-normal opacity-60">Sugestão: Valor de mercado</span>
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value, custoPontos: 0})}
                    placeholder="0.00"
                    className="w-full px-4 py-[9px] rounded-lg border text-[13px] outline-none focus:border-emerald-500"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                {formData.preco > 0 && (
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>Pontos de Bônus ao Comprar</label>
                    <input 
                      type="number"
                      value={formData.pontosBonus}
                      onChange={(e) => setFormData({...formData, pontosBonus: e.target.value})}
                      placeholder="Quantos pontos o usuário ganha?"
                      className="w-full px-4 py-[9px] rounded-lg border text-[13px] outline-none focus:border-emerald-500"
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                )}

                <div className="col-span-2 flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                    className="w-4 h-4 rounded border-emerald-500 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="ativo" className="text-[13px]" style={{ color: 'var(--text-primary)' }}>Produto Ativo no Marketplace</label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border font-medium text-[13px] transition-all hover:bg-[var(--bg-secondary)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-2.5 rounded-lg text-white font-medium text-[13px] transition-all shadow-lg shadow-emerald-200"
                  style={{ backgroundColor: 'var(--green-primary)' }}
                >
                  {editingReward ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
