import React from 'react';
import { 
  Heart, 
  Trophy, 
  Gift, 
  TrendingUp, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { StatsCard, LevelProgress, ImpactCard } from './NewUIComponents';

export default function DashboardOverviewV2({ 
  usuario, 
  doacoes, 
  cupons, 
  myPosition, 
  onNewDonation,
  onViewRanking,
  onViewAllDonations
}) {
  
  const totalPontos = usuario?.pontos ?? 0;
  const doacoesRecentes = doacoes.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Grid de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          label="Seus Pontos" 
          value={totalPontos} 
          isPoints={true}
          icon={<Trophy size={20} />}
          showLink={true}
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
          {doacoesRecentes.length > 0 ? (
            doacoesRecentes.map((doacao) => (
              <div key={doacao.id} 
                   className="card-base p-[14px] px-[18px] flex items-center gap-[14px] hover:bg-[var(--bg-secondary)] transition-all cursor-default group">
                <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'var(--green-light)', color: 'var(--green-primary)' }}>
                  <Heart size={18} />
                </div>
                
                <div className="flex-1">
                  <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {doacao.tipo === 'financeira' ? `Doação de R$ ${doacao.valor.toFixed(2)}` : doacao.item}
                  </div>
                  <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                    {doacao.institution?.nome || 'ONG Parceira'}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="text-[14px] font-medium" style={{ color: 'var(--green-dark)' }}>
                    +{doacao.tipo === 'financeira' ? Math.floor(doacao.valor / 2) : 25} pts
                  </div>
                  <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={10} />
                    {new Date(doacao.criadoEm).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 card-base border-dashed" style={{ color: 'var(--text-muted)' }}>
              Nenhuma doação encontrada. Comece agora mesmo!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
