import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout, InputField, PasswordInputField, SocialLogins } from '../components/auth/AuthComponents';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);

      // Redireciona baseado na role
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (data.role === 'INSTITUTION') {
        navigate('/ong/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.motivo) {
        Swal.fire({
          title: 'Conta Recusada',
          text: `Sua conta não foi aprovada pelo administrador.\n\nMotivo: ${err.response.data.motivo}\n\nPor favor, entre em contato para mais detalhes.`,
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      } else {
        setError(err.response?.data?.erro || 'E-mail ou senha incorretos. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] text-[var(--text-primary)] font-sans antialiased overflow-x-hidden min-h-screen flex items-center justify-center p-6 transition-colors duration-300">
      <AuthLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Bem-vindo de volta!</h1>
          <p className="text-sm text-[var(--text-secondary)]">Faça login para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <InputField 
            label="Email" 
            type="email" 
            placeholder="Digite seu email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          
          <div className="relative">
            <PasswordInputField 
              label="Senha" 
              placeholder="Digite sua senha" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <div className="absolute top-0 right-0 mt-0.5">
              <Link 
                to="/forgot-password"
                className="text-xs font-bold transition-opacity hover:opacity-70"
                style={{ color: 'var(--green-primary)' }}
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <div className="flex items-center mb-6 mt-1 ml-1">
            <input type="checkbox" id="lembrar" className="w-4 h-4 rounded border-gray-300 focus:ring-[var(--green-primary)] accent-[var(--green-primary)] cursor-pointer" />
            <label htmlFor="lembrar" className="ml-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer">Lembrar de mim</label>
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
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-[var(--text-secondary)]">
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-bold hover:underline" style={{ color: 'var(--green-primary)' }}>
            Cadastre-se
          </Link>
        </div>

        <SocialLogins />
      </AuthLayout>
    </div>
  );
}