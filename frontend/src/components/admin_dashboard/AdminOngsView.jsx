import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Loader2, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Mapeia status do banco → aba do frontend
const STATUS_TAB_MAP = {
  PENDING: 'Pendentes',
  APPROVED: 'Aprovadas',
  REJECTED: 'Reprovadas',
};

export default function AdminOngsView({ selectedONG, setSelectedONG }) {
  const [ongStatusTab, setOngStatusTab] = useState('Pendentes');
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const tabs = ['Pendentes', 'Aprovadas', 'Reprovadas'];

  const fetchInstitutions = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/institutions')
      .then(res => setInstitutions(res.data))
      .catch(() => setError('Não foi possível carregar as ONGs.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchInstitutions(); }, [fetchInstitutions]);

  const filteredOngs = institutions.filter(
    ong => STATUS_TAB_MAP[ong.status] === ongStatusTab
  );

  const handleApprove = async (ong, e) => {
    e?.stopPropagation();
    const result = await Swal.fire({
      title: 'Aprovar ONG?',
      text: `Deseja aprovar "${ong.nome}" para receber doações?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--green-primary)',
      confirmButtonText: 'Sim, aprovar!'
    });

    if (result.isConfirmed) {
      setActionLoading(ong.id);
      try {
        const res = await api.post(`/api/admin/institutions/${ong.id}/approve`);
        if (res.data.institutions) setInstitutions(res.data.institutions);
        else fetchInstitutions();
        Swal.fire('Aprovada!', 'A ONG agora faz parte da rede ConectaBem.', 'success');
        if (selectedONG?.id === ong.id) setSelectedONG(null);
      } catch {
        Swal.fire('Erro', 'Não foi possível aprovar a ONG.', 'error');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleReject = async (ong, e) => {
    e?.stopPropagation();
    const { value: reason } = await Swal.fire({
      title: 'Reprovar ONG',
      input: 'text',
      inputLabel: 'Motivo da reprovação',
      inputPlaceholder: 'Ex: Documentação incompleta',
      showCancelButton: true,
      confirmButtonColor: '#ef4444'
    });

    if (reason !== undefined) {
      setActionLoading(ong.id);
      try {
        const res = await api.post(`/api/admin/institutions/${ong.id}/reject`, { reason });
        if (res.data.institutions) setInstitutions(res.data.institutions);
        else fetchInstitutions();
        Swal.fire('Reprovada', 'A solicitação foi rejeitada.', 'info');
        if (selectedONG?.id === ong.id) setSelectedONG(null);
      } catch {
        Swal.fire('Erro', 'Não foi possível processar a ação.', 'error');
      } finally {
        setActionLoading(null);
      }
    }
  };

  // ── TELA DE DETALHE ────────────────────────────────────────────────────────
  if (selectedONG) {
    const ong = institutions.find(i => i.id === selectedONG.id) ?? selectedONG;
    
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setSelectedONG(null)}
          className="flex items-center gap-2 text-[13px] font-medium mb-6 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--green-primary)' }}
        >
          <ArrowLeft size={16} /> Voltar para a lista
        </button>

        <div className="card-base p-8 relative overflow-hidden">
          {/* Header do Detalhe */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                   style={{ background: 'linear-gradient(135deg, var(--green-primary), var(--green-dark))' }}>
                {ong.nome?.charAt(0)}
              </div>
              <div>
                <h1 className="text-[24px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{ong.nome}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ 
                          backgroundColor: ong.status === 'APPROVED' ? 'var(--green-light)' : ong.status === 'REJECTED' ? 'var(--pink-light)' : 'var(--amber-light)',
                          color: ong.status === 'APPROVED' ? 'var(--green-text)' : ong.status === 'REJECTED' ? 'var(--coral-text)' : 'var(--amber-text)'
                        }}>
                    {STATUS_TAB_MAP[ong.status]}
                  </span>
                  <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>ID: #{ong.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
              {[
                { icon: <Building2 size={18} />, label: 'CNPJ', value: ong.cnpj },
                { icon: <Mail size={18} />, label: 'E-mail de Contato', value: ong.email },
                { icon: <Phone size={18} />, label: 'Telefone', value: ong.telefone || 'Não informado' },
                { icon: <MapPin size={18} />, label: 'Endereço Sede', value: ong.endereco || 'Não informado' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1" style={{ color: 'var(--green-primary)' }}>{item.icon}</div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                    <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-xl flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2 text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
                <FileText size={18} style={{ color: 'var(--green-primary)' }} />
                Descrição da Instituição
              </div>
              <p className="text-[13px] leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                "{ong.descricaoInstituicao || 'Nenhuma descrição detalhada fornecida.'}"
              </p>
            </div>
          </div>

          {/* Ações de Aprovação */}
          {ong.status === 'PENDING' && (
            <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={(e) => handleReject(ong, e)}
                className="flex-1 py-3.5 rounded-xl border font-bold text-[14px] flex items-center justify-center gap-2 transition-all hover:bg-red-50"
                style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
              >
                <X size={18} /> Reprovar Cadastro
              </button>
              <button
                onClick={(e) => handleApprove(ong, e)}
                className="flex-[2] py-3.5 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100"
                style={{ backgroundColor: 'var(--green-primary)' }}
              >
                <Check size={18} /> Aprovar e Ativar Instituição
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── TELA DE LISTA ──────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[20px] font-medium" style={{ color: 'var(--text-primary)' }}>Gestão de ONGs</h2>
        <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setOngStatusTab(tab)}
              className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
              style={{ 
                backgroundColor: ongStatusTab === tab ? 'var(--bg-primary)' : 'transparent',
                color: ongStatusTab === tab ? 'var(--green-primary)' : 'var(--text-secondary)',
                boxShadow: ongStatusTab === tab ? 'var(--shadow-card)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="card-base h-[100px] animate-pulse" />)}
        </div>
      ) : filteredOngs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 card-base border-dashed">
          <AlertCircle size={48} className="mb-4 opacity-20" />
          <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Nenhuma ONG nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOngs.map((ong) => (
            <div
              key={ong.id}
              onClick={() => setSelectedONG(ong)}
              className="card-base p-5 flex items-center justify-between hover:scale-[1.01] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white transition-transform group-hover:rotate-6"
                     style={{ backgroundColor: 'var(--green-primary)' }}>
                  {ong.nome?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{ong.nome}</h4>
                  <p className="text-[11px] font-bold opacity-60 uppercase" style={{ color: 'var(--text-muted)' }}>
                    CNPJ: {ong.cnpj || 'PENDENTE'}
                  </p>
                </div>
              </div>
              
              <div className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors">
                <ArrowLeft size={16} className="rotate-180" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
