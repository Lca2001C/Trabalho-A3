import React, { useState } from 'react';
import { 
  Leaf, 
  Menu, 
  CheckCircle2, 
  UserCheck, 
  ShieldCheck, 
  UserPlus, 
  Package, 
  Star, 
  Gift, 
  Check, 
  CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [activePage, setActivePage] = useState('inicio');

  return (
    <div className="bg-white text-gray-800 font-sans antialiased overflow-x-hidden min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} />
      
      <main className="flex-grow pt-12 pb-20 lg:pt-20">
        {activePage === 'inicio' && (
          <div className="container mx-auto px-6">
            <Hero setActivePage={setActivePage} />
            <Stats />
          </div>
        )}

        {activePage === 'como-funciona' && (
          <div className="container mx-auto px-6 max-w-4xl py-10 animate-in fade-in duration-300">
            <h1 className="text-3xl font-bold text-[#22a055] mb-8 text-center">Como Doar</h1>
            <HowItWorksCard />
          </div>
        )}

        {activePage === 'beneficios' && (
          <div className="container mx-auto px-6 max-w-3xl py-10 animate-in fade-in duration-300">
            <h1 className="text-3xl font-bold text-[#22a055] mb-8 text-center">Vantagens</h1>
            <BenefitsCard />
          </div>
        )}

        {activePage === 'para-ongs' && (
          <div className="container mx-auto px-6 max-w-3xl py-10 animate-in fade-in duration-300">
            <h1 className="text-3xl font-bold text-[#22a055] mb-8 text-center">Área das ONGs</h1>
            <ForOngsCard />
          </div>
        )}

        {activePage === 'marketplace' && (
          <div className="container mx-auto px-6 text-center py-32 animate-in fade-in duration-300">
            <Gift size={64} className="mx-auto text-[#22a055] mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Marketplace em breve!</h1>
            <p className="text-gray-500">Estamos preparando recompensas incríveis para você.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// --- COMPONENTES EXISTENTES (CABEÇALHO, HERO, STATUS) ---

function Header({ activePage, setActivePage }) {
  const navItems = [
    { id: 'inicio', label: 'Início' },
    { id: 'como-funciona', label: 'Como funciona' },
    { id: 'beneficios', label: 'Benefícios' },
    { id: 'para-ongs', label: 'Para ONGs' },
    { id: 'marketplace', label: 'Marketplace' },
  ];

  return (
    <header className="container mx-auto px-6 py-6 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 text-2xl font-bold text-gray-900 cursor-pointer"
        onClick={() => setActivePage('inicio')}
      >
        <Leaf className="text-[#22a055]" size={28} />
        <span>
          Conecta<span className="text-[#22a055]">Bem</span>
        </span>
      </div>

      <nav className="hidden md:flex gap-8 text-sm font-semibold text-gray-600">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`transition-colors ${
              activePage === item.id ? 'text-[#22a055]' : 'hover:text-[#22a055]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-4 text-sm font-semibold">
        <Link 
          to="/login"
          className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Entrar
        </Link>
        <Link 
          to="/cadastro"
          className="px-5 py-2.5 bg-[#22a055] text-white rounded-xl hover:bg-[#1b8044] transition-colors shadow-sm"
        >
          Cadastrar
        </Link>
      </div>

      <button className="md:hidden text-gray-600 text-2xl hover:text-[#22a055] transition-colors">
        <Menu size={28} />
      </button>
    </header>
  );
}

function Hero({ setActivePage }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
      <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
          Doe hoje,<br />
          <span className="text-[#22a055]">transforme amanhã.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-lg leading-relaxed font-medium">
          Conectamos quem quer doar com quem realmente precisa. Doe itens, faça
          doações financeiras e ganhe recompensas.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setActivePage('como-funciona')}
            className="px-8 py-3.5 bg-[#22a055] text-white text-base font-semibold rounded-xl hover:bg-[#1b8044] transition-colors shadow-md flex justify-center items-center"
          >
            Quero doar
          </button>
          <Link 
            to="/cadastro"
            className="px-8 py-3.5 border-2 border-gray-100 text-gray-700 text-base font-semibold rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-colors flex justify-center items-center"
          >
            Sou uma ONG
          </Link>
        </div>
      </div>

      <div className="w-full lg:w-1/2 relative flex justify-center items-center mt-8 lg:mt-0">
        <div className="absolute inset-0 w-full h-full flex justify-center items-center z-0">
          <svg className="w-full max-w-[550px] text-[#e8f5e9] transform scale-110 lg:scale-125" viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 180C100 180 20 120 20 60C20 30 45 10 70 10C85 10 95 20 100 30C105 20 115 10 130 10C155 10 180 30 180 60C180 120 100 180 100 180Z" />
          </svg>
        </div>
        <div className="relative z-10 w-full max-w-[460px] flex justify-center items-center">
          <DonationIllustration />
        </div>
        <div className="absolute -bottom-6 -right-2 lg:-right-6 z-20 hidden sm:flex items-center justify-center drop-shadow-xl">
          <PlantDecoration />
        </div>
      </div>
    </div>
  );
}

function Stats() {
  return (
    <div className="mt-24 lg:mt-32 pt-12 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-10">
      <div className="flex items-center justify-center lg:justify-start gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-gray-100 text-gray-700 flex items-center justify-center">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">+12K</h3>
          <p className="text-sm text-gray-500 font-medium">Doações realizadas</p>
        </div>
      </div>
      <div className="flex items-center justify-center lg:justify-start gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-gray-100 text-gray-700 flex items-center justify-center">
          <UserCheck size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">+8K</h3>
          <p className="text-sm text-gray-500 font-medium">Doadores cadastrados</p>
        </div>
      </div>
      <div className="flex items-center justify-center lg:justify-start gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-gray-100 text-gray-700 flex items-center justify-center">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">+350</h3>
          <p className="text-sm text-gray-500 font-medium">ONGs parceiras</p>
        </div>
      </div>
    </div>
  );
}


// --- NOVOS COMPONENTES (CARTÕES DE FUNCIONAMENTO E BENEFÍCIOS) ---

function FeaturesSection() {
  return (
    <section className="mt-24 bg-[#f4f8f5] py-20 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <HowItWorksCard />
          <ForOngsCard />
          <BenefitsCard />
        </div>
      </div>
    </section>
  );
}

function HowItWorksCard() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900">Como funciona</h2>
        <p className="text-sm text-gray-500 mt-2 font-medium">Doar nunca foi tão fácil e recompensador</p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8">
        {/* Passo 1 */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-[#e8f5e9] rounded-2xl flex items-center justify-center text-[#22a055] mb-4">
            <UserPlus size={28} />
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">1. Cadastre-se</h4>
          <p className="text-xs text-gray-500 leading-relaxed">Crie sua conta como doador ou ONG.</p>
        </div>

        {/* Passo 2 */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-[#e8f5e9] rounded-2xl flex items-center justify-center text-[#22a055] mb-4">
            <Package size={28} />
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">2. Faça sua doação</h4>
          <p className="text-xs text-gray-500 leading-relaxed">Cada doação gera pontos para ONGs verificadas.</p>
        </div>

        {/* Passo 3 */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-[#e8f5e9] rounded-2xl flex items-center justify-center text-[#22a055] mb-4 relative">
            <Star size={28} />
            <div className="absolute -top-1 -right-1 text-green-500"><Leaf size={12}/></div>
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">3. Ganhe pontos</h4>
          <p className="text-xs text-gray-500 leading-relaxed">Cada doação gera pontos válidos, em...</p>
        </div>

        {/* Passo 4 */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-[#e8f5e9] rounded-2xl flex items-center justify-center text-[#22a055] mb-4">
            <Gift size={28} />
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">4. Troque recompensas</h4>
          <p className="text-xs text-gray-500 leading-relaxed">Use seus pontos no marketplace.</p>
        </div>
      </div>
    </div>
  );
}

function ForOngsCard() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
      <div className="text-center mb-8 relative z-10">
        <h2 className="text-2xl font-bold text-gray-900">Para ONGs</h2>
        <p className="text-sm text-gray-500 mt-2 font-medium max-w-[250px] mx-auto">
          Junte-se a nós e receba doações que transformam vidas.
        </p>
      </div>

      <ul className="space-y-4 text-sm font-medium text-gray-600 relative z-10 flex-grow">
        <li className="flex items-start gap-3">
          <Check size={18} className="text-[#22a055] shrink-0 mt-0.5" />
          <span>Cadastro gratuito</span>
        </li>
        <li className="flex items-start gap-3">
          <Check size={18} className="text-[#22a055] shrink-0 mt-0.5" />
          <span>Receba doações de itens e financeiras</span>
        </li>
        <li className="flex items-start gap-3">
          <Check size={18} className="text-[#22a055] shrink-0 mt-0.5" />
          <span>Acompanhe tudo em um só lugar</span>
        </li>
        <li className="flex items-start gap-3">
          <Check size={18} className="text-[#22a055] shrink-0 mt-0.5" />
          <span>Transparência e segurança</span>
        </li>
      </ul>

      <div className="mt-8 relative z-10">
        <Link to="/cadastro" className="inline-block px-8 py-3.5 bg-[#22a055] text-white text-sm font-semibold rounded-xl hover:bg-[#1b8044] transition-colors text-center shadow-sm">
          Quero cadastrar minha ONG
        </Link>
      </div>

      {/* Ilustração Posicionada */}
      <div className="absolute bottom-0 right-0 w-40 h-40 z-0 opacity-90">
        <OngIllustration />
      </div>
    </div>
  );
}

function BenefitsCard() {
  const [activeTab, setActiveTab] = useState('doadores');

  const donorBenefits = [
    "Faça o bem e ainda ganhe",
    "Acumule pontos",
    "Troque por recompensas",
    "Comprovante para dedução no IR",
    "Acompanhe seu impacto"
  ];

  const ongBenefits = [
    "Visibilidade na plataforma",
    "Gestão de doações simplificada",
    "Campanhas de arrecadação",
    "Acesso a parceiros logísticos",
    "Relatórios de impacto"
  ];

  const currentBenefits = activeTab === 'doadores' ? donorBenefits : ongBenefits;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Leaf className="text-[#22a055]" size={16} />
        <span className="text-sm font-bold text-gray-900">ConectaBem</span>
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Benefícios para todos</h2>

      {/* Abas */}
      <div className="flex border-b border-gray-100 mb-6 mt-2">
        <button 
          onClick={() => setActiveTab('doadores')}
          className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-[3px] ${activeTab === 'doadores' ? 'border-[#22a055] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Doadores
        </button>
        <button 
          onClick={() => setActiveTab('ongs')}
          className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-[3px] ${activeTab === 'ongs' ? 'border-[#22a055] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          ONGs
        </button>
      </div>

      {/* Lista Dinâmica */}
      <ul className="space-y-4 text-sm font-medium text-gray-600 relative z-10 flex-grow">
        {currentBenefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle className="text-gray-400 shrink-0 mt-0.5" size={18} />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      {/* Ilustração Posicionada */}
      <div className="absolute bottom-4 right-4 w-28 h-28 z-0">
         <GiftIllustration />
      </div>
    </div>
  );
}


// --- ILUSTRAÇÕES VETORIAIS ---

function DonationIllustration() {
  return (
    <svg viewBox="0 0 500 500" className="w-full h-auto drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-20, 20)">
            <path d="M120 180 C100 200, 110 250, 140 270 C160 270, 170 240, 170 200 Z" fill="#2C394B"/>
            <rect x="140" y="320" width="22" height="110" rx="6" fill="#1e293b"/>
            <rect x="175" y="320" width="22" height="110" rx="6" fill="#1e293b"/>
            <path d="M130 220 L190 220 L200 340 L130 340 Z" fill="#22A055" rx="10"/>
            <rect x="125" y="210" width="70" height="130" rx="20" fill="#22A055"/>
            <circle cx="160" cy="180" r="28" fill="#fcd5ce"/>
            <path d="M135 180 C135 145, 185 145, 185 180 C185 160, 160 145, 135 180 Z" fill="#2C394B"/>
            <path d="M165 240 L220 280 L280 280" fill="none" stroke="#fcd5ce" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M165 240 L220 280" fill="none" stroke="#22A055" strokeWidth="22" strokeLinecap="round"/>
        </g>
        <g transform="translate(20, 20)">
            <rect x="330" y="320" width="22" height="110" rx="6" fill="#1e293b"/>
            <rect x="370" y="320" width="22" height="110" rx="6" fill="#1e293b"/>
            <path d="M320 220 L380 220 L390 340 L310 340 Z" fill="#f8fafc" rx="10"/>
            <rect x="315" y="210" width="70" height="130" rx="20" fill="#f8fafc"/>
            <circle cx="350" cy="175" r="28" fill="#fcd5ce"/>
            <path d="M322 175 C322 135, 378 135, 378 175 C378 145, 340 140, 322 175 Z" fill="#2C394B"/>
            <path d="M340 240 L290 280 L230 280" fill="none" stroke="#fcd5ce" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M340 240 L290 280" fill="none" stroke="#f8fafc" strokeWidth="22" strokeLinecap="round"/>
        </g>
        <g transform="translate(250, 185) scale(1.1)">
          <circle cx="-15" cy="-20" r="9" fill="#B07D62"/>
          <circle cx="15" cy="-20" r="9" fill="#B07D62"/>
          <circle cx="0" cy="-5" r="22" fill="#D4A373"/>
          <circle cx="0" cy="4" r="9" fill="#FAEDCB"/>
          <circle cx="0" cy="1" r="3" fill="#333"/>
          <circle cx="-8" cy="-8" r="2.5" fill="#333"/>
          <circle cx="8" cy="-8" r="2.5" fill="#333"/>
          <rect x="-16" y="12" width="32" height="35" rx="12" fill="#D4A373"/>
          <rect x="-26" y="16" width="16" height="12" rx="6" fill="#B07D62"/>
          <rect x="10" y="16" width="16" height="12" rx="6" fill="#B07D62"/>
        </g>
        <g transform="translate(0, 10)">
            <rect x="190" y="240" width="120" height="80" fill="#E2B887" rx="4"/>
            <path d="M190 240 L160 200 L210 240 Z" fill="#C89D6C"/>
            <path d="M310 240 L340 200 L290 240 Z" fill="#C89D6C"/>
            <rect x="190" y="240" width="120" height="10" fill="#C89D6C"/>
            <rect x="235" y="250" width="30" height="70" fill="#D4A373" opacity="0.6"/>
        </g>
    </svg>
  );
}

function PlantDecoration() {
  return (
    <svg width="80" height="100" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="bg-white p-2 rounded-xl shadow-md border border-gray-50">
      <path d="M30 50 C10 50, 10 20, 30 10 C30 30, 20 40, 30 50 Z" fill="#22A055"/>
      <path d="M30 50 C50 50, 50 15, 30 5 C30 25, 40 35, 30 50 Z" fill="#1B8044"/>
      <path d="M30 50 C15 50, 0 35, 15 25 C25 25, 25 40, 30 50 Z" fill="#2ED171"/>
      <path d="M30 50 C45 50, 60 35, 45 25 C35 25, 35 40, 30 50 Z" fill="#2ED171"/>
      <path d="M15 50 L45 50 L40 80 L20 80 Z" fill="#f1f5f9"/>
      <rect x="12" y="45" width="36" height="8" rx="3" fill="#e2e8f0"/>
    </svg>
  );
}

function OngIllustration() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {/* Background shape */}
      <circle cx="100" cy="100" r="80" fill="#e8f5e9" opacity="0.8" />
      
      {/* Woman */}
      <g transform="translate(30, 20)">
        {/* Hair Back */}
        <path d="M50 40 C30 60, 40 100, 70 120 C90 120, 100 90, 100 50 Z" fill="#2C394B"/>
        {/* Body */}
        <path d="M45 100 L95 100 L105 200 L35 200 Z" fill="#1e293b" />
        <rect x="40" y="95" width="60" height="70" rx="15" fill="#22A055"/>
        {/* Head */}
        <circle cx="70" cy="50" r="20" fill="#fcd5ce"/>
        {/* Hair Front */}
        <path d="M50 50 C50 25, 90 25, 90 50 C90 35, 70 25, 50 50 Z" fill="#2C394B"/>
        
        {/* Arms holding heart */}
        <path d="M45 110 C30 130, 40 150, 60 145" fill="none" stroke="#fcd5ce" strokeWidth="12" strokeLinecap="round"/>
        <path d="M45 110 C30 130, 40 150, 60 145" fill="none" stroke="#22A055" strokeWidth="16" strokeLinecap="round"/>
        
        <path d="M95 110 C110 130, 100 150, 80 145" fill="none" stroke="#fcd5ce" strokeWidth="12" strokeLinecap="round"/>
        <path d="M95 110 C110 130, 100 150, 80 145" fill="none" stroke="#22A055" strokeWidth="16" strokeLinecap="round"/>
        
        {/* Yellow Heart */}
        <path d="M70 160 C70 160, 40 130, 40 110 C40 95, 55 95, 70 115 C85 95, 100 95, 100 110 C100 130, 70 160, 70 160 Z" fill="#FACC15"/>
      </g>
    </svg>
  );
}

function GiftIllustration() {
  return (
    <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
      {/* Background soft circle */}
      <circle cx="90" cy="90" r="50" fill="#e8f5e9" opacity="0.6"/>
      
      {/* Gift Box */}
      <g transform="translate(10, 40)">
        {/* Box Body */}
        <rect x="30" y="40" width="60" height="50" rx="4" fill="#22A055"/>
        {/* Lid */}
        <rect x="25" y="30" width="70" height="15" rx="3" fill="#1B8044"/>
        {/* Ribbon Vertical */}
        <rect x="52" y="30" width="16" height="60" fill="#146c37"/>
        {/* Bow */}
        <path d="M60 30 C40 10, 20 20, 55 30 Z" fill="#146c37"/>
        <path d="M60 30 C80 10, 100 20, 65 30 Z" fill="#146c37"/>
      </g>
      
      {/* Gold Coin */}
      <g transform="translate(85, 80)">
        <circle cx="20" cy="20" r="22" fill="#FBBF24"/>
        <circle cx="20" cy="20" r="16" fill="#F59E0B"/>
        <path d="M15 25 C13 22, 13 18, 15 15 L18 18 C17 19, 17 21, 18 22 Z" fill="#fff" opacity="0.8"/>
        <path d="M25 25 C27 22, 27 18, 25 15 L22 18 C23 19, 23 21, 22 22 Z" fill="#fff" opacity="0.8"/>
        <rect x="18" y="13" width="4" height="14" fill="#fff" opacity="0.9"/>
      </g>
    </svg>
  );
}
