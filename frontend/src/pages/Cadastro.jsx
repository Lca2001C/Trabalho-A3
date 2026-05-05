import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Building2, ShieldCheck } from 'lucide-react';
import api from '../services/api'; 
import Swal from 'sweetalert2';
import { AuthLayout, InputField, PasswordInputField } from '../components/auth/AuthComponents';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileType, setProfileType] = useState('doador'); // 'doador', 'ong'
  
  // Campos exclusivos de Instituição
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [descricaoInstituicao, setDescricaoInstituicao] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const isInstitution = profileType === 'ong';

  const handleDocumentoChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (isInstitution) {
      val = val.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5").replace(/[.\/-]$/, "");
    } else {
      val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4").replace(/[.-]$/, "");
    }
    setCnpj(val.substring(0, isInstitution ? 18 : 14));
  };

  const handleTelefoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) {
      val = val.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
    } else {
      val = val.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
    }
    setTelefone(val.substring(0, 15));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!cnpj) {
      setError('Por favor, informe o seu documento (CPF ou CNPJ).');
      return;
    }

    if (isInstitution) {
      if (!telefone || !endereco || !descricaoInstituicao) {
        setError('Por favor, preencha todos os campos da instituição.');
        return;
      }
    }

    setIsLoading(true);

    try {
      let role = 'USER';
      if (profileType === 'ong') role = 'INSTITUTION';

      const payload = {
        nome,
        email,
        senha: password,
        role,
        cnpj: cnpj.replace(/\D/g, ''),
        ...(isInstitution && {
          telefone: telefone.replace(/\D/g, ''),
          endereco,
          descricaoInstituicao
        })
      };

      const response = await api.post('/api/auth/register', payload);

      if (isInstitution) {
        // Fluxo Instituição (Pendente)
        await Swal.fire({
          title: 'Cadastro Concluído!',
          text: 'Sua conta de Instituição foi enviada para análise. O administrador verificará seus dados e aprovará em breve. Você receberá um aviso quando for liberado.',
          icon: 'info',
          confirmButtonText: 'Entendi, vou aguardar',
          confirmButtonColor: '#22a055', 
          customClass: { popup: 'rounded-2xl', confirmButton: 'rounded-xl px-5 py-2' }
        });
        navigate('/login');
      } else {
        // Fluxo Doador Normal (Login Ativo)
        localStorage.setItem('@ConectaBem:token', response.data.token);
        localStorage.setItem('@ConectaBem:user', JSON.stringify(response.data.usuario));
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] text-[var(--text-primary)] font-sans antialiased overflow-x-hidden min-h-screen flex items-center justify-center p-6 py-12 transition-colors duration-300">
      <AuthLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Crie sua conta</h1>
          <p className="text-sm text-[var(--text-secondary)]">Preencha os dados abaixo para começar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <InputField label="Nome completo" placeholder="Digite seu nome" value={nome} onChange={e => setNome(e.target.value)} required />
          <InputField label="Email" type="email" placeholder="Digite seu email" value={email} onChange={e => setEmail(e.target.value)} required />
          
          <PasswordInputField label="Senha" placeholder="Crie uma senha" value={password} onChange={e => setPassword(e.target.value)} required />
          <PasswordInputField label="Confirmar senha" placeholder="Confirme sua senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />

          {/* Seleção de Perfil */}
          <div className="mb-6">
            <label className="text-xs font-bold text-[var(--text-primary)] ml-1 block mb-3">Selecione seu perfil:</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Doador */}
              <div 
                onClick={() => setProfileType('doador')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  profileType === 'doador' 
                    ? 'border-[var(--green-primary)] bg-[var(--green-light)] text-[var(--green-primary)]' 
                    : 'border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:border-[var(--green-primary)]/30'
                }`}
              >
                <Heart size={24} className={profileType === 'doador' ? 'fill-[var(--green-primary)] stroke-[var(--green-primary)]' : ''} />
                <span className="text-[12px] font-bold mt-2">Doador</span>
              </div>
              
              {/* ONG */}
              <div 
                onClick={() => setProfileType('ong')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  profileType === 'ong' 
                    ? 'border-[var(--green-primary)] bg-[var(--green-light)] text-[var(--green-primary)]' 
                    : 'border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:border-[var(--green-primary)]/30'
                }`}
              >
                <Building2 size={24} />
                <span className="text-[12px] font-bold mt-2">Instituição</span>
              </div>
            </div>
          </div>

          <InputField 
            label={isInstitution ? 'CNPJ' : 'CPF'} 
            placeholder={isInstitution ? "00.000.000/0000-00" : "000.000.000-00"} 
            value={cnpj} 
            onChange={handleDocumentoChange} 
            maxLength={isInstitution ? 18 : 14}
            required 
          />

          {isInstitution && (
            <div className="space-y-4 pt-4 border-t mt-4 mb-4" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Dados da Organização</h3>
              
              <InputField 
                label="Telefone para Contato" 
                placeholder="(00) 00000-0000" 
                value={telefone} 
                onChange={handleTelefoneChange} 
                maxLength={15}
                required={isInstitution} 
              />
              <InputField 
                label="Endereço Completo" 
                placeholder="Rua, Número, Bairro, Cidade - UF" 
                value={endereco} 
                onChange={(e) => setEndereco(e.target.value)} 
                required={isInstitution} 
              />
              
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs font-bold text-[var(--text-primary)] ml-1">Propósito / Descrição</label>
                <textarea 
                  value={descricaoInstituicao}
                  onChange={(e) => setDescricaoInstituicao(e.target.value)}
                  required={isInstitution}
                  placeholder="Conte-nos brevemente o que sua ONG faz..." 
                  rows={3}
                  className="w-full px-4 py-3.5 rounded-2xl border outline-none transition-all text-sm"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          )}

          <div className="flex items-start mb-6 ml-1 mt-2">
            <input type="checkbox" id="termos" required className="w-4 h-4 mt-0.5 rounded border-gray-300 focus:ring-[var(--green-primary)] accent-[var(--green-primary)] cursor-pointer" />
            <label htmlFor="termos" className="ml-2 text-xs font-bold text-[var(--text-muted)] leading-relaxed cursor-pointer">
              Eu concordo com os <a href="#" className="font-bold hover:underline" style={{ color: 'var(--green-primary)' }}>Termos e Condições</a>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-[54px] text-white text-[15px] font-bold rounded-2xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
            style={{ backgroundColor: 'var(--green-primary)' }}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Cadastrar'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-[var(--text-secondary)]">
          Já tem conta?{' '}
          <Link to="/login" className="font-bold hover:underline" style={{ color: 'var(--green-primary)' }}>
            Entrar
          </Link>
        </div>
      </AuthLayout>
    </div>
  );
}
