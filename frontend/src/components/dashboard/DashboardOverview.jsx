import React from 'react';
import { Gift, User, Trophy, Heart, Users, Package, CircleDollarSign } from 'lucide-react';
import { Card, ImpactStat, RecentDonationItem } from './SharedComponents';

export default function DashboardOverview({ onNewDonation, onViewRanking, onViewAllDonations, usuario, doacoes, myPosition }) {
  const nome = usuario?.nome?.split(' ')[0] || 'Doador';
  const pontos = usuario?.pontos || 0;
  
  const itensDoados = doacoes?.filter(d => d.tipo === 'item').length || 0;
  const doacoesFinanceiras = doacoes?.filter(d => d.tipo === 'financeira').length || 0;
  const totalDoacoes = (doacoes?.length) || 0;

  // Pegar as 3 mais recentes
  const doacoesRecentes = doacoes ? [...doacoes].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)).slice(0, 3) : [];

  const nivelImpacto = pontos < 500 ? 'Bronze' : pontos < 1500 ? 'Prata' : 'Ouro';

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Olá, {nome}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-gray-500 mt-1">Que bom ter você por aqui!</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onNewDonation}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            Nova Doação
          </button>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 cursor-pointer overflow-hidden">
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <p className="text-sm text-gray-500 font-medium mb-2">Saldo de pontos</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-gray-900">{pontos} <span className="text-lg text-gray-500 font-normal">pts</span></span>
            <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
               <Trophy className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <p className="text-sm text-gray-500 font-medium mb-2">Posição no ranking</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-gray-900">{myPosition || '--'}º</span>
          </div>
          <button onClick={onViewRanking} className="text-green-600 text-sm font-medium hover:underline mt-2 inline-block text-left">Ver ranking</button>
        </Card>

        <Card className="flex flex-col justify-between">
          <p className="text-sm text-gray-500 font-medium mb-2">Total de doações</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-gray-900">{totalDoacoes}</span>
          </div>
          <button onClick={onViewAllDonations} className="text-green-600 text-sm font-medium hover:underline mt-2 inline-block text-left">Ver histórico</button>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumo do seu impacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ImpactStat icon={<Gift className="w-5 h-5 text-green-600" />} label="Doações realizadas" value={totalDoacoes} />
          <ImpactStat icon={<Trophy className="w-5 h-5 text-yellow-500" />} label="Total de Pontos" value={pontos} />
          <ImpactStat icon={<Heart className="w-5 h-5 text-red-500" />} label="Nível de Impacto" value={nivelImpacto} />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Doações recentes</h2>
          <button onClick={onViewAllDonations} className="text-green-600 text-sm font-medium hover:underline">Ver todas</button>
        </div>
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {doacoesRecentes.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Nenhuma doação recente encontrada.
              </div>
            ) : (
              doacoesRecentes.map(doacao => (
                <RecentDonationItem 
                  key={doacao.id}
                  icon={doacao.tipo === 'item' ? <Package className="text-gray-600" /> : <Heart className="text-gray-600" />} 
                  title={doacao.tipo === 'item' ? `Doação de ${doacao.item}` : 'Doação financeira'} 
                  org={doacao.ong ? `ONG: ${doacao.ong}` : 'ONG: ConectaBem'} 
                  date={new Date(doacao.criadoEm).toLocaleDateString('pt-BR')} 
                  points={`+${doacao.pontosGerados} pts`} 
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
