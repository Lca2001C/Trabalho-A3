import React, { useState } from 'react';
import { Gift, Heart, Package } from 'lucide-react';

export default function DonationsView({ doacoes }) {
  const [filter, setFilter] = useState('all'); // 'all', 'item', 'financeira'

  const filteredDoacoes = doacoes?.filter(don => {
    if (filter === 'all') return true;
    return don.tipo === filter;
  }) || [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="text-green-600" /> Minhas Doações
          </h1>
          <div className="flex gap-3">
            <select 
               className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500 text-gray-700 font-medium bg-white"
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
             >
               <option value="all">Todos</option>
               <option value="item">Itens Físicos</option>
               <option value="financeira">Financeiro</option>
             </select>
          </div>
        </div>

        <div className="overflow-hidden border border-gray-100 rounded-xl">
          <div className="divide-y divide-gray-100">
            {(!filteredDoacoes || filteredDoacoes.length === 0) ? (
               <div className="p-6 text-center text-gray-500 text-sm">
                 Você ainda não possui doações {filter !== 'all' ? 'nesta categoria' : ''}.
               </div>
            ) : filteredDoacoes.map((don) => (
              <div key={don.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    {don.tipo === 'item' ? <Package className="text-gray-600" /> : <Heart className="text-gray-600" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {don.tipo === 'item' ? `Doação de ${don.item}` : 'Doação financeira'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">{don.institution?.nome ? `ONG: ${don.institution.nome}` : 'ONG: Indefinida'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                   <div className="text-right hidden md:block">
                     <p className="text-xs text-gray-400 mb-0.5">Data</p>
                     <p className="text-sm font-medium text-gray-700">{new Date(don.criadoEm).toLocaleDateString('pt-BR')}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-xs text-gray-400 mb-0.5">Pontos</p>
                     <p className="text-sm font-bold text-green-600">+{don.pontosGerados} pts</p>
                   </div>
                   <div className="w-auto md:w-24 text-right hidden sm:block">
                      <span className={`inline-block px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full ${don.status === 'aprovada' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {don.status === 'aprovada' ? 'Concluído' : 'Pendente'}
                      </span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
