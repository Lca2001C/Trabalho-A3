import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import api from '../../services/api';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const PERIODS = [
  { key: 'all',     label: 'Geral'   },
  { key: 'monthly', label: 'Mensal'  },
  { key: 'weekly',  label: 'Semanal' },
];

export default function RankingView() {
  const [period, setPeriod]       = useState('all');
  const [ranking, setRanking]     = useState([]);
  const [myPosition, setMyPos]    = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchRanking = useCallback((p) => {
    setLoading(true);
    setError(null);
    api.get(`/api/rewards/ranking?period=${p}`)
      .then(res => {
        setRanking(res.data.ranking);
        setMyPos(res.data.myPosition);
      })
      .catch(() => setError('Não foi possível carregar o ranking.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRanking(period); }, [period, fetchRanking]);

  const formatPoints = (pts) => `${(pts ?? 0).toLocaleString('pt-BR')} pts`;

  const renderRow = (user) => (
    <div
      key={user.id}
      className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
        user.isMe
          ? 'bg-yellow-50 border border-yellow-100'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className={`w-7 font-bold text-center text-lg ${user.pos <= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
          {MEDALS[user.pos] ?? user.pos}
        </span>
        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden shrink-0">
          <img
            src={user.avatar ?? `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
        <span className={`font-medium ${user.isMe ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
          {user.name}
          {user.isMe && <span className="text-xs text-yellow-600 font-bold ml-1">(você)</span>}
        </span>
      </div>
      <span className={`font-bold text-sm ${user.isMe ? 'text-yellow-700' : 'text-gray-500'}`}>
        {formatPoints(user.points)}
      </span>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Trophy className="text-green-600" /> Ranking de Doadores
        </h1>

        {/* Abas de período — agora funcionais */}
        <div className="flex border-b border-gray-200 mb-6">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              disabled={loading}
              className={`px-6 py-3 font-medium text-sm transition-colors disabled:opacity-50 ${
                period === key
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Legenda de período */}
        {period !== 'all' && !loading && (
          <p className="text-xs text-gray-400 mb-4 -mt-2">
            {period === 'monthly'
              ? 'Pontos acumulados neste mês'
              : 'Pontos acumulados nos últimos 7 dias'}
          </p>
        )}

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center py-8">{error}</p>}

        {!loading && !error && (
          <>
            <div className="space-y-3 mb-4">
              {ranking.map(renderRow)}
            </div>

            {/* Posição fora do top 10 */}
            {myPosition && (
              <>
                <div className="text-center text-gray-300 text-xs py-2">— — —</div>
                {renderRow(myPosition)}
              </>
            )}

            {ranking.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                <Trophy className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                <p className="text-sm">
                  {period === 'all'
                    ? 'Nenhum dado de ranking disponível.'
                    : 'Nenhuma doação registrada neste período.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
