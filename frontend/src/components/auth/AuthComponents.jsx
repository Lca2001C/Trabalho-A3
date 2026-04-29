import React, { useState } from 'react';
import { Leaf, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AuthLayout({ children }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white max-w-md w-full rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-in slide-in-from-bottom-4 duration-500 relative">
      {/* Botão de voltar discreto (Mobile/UX) */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Logótipo */}
      <div 
        className="flex items-center justify-center gap-2 text-xl font-bold text-gray-900 mb-8 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <Leaf className="text-[#22a055]" size={24} />
        <span>Conecta<span className="text-[#22a055]">Bem</span></span>
      </div>

      {children}
    </div>
  );
}

export function InputField({ label, type = "text", placeholder, value, onChange, id, maxLength, required }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-xs font-bold text-gray-800 ml-1">{label}</label>
      <input 
        id={id}
        type={type} 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#22a055] focus:ring-1 focus:ring-[#22a055] transition-all text-sm bg-gray-50/50 hover:bg-gray-50 placeholder-gray-400"
      />
    </div>
  );
}

export function PasswordInputField({ label, placeholder, value, onChange, id, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5 mb-4 relative">
      <label className="text-xs font-bold text-gray-800 ml-1">{label}</label>
      <div className="relative">
        <input 
          id={id}
          type={show ? "text" : "password"} 
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#22a055] focus:ring-1 focus:ring-[#22a055] transition-all text-sm bg-gray-50/50 hover:bg-gray-50 placeholder-gray-400"
        />
        <button 
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export function SocialLogins() {
  return (
    <div className="mt-8 text-center">
      <p className="text-xs text-gray-500 mb-4 relative before:content-[''] before:block before:w-[30%] before:h-px before:bg-gray-200 before:absolute before:left-0 before:top-1/2 after:content-[''] after:block after:w-[30%] after:h-px after:bg-gray-200 after:absolute after:right-0 after:top-1/2">
        ou entre com
      </p>
      <div className="flex justify-center gap-4">
        <button type="button" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </button>
        <button type="button" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.562H7.078V12.073H10.125V9.412C10.125 6.405 11.916 4.75 14.657 4.75C15.97 4.75 17.344 4.984 17.344 4.984V7.938H15.83C14.339 7.938 13.875 8.863 13.875 9.81V12.073H17.203L16.671 15.562H13.875V24C19.612 23.094 24 18.1 24 12.073Z" fill="#1877F2"/>
            <path d="M16.671 15.562L17.203 12.073H13.875V9.81C13.875 8.863 14.339 7.938 15.83 7.938H17.344V4.984C17.344 4.984 15.97 4.75 14.657 4.75C11.916 4.75 10.125 6.405 10.125 9.412V12.073H7.078V15.562H10.125V24C10.741 24.097 11.366 24.148 12 24.148C12.634 24.148 13.259 24.097 13.875 24V15.562H16.671Z" fill="white"/>
          </svg>
        </button>
        <button type="button" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.59 10.59C16.48 7.37 19.23 5.76 19.36 5.67C17.84 3.44 15.44 3.1 14.65 3.01C12.7 2.81 10.82 4.15 9.82 4.15C8.83 4.15 7.29 3.04 5.68 3.07C3.59 3.1 1.66 4.29 0.58 6.18C-1.63 10.03 0.02 15.72 2.16 18.82C3.21 20.33 4.45 22.03 6.08 21.97C7.66 21.91 8.27 20.95 10.18 20.95C12.08 20.95 12.63 21.97 14.28 21.94C15.96 21.91 17.03 20.4 18.06 18.88C19.27 17.11 19.77 15.38 19.8 15.29C19.76 15.27 16.69 14.1 16.59 10.59Z"/>
            <path d="M13.24 1.95C14.12 0.89 14.7 23.36 14.7 23.36C14.7 23.36 13.92 23.36 12.92 23.36C12.04 23.36 10.97 23.36 10.97 23.36C10.97 23.36 11.55 23.36 12.43 23.36Z" fill="none"/>
            <path d="M13.25 1.95C14.12 0.89 14.71 -0.01 14.71 -0.01C14.71 -0.01 13.93 -0.01 12.93 -0.01C12.04 -0.01 10.97 0.87 10.97 0.87C10.97 0.87 11.56 1.95 12.44 1.95H13.25Z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
