import React, { useState, useEffect } from 'react';
import { HeartHandshake, QrCode, CreditCard, Receipt, CircleDollarSign, Search, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function OngDonationsView() {
  const [donationFilter, setDonationFilter] = useState('Todos');
  const [donationSearch, setDonationSearch] = useState('');
  const [donationsList, setDonationsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = () => {
    setLoading(true);
    api.get('/api/donations/institution/received')
      .then(res => setDonationsList(res.data.doacoes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleConfirmReceipt = async (id) => {
    try {
      await api.post(`/api/donations/${id}/confirm`);
      fetchDonations();
    } catch (err) {
      console.error('Erro ao confirmar recebimento');
    }
  };

  const filteredDonations = donationsList.filter(donation => {
    if (donation.tipo === 'financeira' && (donation.valor || 0) < 0) return false;
    const matchesFilter = donationFilter === 'Todos' || donation.tipo === donationFilter.toLowerCase();
    const donorName = donation.user?.nome || 'Anônimo';
    const matchesSearch = donorName.toLowerCase().includes(donationSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalAmount = filteredDonations.reduce((acc, curr) => curr.tipo === 'financeira' ? acc + (curr.valor || 0) : acc, 0);
  const pixCount = donationsList.filter(d => d.tipo === 'financeira' && (d.valor || 0) > 0).length;
  const itemCount = donationsList.filter(d => d.tipo === 'item').length;

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>Doações Recebidas ❤️</h2>
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>Acompanhe o impacto da generosidade dos seus doadores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base p-6 flex flex-col gap-1" style={{ backgroundColor: 'var(--green-light)', borderColor: 'var(--green-primary)', borderWidth: '1px' }}>
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--green-dark)' }}>Total Financeiro (Filtrado)</p>
          <h3 className="text-[28px] font-bold" style={{ color: 'var(--green-text)' }}>{loading ? '...' : formatCurrency(totalAmount)}</h3>
        </div>
        <div className="card-base p-6 flex flex-col gap-1">
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Doações Financeiras</p>
          <h3 className="text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>{loading ? '...' : pixCount}</h3>
        </div>
        <div className="card-base p-6 flex flex-col gap-1">
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Itens / Diversos</p>
          <h3 className="text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>{loading ? '...' : itemCount}</h3>
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-xl w-full md:w-auto">
            {['Todos', 'Financeira', 'Item'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setDonationFilter(tab)}
                className={`px-6 py-2 text-[13px] font-bold rounded-lg transition-all flex-1 md:flex-none ${
                  donationFilter === tab 
                    ? 'bg-[var(--bg-primary)] shadow-sm' 
                    : 'opacity-50 hover:opacity-100'
                }`}
                style={{ color: donationFilter === tab ? 'var(--green-primary)' : 'var(--text-secondary)' }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar doador..." 
              value={donationSearch}
              onChange={(e) => setDonationSearch(e.target.value)}
              className="w-full h-[44px] pl-11 pr-4 rounded-xl text-[14px] font-medium outline-none border transition-all focus:ring-2 focus:ring-green-500"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Doador</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Conteúdo</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Tipo</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Data</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)' }}>Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--green-primary)' }} /></td>
                </tr>
              ) : filteredDonations.length > 0 ? (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{donation.user?.nome || 'Anônimo'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[14px] font-bold" style={{ color: donation.tipo === 'financeira' ? 'var(--green-text)' : 'var(--text-primary)' }}>
                        {donation.tipo === 'financeira' ? formatCurrency(donation.valor) : donation.item}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {donation.tipo === 'financeira' ? <QrCode size={16} /> : <Package size={16} />}
                        <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{donation.tipo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        {new Date(donation.criadoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: donation.status === 'entregue' ? 'var(--green-primary)' : 'var(--amber-text)' }} />
                        <span className="text-[13px] font-bold" style={{ color: donation.status === 'entregue' ? 'var(--green-text)' : 'var(--amber-text)' }}>
                          {donation.status === 'entregue' ? 'Concluído' : 'Pendente'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {donation.status === 'pendente' && donation.tipo === 'item' && (
                        <button 
                          onClick={() => handleConfirmReceipt(donation.id)}
                          className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-sm"
                          style={{ backgroundColor: 'var(--green-primary)' }}
                        >
                          Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <p className="text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>Nenhuma doação encontrada para estes filtros.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
