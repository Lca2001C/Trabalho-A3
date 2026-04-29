import React from 'react';
import { FileText, DownloadCloud } from 'lucide-react';

export default function ReceiptsView({ doacoes }) {
  // Gera os "comprovantes" baseados nas doações concluídas
  const receipts = doacoes?.filter(d => d.status === 'aprovada').map(d => ({
    id: d.id,
    title: d.tipo === 'item' ? `Comprovante - Doação de ${d.item}` : `Recibo - Doação financeira (R$ ${d.valor || '...'})`,
    org: d.ong ? `ONG: ${d.ong}` : 'ONG: ConectaBem',
    date: new Date(d.criadoEm).toLocaleDateString('pt-BR'),
    file: `comprovante_${d.id}.pdf`
  })) || [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="text-green-600" /> Meus Comprovantes
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {receipts.length === 0 ? (
             <div className="col-span-2 text-center text-gray-500 text-sm mt-8">
               Você ainda não possui comprovantes gerados.
             </div>
           ) : receipts.map(receipt => (
             <div key={receipt.id} className="border border-gray-200 rounded-xl p-5 flex items-start justify-between hover:border-green-400 hover:shadow-sm transition-all group">
                <div className="flex gap-4">
                   <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                      <FileText className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{receipt.title}</h4>
                     <p className="text-xs text-gray-500 mt-1">{receipt.org} • {receipt.date}</p>
                     <p className="text-xs text-gray-400 mt-2">{receipt.file}</p>
                   </div>
                </div>
                <button className="text-gray-400 hover:text-green-600 p-2 rounded-lg hover:bg-green-50 transition-colors" title="Baixar comprovante">
                   <DownloadCloud className="w-5 h-5" />
                </button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
