import React from 'react';

// ── StatsCard ────────────────────────────────────────────────────────────────
export function StatsCard({ label, value, showLink, linkText, onClick, isRanking, isPoints, icon }) {
  return (
    <div className="card-base p-5 relative overflow-hidden flex flex-col"
         style={{ borderLeft: '3px solid var(--green-primary)' }}>
      
      <div className="flex flex-col flex-1">
        <span className="text-[11px] uppercase font-bold tracking-wider mb-2" 
              style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        
        <div className="flex items-center gap-3">
          <span className="text-[28px] font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
            {value}
          </span>
          {isRanking && value === '1º' && (
            <span className="text-[11px] font-medium px-[9px] py-[3px] rounded-full"
                  style={{ backgroundColor: 'var(--amber-light)', color: 'var(--amber-text)' }}>
              🏆 Líder atual
            </span>
          )}
        </div>

        {showLink && (
          <button 
            onClick={onClick}
            className="text-[12px] font-medium mt-auto pt-4 flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--green-primary)' }}
          >
            {linkText || 'Ver →'}
          </button>
        )}
      </div>

      {isPoints && (
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full flex items-center justify-center opacity-40 pointer-events-none"
             style={{ backgroundColor: 'var(--green-light)', transform: 'translateY(-50%) scale(1.5)' }}>
          {icon}
        </div>
      )}
    </div>
  );
}

// ── LevelProgress ────────────────────────────────────────────────────────────
export function LevelProgress({ points }) {
  // Regras de nível (Atualizadas)
  const getLevelInfo = (pts) => {
    if (pts < 500) return { label: 'Bronze', next: 'Prata', goal: 500 };
    if (pts < 2000) return { label: 'Prata', next: 'Ouro', goal: 2000 };
    if (pts < 5000) return { label: 'Ouro', next: 'Diamante', goal: 5000 };
    return { label: 'Diamante', next: 'Nível Máximo', goal: pts };
  };

  const level = getLevelInfo(points);
  const progress = Math.min(100, (points / level.goal) * 100);

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-2">
        <span className="px-3 py-1 rounded-full text-[12px] font-bold"
              style={{ backgroundColor: 'var(--green-light)', color: 'var(--green-text)' }}>
          Nível {level.label}
        </span>
        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Próximo nível: {level.next} — {Math.max(0, level.goal - points)} pts restantes
        </span>
      </div>

      <div className="h-[6px] w-full rounded-full overflow-hidden" 
           style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="h-full rounded-full transition-all duration-[600ms] ease-out"
             style={{ 
               width: `${progress}%`, 
               backgroundColor: 'var(--green-primary)' 
             }} />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{points} pts</span>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{level.goal} pts</span>
      </div>
    </div>
  );
}

// ── ImpactCard ───────────────────────────────────────────────────────────────
export function ImpactCard({ label, value, icon, type }) {
  const styles = {
    donations: { bg: 'var(--green-light)', color: 'var(--green-primary)' },
    points: { bg: 'var(--amber-light)', color: 'var(--amber-text)' },
    level: { bg: 'var(--pink-light)', color: 'var(--coral-text)' }
  };

  const currentStyle = styles[type];

  return (
    <div className="rounded-[10px] p-[14px] px-[16px] flex items-center gap-[12px]"
         style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center"
           style={{ backgroundColor: currentStyle.bg, color: currentStyle.color }}>
        {icon}
      </div>
      <div>
        <div className="text-[11px] leading-none mb-1" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </div>
        <div className="text-[16px] font-medium leading-none" 
             style={{ color: type === 'level' ? 'var(--coral-text)' : 'var(--text-primary)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}
