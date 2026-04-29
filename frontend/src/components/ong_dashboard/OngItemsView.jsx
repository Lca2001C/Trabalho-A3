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
        // Filtra só doações de item físico e transforma para o formato da UI
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-500" /> Itens Recebidos
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Filtros de categoria */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {categories.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pb-3 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl shadow-inner">
                    {CATEGORY_ICONS[item.category] ?? '📦'}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-xs text-gray-500">Doado por: {item.donor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm text-gray-500">{item.date}</span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    item.status === 'Recebido'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 text-sm">
            Nenhum item {filter !== 'Todos' ? `de "${filter}"` : ''} encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
