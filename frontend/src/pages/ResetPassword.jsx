import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, PasswordInputField } from '../components/auth/AuthComponents';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Em uma aplicação real, aqui haveria uma chamada para a API
    navigate('/login'); // Simula sucesso e volta pro login
  };

  return (
    <div className="bg-[#f4f8f5] text-gray-800 font-sans antialiased overflow-x-hidden min-h-screen flex items-center justify-center p-6">
      <AuthLayout>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Redefinir sua senha</h1>
          <p className="text-sm text-gray-500">Crie uma nova senha para sua conta.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <PasswordInputField 
            label="Nova senha" 
            placeholder="Digite sua nova senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordInputField 
            label="Confirmar nova senha" 
            placeholder="Confirme sua nova senha" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="w-full py-3.5 mt-2 bg-[#22a055] text-white text-sm font-bold rounded-2xl hover:bg-[#1b8044] transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
            Redefinir senha
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
