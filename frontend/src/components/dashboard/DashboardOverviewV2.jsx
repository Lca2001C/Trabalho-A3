import React from 'react';
import { 
  Heart, 
  Trophy, 
  Gift, 
  TrendingUp, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { StatsCard, LevelProgress, ImpactCard, Skeleton } from './NewUIComponents';

export default function DashboardOverviewV2({ 
  usuario, 
  doacoes, 
  cupons, 
  myPosition, 
  onNewDonation,
  onViewRanking,
  onViewAllDonations,
  navigateTo
}) {
  
  const totalPontos = usuario?.pontos ?? 0;
  const doacoesRecentes = doacoes.slice(0, 4);
  const isLoading = !usuario;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Banner Hero / Impacto */}
      <div className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 shadow-xl text-white">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-emerald-400 opacity-20 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2 text-white">
              Seu impacto importa, {usuario?.nome?.split(' ')[0]}! ✨
            </h2>
            <p className="text-emerald-50 text-[14px] md:text-[15px] leading-relaxed font-medium">
              Cada doação que você faz ajuda a construir um mundo melhor. Acompanhe seu progresso, alcance novas metas e troque seus pontos por recompensas incríveis no nosso Marketplace.
            </p>
            <button 
              onClick={onNewDonation}
              className="mt-6 px-6 py-2.5 rounded-xl bg-white text-emerald-800 text-[14px] font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Fazer uma nova doação
            </button>
          </div>
          
          {/* Card Flutuante de Status */}
          <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4 w-full md:w-auto">
            <div className="bg-emerald-500/30 p-3 rounded-xl shadow-inner">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <p className="text-emerald-100 text-[11px] font-bold uppercase tracking-wider mb-0.5">Pontos Acumulados</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{totalPontos}</span>
                <span className="text-emerald-200 text-sm font-bold">pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Grid de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          label="Seus Pontos" 
          value={totalPontos} 
          isPoints={true}
          icon={<Trophy size={20} />}
          showLink={true}
          onClick={() => navigateTo('marketplace')}
          linkText="Resgatar prêmios →"
        />
        <StatsCard 
          label="Sua Posição" 
          value={`${myPosition}${myPosition !== '--' ? 'º' : ''}`}
          isRanking={true}
          showLink={true}
          onClick={onViewRanking}
          linkText="Ver ranking global →"
        />
        <StatsCard 
          label="Total Doados" 
          value={doacoes.length} 
          showLink={true}
          onClick={onViewAllDonations}
          linkText="Histórico completo →"
        />
      </div>

      {/* Barra de Progresso de Nível */}
      <div className="card-base p-6 mb-8">
        <h3 className="text-[14px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Sua Jornada de Impacto
        </h3>
        <LevelProgress points={totalPontos} />
        
        {/* Sub-grid de Impacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <ImpactCard 
            label="Doações realizadas" 
            value={doacoes.length} 
            type="donations"
            icon={<Heart size={16} />}
          />
          <ImpactCard 
            label="Pontos acumulados" 
            value={totalPontos} 
            type="points"
            icon={<TrendingUp size={16} />}
          />
          <ImpactCard 
            label="Nível de Impacto" 
            value={totalPontos > 500 ? 'Herói' : 'Doador'} 
            type="level"
            icon={<Heart size={16} />}
          />
        </div>
      </div>

      {/* Lista de Doações Recentes */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Doações Recentes
          </h2>
          <button 
            onClick={onViewAllDonations}
            className="text-[12px] font-medium hover:opacity-70 flex items-center gap-1"
            style={{ color: 'var(--green-primary)' }}
          >
            Ver todas <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="card-base p-4 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : doacoesRecentes.length > 0 ? (
            doacoesRecentes.map((doacao) => (
              <div key={doacao.id} 
                   className="card-base p-[14px] px-[18px] flex items-center gap-[14px] hover:bg-[var(--bg-secondary)] transition-all cursor-default group">
                <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                     style={{ 
                       backgroundColor: doacao.status === 'pendente' ? 'var(--bg-tertiary)' : 'var(--green-light)', 
                       color: doacao.status === 'pendente' ? 'var(--text-muted)' : 'var(--green-primary)' 
                     }}>
                   <Heart size={18} className={doacao.status === 'pendente' ? 'opacity-40' : ''} />
                </div>
                
                <div className="flex-1">
                  <div className="text-[13px] font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {doacao.tipo === 'financeira' ? `Doação de R$ ${doacao.valor.toFixed(2)}` : doacao.item}
                    {doacao.status === 'pendente' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase font-bold tracking-tight">Pendente</span>
                    )}
                  </div>
                  <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                    {doacao.institution?.nome || 'ONG Parceira'}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="text-[14px] font-medium" style={{ color: doacao.status === 'pendente' ? 'var(--text-muted)' : 'var(--green-dark)' }}>
                    {doacao.status === 'pendente' ? '(Aguardando)' : `+${doacao.pontosGerados} pts`}
                  </div>
                  <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={10} />
                    {new Date(doacao.criadoEm).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 card-base border-dashed border-2 flex flex-col items-center justify-center bg-[var(--bg-primary)]" 
                 style={{ borderColor: 'var(--border)' }}>
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <Heart size={32} className="text-emerald-200" />
              </div>
              <h3 className="text-[15px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Comece sua jornada de impacto</h3>
              <p className="text-[12px] max-w-[240px] mb-6" style={{ color: 'var(--text-secondary)' }}>
                Você ainda não realizou nenhuma doação. Que tal fazer a sua primeira hoje?
              </p>
              <button 
                onClick={onNewDonation}
                className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-[13px] font-bold shadow-lg shadow-emerald-100 hover:scale-105 transition-transform"
              >
                Fazer uma Doação
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
