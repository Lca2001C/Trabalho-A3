import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2, Mail } from 'lucide-react';
import api from '../../services/api';

export default function OngReceiptsView() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    api.get('/api/donations/institution/receipts')
      .then(res => setReceipts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (rec) => {
    setDownloading(rec.id);
    try {
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
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>Comprovantes 📄</h2>
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>Acesse os recibos oficiais de todas as doações financeiras</p>
        </div>
      </div>

      <div className="card-base p-6">
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-[var(--bg-tertiary)] rounded-2xl" />
            ))}
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-muted)' }}>
              <FileText size={32} />
            </div>
            <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>Nenhum comprovante disponível</p>
            <p className="text-[13px] font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Os recibos aparecem automaticamente após o processamento das doações.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {receipts.map(rec => (
              <div
                key={rec.id}
                className="flex justify-between items-center p-5 bg-[var(--bg-secondary)] rounded-2xl border transition-all hover:shadow-md"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--bg-primary)] border" style={{ borderColor: 'var(--border)', color: 'var(--green-primary)' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{rec.ref}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[12px] font-bold" style={{ color: 'var(--green-text)' }}>{rec.valor}</span>
                      <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] opacity-30" />
                      <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{rec.doador}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden sm:block text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{rec.date}</span>
                  <button
                    onClick={() => handleDownload(rec)}
                    disabled={downloading === rec.id}
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-all border hover:scale-105 active:scale-95"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--green-primary)' }}
                  >
                    {downloading === rec.id
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Download size={18} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
