import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, InputField } from '../components/auth/AuthComponents';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Em uma aplicação real, aqui haveria uma chamada para a API
    navigate('/reset-password'); // Simula envio e vai pra próxima tela
  };

  return (
    <div className="bg-[#f4f8f5] text-gray-800 font-sans antialiased overflow-x-hidden min-h-screen flex items-center justify-center p-6">
      <AuthLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Esqueceu sua senha?</h1>
          <p className="text-sm text-gray-500 max-w-[280px] mx-auto leading-relaxed">
            Digite seu email que enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <InputField 
            label="Email" 
            type="email" 
            placeholder="Digite seu email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="w-full py-3.5 mt-2 bg-[#22a055] text-white text-sm font-bold rounded-2xl hover:bg-[#1b8044] transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
            Enviar link
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium">
          <button type="button" onClick={() => navigate('/login')} className="text-gray-500 hover:text-gray-800 transition-colors">
            Voltar para o login
          </button>
        </div>
      </AuthLayout>
    </div>
  );
}
