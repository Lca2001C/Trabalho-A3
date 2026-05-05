import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import api from '../../services/api';

const CATEGORY_ICONS = {
  'Roupas': '👕',
  'Alimentos': '🥫',
  'Brinquedos': '🧸',
  'Móveis': '🪑',
  'Eletrônicos': '💻',
};

// Deriva uma categoria simples do nome do item
function deriveCategory(name = '') {
  const n = name.toLowerCase();
  if (/roup|agasalh|camiset|calça|blusa|jaqueta|casaco/.test(n)) return 'Roupas';
  if (/aliment|arroz|feijão|cesta|comid|macarrão/.test(n)) return 'Alimentos';
  if (/brinqued|bonec|jogo|carrinho|pelucia/.test(n)) return 'Brinquedos';
  if (/mobi|cadeira|mesa|sofá|cama/.test(n)) return 'Móveis';
  if (/eletrônic|celular|computador|notebook|tablet/.test(n)) return 'Eletrônicos';
  return 'Outros';
}

export default function OngItemsView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');

  const categories = ['Todos', 'Roupas', 'Alimentos', 'Brinquedos', 'Móveis', 'Eletrônicos', 'Outros'];

  useEffect(() => {
    api.get('/api/donations/institution/received')
      .then(res => {
        const itemDonations = res.data.doacoes
          .filter(d => d.tipo === 'item')
          .map(d => ({
            id: d.id,
            name: d.item ?? 'Item sem nome',
            donor: d.user?.nome ?? 'Anônimo',
            date: new Date(d.criadoEm).toLocaleDateString('pt-BR'),
            status: d.status === 'entregue' ? 'Recebido' : 'Pendente',
            category: deriveCategory(d.item),
          }));
        setItems(itemDonations);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'Todos' ? items : items.filter(i => i.category === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>Itens Recebidos 🧥</h2>
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>Controle de doações físicas entregues à sua ONG</p>
        </div>
      </div>

      <div className="card-base p-0 overflow-hidden">
        {/* Filtros de categoria */}
        <div className="flex p-2 bg-[var(--bg-tertiary)] rounded-t-xl overflow-x-auto gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
          {categories.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 text-[13px] font-bold rounded-lg transition-all whitespace-nowrap ${
                filter === tab
                  ? 'bg-[var(--bg-primary)] shadow-sm'
                  : 'opacity-50 hover:opacity-100'
              }`}
              style={{ color: filter === tab ? 'var(--green-primary)' : 'var(--text-secondary)' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse h-16 bg-[var(--bg-tertiary)] rounded-2xl" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl border transition-all hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--bg-primary)] rounded-xl flex items-center justify-center text-[22px] shadow-sm border border-[var(--border)]">
                      {CATEGORY_ICONS[item.category] ?? '📦'}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                      <p className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>Por: {item.donor}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{item.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.status === 'Recebido' ? 'var(--green-primary)' : 'var(--amber-text)' }} />
                      <span className="text-[12px] font-bold" style={{ color: item.status === 'Recebido' ? 'var(--green-text)' : 'var(--amber-text)' }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Nenhum item {filter !== 'Todos' ? `de "${filter}"` : ''} encontrado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
