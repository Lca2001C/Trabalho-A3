import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2, Mail } from 'lucide-react';
import api from '../../services/api';

export default function OngReceiptsView() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [downloading, setDownloading] = useState(null); // id do comprovante sendo baixado

  useEffect(() => {
    api.get('/api/donations/institution/receipts')
      .then(res => setReceipts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Gera e "baixa" um comprovante em texto simples
  // Substitua por chamada a um endpoint de PDF quando disponível
  const handleDownload = async (rec) => {
    setDownloading(rec.id);
    try {
      // Tenta buscar endpoint de PDF — fallback para geração no cliente
      const conteudo = [
        '======================================',
        '   COMPROVANTE DE DOAÇÃO — ConectaBem',
        '======================================',
        `Ref:     ${rec.ref}`,
        `Doador:  ${rec.doador}`,
        `E-mail:  ${rec.email}`,
        `Valor:   ${rec.valor}`,
        `Data:    ${rec.date}`,
        '======================================',
        'Esta doação foi recebida e processada',
        'com sucesso pela plataforma ConectaBem.',
        '======================================',
      ].join('\n');

      const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${rec.ref.replace(/\s+/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" /> Comprovantes
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Comprovantes das doações financeiras recebidas
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm">Nenhum comprovante disponível ainda.</p>
            <p className="text-xs mt-1">Comprovantes aparecem quando doações financeiras são aprovadas.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {receipts.map(rec => (
              <div
                key={rec.id}
                className="flex justify-between items-center py-4 first:pt-0 last:pb-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-800">{rec.ref}</h4>
                  <div className="flex flex-wrap gap-x-4 mt-0.5">
                    <p className="text-sm text-gray-500">{rec.desc}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {rec.doador}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(rec)}
                  disabled={downloading === rec.id}
                  title="Baixar comprovante"
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {downloading === rec.id
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Download className="w-5 h-5" />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && receipts.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {receipts.length} comprovante{receipts.length !== 1 ? 's' : ''} disponíve{receipts.length !== 1 ? 'is' : 'l'}
        </p>
      )}
    </div>
  );
}
