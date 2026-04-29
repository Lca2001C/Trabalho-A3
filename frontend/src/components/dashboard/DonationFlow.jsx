import React, { useState, useCallback, useEffect } from 'react';
import {
  Gift, Package, Heart, Leaf, ChevronLeft, Calendar, MapPin,
  Clock, CheckCircle2, QrCode, CreditCard, Receipt, Star, Check,
  Loader2, AlertCircle, Building2
} from 'lucide-react';
import { Stepper } from './SharedComponents';
import api from '../../services/api';

// ─── Hook: lista ONGs aprovadas ──────────────────────────────────────────────
function useInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loadingOngs, setLoadingOngs]   = useState(true);

  useEffect(() => {
    api.get('/api/auth/institutions/approved')
      .then(res => setInstitutions(res.data))
      .catch(() => {})
      .finally(() => setLoadingOngs(false));
  }, []);

  return { institutions, loadingOngs };
}

// ─── Componente de Feedback (Sucesso / Erro) ────────────────────────────────
function FeedbackBanner({ type, message }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 border text-sm font-medium ${
      isSuccess
        ? 'bg-green-50 border-green-200 text-green-700'
        : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      {isSuccess
        ? <CheckCircle2 className="w-5 h-5 shrink-0" />
        : <AlertCircle className="w-5 h-5 shrink-0" />
      }
      {message}
    </div>
  );
}

// ─── Tipo de doação ──────────────────────────────────────────────────────────
export function DonateTypeView({ onBack, onSelectItems, onSelectFinancial }) {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-green-600 mb-6 transition-colors w-fit">
        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-1">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Gift className="text-green-600" /> Fazer Doação
          </h1>
          <p className="text-gray-500 mt-2">Escolha o tipo de doação</p>
        </div>
        <div className="space-y-4 max-w-2xl mx-auto">
          <div onClick={onSelectItems} className="flex items-center p-6 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50/50 cursor-pointer transition-all group">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">Doação de itens</h3>
              <p className="text-gray-500 text-sm mt-1">Doe roupas, alimentos, brinquedos e muito mais.</p>
            </div>
            <div className="w-24 h-24 bg-orange-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              <Package className="w-12 h-12 text-orange-600 z-10" />
              <Leaf className="w-6 h-6 text-green-500 absolute top-2 right-2 opacity-50" />
            </div>
          </div>
          <div onClick={onSelectFinancial} className="flex items-center p-6 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50/50 cursor-pointer transition-all group">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">Doação financeira</h3>
              <p className="text-gray-500 text-sm mt-1">Contribua com qualquer valor para ajudar as ONGs.</p>
            </div>
            <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center">
              <Heart className="w-12 h-12 text-green-600 fill-green-600" />
            </div>
          </div>
        </div>
        <div className="mt-16 text-center">
          <p className="text-sm font-semibold text-gray-800">Sua doação faz a diferença!</p>
          <p className="text-xs text-gray-500 mt-1">Todas as doações são destinadas a ONGs verificadas e você ainda ganha pontos!</p>
        </div>
      </div>
    </div>
  );
}

// ─── Stepper Steps ───────────────────────────────────────────────────────────
const ITEM_STEPS = [
  { num: 1, label: 'Detalhes' },
  { num: 2, label: 'Retirada' },
  { num: 3, label: 'Revisão' },
];

const FINANCIAL_STEPS = [
  { num: 1, label: 'Valor' },
  { num: 2, label: 'Pagamento' },
  { num: 3, label: 'Confirmação' },
];

