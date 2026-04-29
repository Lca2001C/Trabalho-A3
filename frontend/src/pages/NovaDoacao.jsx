import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  Box, 
  CircleDollarSign, 
  Image as ImageIcon, 
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function NovaDoacao() {
  const navigate = useNavigate();
  
  // Estado para controlar o tipo de doação: 'item' ou 'financeira'
  const [tipoDoacao, setTipoDoacao] = useState('item');
  const [item, setItem] = useState('');
  const [valor, setValor] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/api/auth/institutions/approved');
        setInstitutions(response.data);
      } catch (err) {
        console.error('Erro ao buscar instituições', err);
      }
    };
    fetchInstitutions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!institutionId) {
        setError('Por favor, selecione uma instituição.');
        setIsLoading(false);
        return;
      }

      const payload = { 
        tipo: tipoDoacao,
        institutionId: parseInt(institutionId)
      };
      if (tipoDoacao === 'item') {
        payload.item = item;
      } else {
        payload.valor = parseFloat(valor);
      }

      await api.post('/api/donations', payload);
      
      // Redireciona forçando o reload para atualizar o dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.erro || 'Erro ao registrar doação. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 py-10 px-4 sm:px-6">
      
      <div className="max-w-2xl mx-auto">
        
        {/* ── Cabeçalho da Página ── */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center p-2 mr-4 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Voltar para o Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nova Doação</h1>
        </div>

        {/* ── Container Principal / Card ── */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* ── Abas de Seleção (Tabs) ── */}
            <div className="flex flex-col sm:flex-row p-1 mb-8 bg-gray-100 text-sm font-medium rounded-xl">
              <button
                type="button"
                onClick={() => setTipoDoacao('item')}
                className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg transition-all duration-200 ${
                  tipoDoacao === 'item' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <Box size={18} className="mr-2" />
                Doar Item
              </button>
              
              <button
                type="button"
                onClick={() => setTipoDoacao('financeira')}
                className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg transition-all duration-200 sm:ml-1 mt-1 sm:mt-0 ${
                  tipoDoacao === 'financeira' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <CircleDollarSign size={18} className="mr-2" />
                Doação Financeira
              </button>
            </div>

            <div className="space-y-6">

              {/* ── Seleção de Instituição ── */}
              <div className="space-y-2 p-5 bg-blue-50 border border-blue-100 rounded-2xl mb-6">
                <label htmlFor="instituicao" className="block text-sm font-bold text-blue-900 flex items-center">
                  <Building2 size={18} className="mr-2" /> Para qual Instituição você quer doar?
                </label>
                <div className="relative">
                  <select
                    id="instituicao"
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    className="block w-full px-4 py-3 border border-blue-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors cursor-pointer font-medium"
                    required
                  >
                    <option value="" disabled>Selecione uma ONG incrível...</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.nome}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ── Formulário: Item ── */}
              {tipoDoacao === 'item' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  <div className="space-y-2">
                    <label htmlFor="item-nome" className="block text-sm font-medium text-gray-700">
                      O que você quer doar?
                    </label>
                    <input
                      id="item-nome"
                      type="text"
                      value={item}
                      onChange={(e) => setItem(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Ex: Roupas infantis, Notebook, Livros..."
                      required={tipoDoacao === 'item'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="estado-conservacao" className="block text-sm font-medium text-gray-700">
                      Estado de conservação
                    </label>
                    <div className="relative">
                      <select
                        id="estado-conservacao"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors cursor-pointer"
                        required
                        defaultValue="Bom estado"
                      >
                        <option value="Novo">Novo (Na caixa / Nunca usado)</option>
                        <option value="Bom estado">Bom estado (Usado poucas vezes)</option>
                        <option value="Com marcas de uso">Com marcas de uso (Usado, mas funcional)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Upload Fake */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Foto do item (Opcional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="space-y-1 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <span className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2-blue-500 focus-within:ring-offset-2">
                            Clique para enviar uma foto
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG ou GIF até 5MB</p>
                      </div>
                    </div>
                  </div>
                  
                </div>
              )}


              {/* ── Formulário: Financeira ── */}
              {tipoDoacao === 'financeira' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  <div className="space-y-2">
                    <label htmlFor="valor-doacao" className="block text-sm font-medium text-gray-700">
                      Valor da doação (R$)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-medium font-mono">
                        R$
                      </div>
                      <input
                        id="valor-doacao"
                        type="number"
                        min="5"
                        step="0.01"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                        placeholder="0,00"
                        required={tipoDoacao === 'financeira'}
                      />
                    </div>
                  </div>

                  {/* Alerta de Segurança */}
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                    <ShieldCheck size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Pagamento 100% Seguro
                      </p>
                      <p className="text-sm text-green-700 mt-0.5">
                        Você será redirecionado para o ambiente seguro do Mercado Pago para concluir sua doação. A plataforma não armazena os dados do seu cartão.
                      </p>
                    </div>
                  </div>
                  
                </div>
              )}

            </div>

            {/* ── Botão Confirmar Doação ── */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : (
                  'Confirmar Doação'
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