// ─── Detalhes do Item ────────────────────────────────────────────────────────
export function DonateDetailsView({ onBack, onNext, formData, setFormData }) {
  const { institutions, loadingOngs } = useInstitutions();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-green-600 mb-6 transition-colors w-fit">
        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="text-green-600" /> Doação de Itens
        </h1>
        <Stepper steps={ITEM_STEPS} currentStep={1} />
        <div className="space-y-5">
          {/* ONG Destinatária */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Building2 className="w-4 h-4 text-gray-400" /> ONG destinatária
            </label>
            <select
              value={formData.institutionId ?? ''}
              onChange={e => setFormData(f => ({ ...f, institutionId: e.target.value ? Number(e.target.value) : null }))}
              disabled={loadingOngs}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-60 bg-white"
            >
              <option value="">{loadingOngs ? 'Carregando ONGs...' : 'Selecione uma ONG (opcional)'}</option>
              {institutions.map(ong => (
                <option key={ong.id} value={ong.id}>{ong.nome}</option>
              ))}
            </select>
            {!loadingOngs && institutions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Nenhuma ONG disponível no momento.</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria do item</label>
            <select
              value={formData.categoria}
              onChange={e => setFormData(f => ({ ...f, categoria: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option>Roupas</option>
              <option>Alimentos não perecíveis</option>
              <option>Brinquedos</option>
              <option>Eletrônicos</option>
              <option>Móveis</option>
              <option>Outros</option>
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do item</label>
            <textarea
              rows="3"
              value={formData.descricao}
              onChange={e => setFormData(f => ({ ...f, descricao: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Ex: Roupas de inverno em bom estado"
            />
          </div>

          {/* Conservação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado de conservação</label>
            <select
              value={formData.conservacao}
              onChange={e => setFormData(f => ({ ...f, conservacao: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option>Usado - Em bom estado</option>
              <option>Novo</option>
            </select>
          </div>

          <button
            onClick={onNext}
            disabled={!formData.descricao.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-lg transition-colors mt-6 shadow-sm disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Agendamento de Retirada ─────────────────────────────────────────────────
export function DonatePickupView({ onBack, onNext, formData, setFormData }) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-green-600 mb-6 transition-colors w-fit">
        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="text-green-600" /> Agendar Retirada
        </h1>
        <Stepper steps={ITEM_STEPS} currentStep={2} />
        <div className="space-y-5">
          <div className="bg-green-50/50 p-4 rounded-lg border border-green-100 mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Endereço para retirada</h3>
            <p className="text-xs text-gray-600">Informe onde a ONG irá recolher sua doação.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.cep}
                onChange={e => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length > 5) {
                    val = val.replace(/^(\d{5})(\d{1,3}).*/, "$1-$2");
                  }
                  setFormData(f => ({ ...f, cep: val }));
                }}
                maxLength={9}
                className="w-full border border-gray-300 rounded-lg p-3 pl-10 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="00000-000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço completo</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={e => setFormData(f => ({ ...f, endereco: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Rua das Flores, 123 - São Paulo, SP"
            />
          </div>
          <button
            onClick={onNext}
            disabled={!formData.endereco.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-lg transition-colors mt-6 shadow-sm disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Revisão e Confirmação (Item) ────────────────────────────────────────────
export function DonateReviewView({ onBack, onConfirm, formData, submitting, feedback }) {
  const PONTOS_ITEM = 50;
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-green-600 mb-6 transition-colors w-fit">
        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CheckCircle2 className="text-green-600" /> Revisão e Confirmação
        </h1>
        <Stepper steps={ITEM_STEPS} currentStep={3} />

        <FeedbackBanner type={feedback?.type} message={feedback?.message} />

        <div className="space-y-5">
          <p className="text-gray-600 mb-4 font-medium">Revise os dados da sua doação</p>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Categoria</p>
              <p className="text-sm font-semibold text-gray-900">{formData.categoria}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Descrição</p>
              <p className="text-sm text-gray-700">{formData.descricao}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Estado</p>
              <p className="text-sm text-gray-700">{formData.conservacao}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Retirada</p>
            <p className="text-sm text-gray-700">{formData.endereco || '—'}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100 flex items-center justify-between">
            <span className="font-semibold text-gray-800">Você ganhará</span>
            <span className="text-xl font-bold text-green-600 flex items-center gap-1">
              +{PONTOS_ITEM} pts <Star className="w-5 h-5 fill-current" />
            </span>
          </div>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-lg transition-colors mt-6 shadow-sm disabled:opacity-60 flex items-center justify-center"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar doação'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Valor da Doação Financeira ──────────────────────────────────────────────
export function FinancialDonateValueView({ onBack, onNext, formData, setFormData }) {
  const presets = [25, 50, 100, 200];
  const { institutions, loadingOngs } = useInstitutions();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-green-600 mb-6 transition-colors w-fit">
        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Heart className="text-green-600 fill-current" /> Doação Financeira
        </h1>
        <Stepper steps={FINANCIAL_STEPS} currentStep={1} />
        <div className="space-y-6">
          {/* ONG destinatária */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Building2 className="w-4 h-4 text-gray-400" /> ONG destinatária
            </label>
            <select
              value={formData.institutionId ?? ''}
              onChange={e => setFormData(f => ({ ...f, institutionId: e.target.value ? Number(e.target.value) : null }))}
              disabled={loadingOngs}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-60 bg-white"
            >
              <option value="">{loadingOngs ? 'Carregando ONGs...' : 'Selecione uma ONG (opcional)'}</option>
              {institutions.map(ong => (
                <option key={ong.id} value={ong.id}>{ong.nome}</option>
              ))}
            </select>
          </div>

          <p className="text-gray-800 font-medium">Escolha o valor da sua doação</p>
          <div className="grid grid-cols-4 gap-3">
            {presets.map(val => (
              <button
                key={val}
                onClick={() => setFormData(f => ({ ...f, valor: val }))}
                className={`py-3 rounded-lg border-2 font-medium transition-colors ${
                  formData.valor === val
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                R$ {val}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Outro valor</label>
            <input
              type="number"
              min="1"
              value={formData.valor}
              onChange={e => setFormData(f => ({ ...f, valor: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="0"
            />
          </div>
          <button
            onClick={onNext}
            disabled={!formData.valor || formData.valor <= 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-lg transition-colors mt-6 shadow-sm disabled:opacity-50"
          >
            Continuar para pagamento
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagamento e Submissão Final ─────────────────────────────────────────────
// Esta é a etapa onde o POST para /api/donations é feito.
export function FinancialDonatePaymentView({ onBack, onConfirm, formData, setFormData, submitting, feedback }) {
  const PONTOS_POR_REAL = Math.floor(formData.valor ?? 0);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-green-600 mb-6 transition-colors w-fit">
        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CreditCard className="text-green-600" /> Pagamento
        </h1>
        <Stepper steps={FINANCIAL_STEPS} currentStep={2} />

        <FeedbackBanner type={feedback?.type} message={feedback?.message} />

        <div className="space-y-6">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex justify-between items-center">
            <span className="font-medium text-gray-800">Valor da doação</span>
            <span className="text-xl font-bold text-green-700">R$ {formData.valor?.toFixed(2)}</span>
          </div>

          <p className="text-gray-800 font-medium">Escolha a forma de pagamento</p>
          <div className="space-y-3">
            {[
              { id: 'pix', label: 'PIX', sub: 'Aprovação imediata', icon: <QrCode className="w-5 h-5" />, bg: 'bg-teal-100 text-teal-600' },
              { id: 'cc', label: 'Cartão de crédito', sub: 'Até 12x', icon: <CreditCard className="w-5 h-5" />, bg: 'bg-blue-100 text-blue-600' },
              { id: 'boleto', label: 'Boleto bancário', sub: 'Aprovação em até 3 dias úteis', icon: <Receipt className="w-5 h-5" />, bg: 'bg-green-100 text-green-600' },
            ].map(m => (
              <div
                key={m.id}
                onClick={() => setFormData(f => ({ ...f, metodoPagamento: m.id }))}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  formData.metodoPagamento === m.id ? 'border-green-600 bg-green-50/50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${m.bg}`}>{m.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{m.label}</h4>
                  <p className="text-xs text-gray-500">{m.sub}</p>
                </div>
                {formData.metodoPagamento === m.id && <CheckCircle2 className="text-green-600" />}
              </div>
            ))}
          </div>

          <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex justify-between">
            <span className="font-semibold text-gray-800">Você ganhará</span>
            <span className="text-lg font-bold text-green-600 flex items-center gap-1">
              +{PONTOS_POR_REAL} pts <Star className="w-4 h-4 fill-current" />
            </span>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 mb-2">Pagamento processado pelo</p>
            <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-sm">
              <div className="bg-blue-100 p-1.5 rounded-full"><Check className="w-4 h-4" /></div>
              Mercado Pago
            </div>
          </div>

          {/* ── BOTÃO DE SUBMISSÃO FINAL ── */}
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-lg transition-colors mt-6 shadow-sm disabled:opacity-60 flex items-center justify-center"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Pagamento'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hook de submissão de doação ─────────────────────────────────────────────
// Centraliza a lógica de POST, tratamento de erro e feedback visual.
// Usado pelo Dashboard.jsx para as duas variantes (item / financeira).
export function useDonationSubmit({ onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

  const submitDonation = useCallback(async (payload) => {
    setSubmitting(true);
    setFeedback(null);

    try {
      // payload esperado: { tipo: 'item', item: '...' } ou { tipo: 'financeira', valor: 50 }
      const res = await api.post('/api/donations', payload);

      setFeedback({
        type: 'success',
        message: `Doação registrada com sucesso! Você ganhou +${res.data.pontosGanhos} pontos 🎉`,
      });

      // Redireciona após 2s para o dashboard
      setTimeout(() => {
        setFeedback(null);
        onSuccess();
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.erro ?? 'Erro ao registrar doação. Tente novamente.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  }, [onSuccess]);

  return { submitDonation, submitting, feedback };
}
