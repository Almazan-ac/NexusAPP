import React from 'react';
import { VotingOption, UserProfile } from '../types';
import { INITIAL_VOTING_OPTIONS } from '../data';
import { Sparkles, Trophy, ShieldAlert, Check, HelpCircle } from 'lucide-react';

interface AlchemyNexusProps {
  userProfile: UserProfile | null;
  onVoteIngredient: (optionId: string) => void;
  onRequestRegister: () => void;
  globalVotes: { [key: string]: number };
}

export default function AlchemyNexus({ 
  userProfile, 
  onVoteIngredient, 
  onRequestRegister, 
  globalVotes 
}: AlchemyNexusProps) {
  
  // Categories for separation
  const categories = ['Proteína', 'Topping Extra', 'Salsa', 'Pan Especial'] as const;

  // Track votes based on global state
  const getUpdatedOptions = (): VotingOption[] => {
    return INITIAL_VOTING_OPTIONS.map(opt => {
      const votesVal = globalVotes[opt.id] !== undefined ? globalVotes[opt.id] : opt.xpAllocated;
      return {
        ...opt,
        xpAllocated: votesVal
      };
    });
  };

  const updatedOptions = getUpdatedOptions();

  // Find the winning ingredient of each category
  const getWinnerForCategory = (cat: string) => {
    const catOptions = updatedOptions.filter(o => o.category === cat);
    if (!catOptions.length) return null;
    return catOptions.reduce((prev, current) => (prev.xpAllocated > current.xpAllocated) ? prev : current);
  };

  // Check what the user has voted in each category
  const getVotedItemForCategory = (cat: string): VotingOption | null => {
    if (!userProfile) return null;
    const catOptions = updatedOptions.filter(o => o.category === cat);
    return catOptions.find(o => userProfile.votedIngredients[o.id] === 1) || null;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-950 to-neutral-900 border-2 border-cyber-magenta/30 rounded-2xl p-6 shadow-md shadow-cyber-magenta/10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-magenta/10 blur-xl rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="font-press-start text-[9px] text-cyber-yellow animate-pulse bg-cyber-yellow/10 px-2 py-1 rounded">VOTACIÓN DEMOCRÁTICA</span>
            <h2 className="font-orbitron font-black text-2xl text-shadow text-white">LA ALQUIMIA DE NEXUS</h2>
            <p className="font-sans text-sm text-neutral-400">
              Forja el menú secreto de la semana en Cd. Victoria de manera democrática. Tienes <strong className="text-cyber-cyan">un voto por cuenta para cada categoría</strong> de ingrediente. No cuesta XP votar.
            </p>
          </div>

          <div className="flex-shrink-0 bg-neutral-900/90 border border-cyber-green/30 px-5 py-4 rounded-xl text-center">
            {userProfile ? (
              <>
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <span className="font-press-start text-[8px] text-neutral-400">PLAYER:</span>
                  <span className="font-orbitron text-xs text-cyber-cyan font-bold">{userProfile.gamertag}</span>
                </div>
                <div className="text-xs font-mono text-neutral-400">
                  Votos Activos: <span className="text-cyber-green font-bold">{Object.values(userProfile.votedIngredients).filter(v => v === 1).length} / 4</span>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <span className="text-xs font-rajdhani text-neutral-400 block max-w-[150px]">Registra tu Gamertag para emitir tu voto</span>
                <button
                  onClick={onRequestRegister}
                  className="px-4 py-1.5 bg-cyber-cyan text-black font-orbitron text-xs font-extrabold rounded-md shadow-[0_0_10px_rgba(0,243,255,0.4)]"
                >
                  LOG IN / AVATAR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menú Alquimia Selections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Votaciones en categorías */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-orbitron text-sm font-black text-cyber-cyan border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyber-cyan" /> INGREDIENTES EN CONTENCIÓN ELECTORAL
          </h3>

          <div className="space-y-8">
            {categories.map((cat) => {
              const catOptions = updatedOptions.filter(o => o.category === cat);
              const maxCatVotes = Math.max(...catOptions.map(o => o.xpAllocated), 1);
              const categoryWinner = getWinnerForCategory(cat);
              const userVotedInThisCat = getVotedItemForCategory(cat);

              return (
                <div key={cat} className="space-y-4 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/60">
                  <div className="flex justify-between items-center bg-neutral-900/50 px-4 py-2 rounded-xl border border-neutral-800">
                    <span className="text-xs font-press-start text-neutral-200">{cat.toUpperCase()}</span>
                    {categoryWinner && categoryWinner.xpAllocated > 0 && (
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-cyber-yellow flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-cyber-yellow" /> LIDER: {categoryWinner.name.split(' ')[0]} ({categoryWinner.xpAllocated} v)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {catOptions.map((opt) => {
                      const isVotedByMe = userProfile?.votedIngredients[opt.id] === 1;
                      // Percentage of votes relative to the leader of this category
                      const percentage = Math.round((opt.xpAllocated / maxCatVotes) * 100);

                      return (
                        <div
                          key={opt.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                            isVotedByMe
                              ? 'bg-cyber-magenta/10 border-cyber-magenta shadow-[0_0_15px_rgba(255,0,255,0.05)]'
                              : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <img
                                src={opt.image}
                                alt={opt.name}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-lg object-cover border border-neutral-800 flex-shrink-0"
                              />
                              <div className="space-y-1">
                                <h4 className="font-sans font-bold text-xs text-white leading-tight">{opt.name}</h4>
                                <div className="text-[10px] font-mono text-neutral-400">
                                  <span>{opt.xpAllocated} {opt.xpAllocated === 1 ? 'Voto' : 'Votos'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                                <span>Aceptación</span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden border border-neutral-900">
                                <div
                                  style={{ width: `${percentage}%` }}
                                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                                    isVotedByMe ? 'from-cyber-magenta to-pink-500' : 'from-cyber-cyan to-blue-500'
                                  }`}
                                ></div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-end">
                            <button
                              onClick={() => {
                                if (!userProfile) {
                                  onRequestRegister();
                                  return;
                                }
                                onVoteIngredient(opt.id);
                              }}
                              className={`px-4 py-1.5 rounded-lg font-orbitron text-[10px] font-extrabold tracking-wider transition-all select-none cursor-pointer ${
                                isVotedByMe
                                  ? 'bg-cyber-magenta text-white shadow-sm hover:bg-pink-600'
                                  : 'bg-neutral-900 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black'
                              }`}
                            >
                              {isVotedByMe ? '✓ VOTADO' : 'VOTAR'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Burger Visualizer / Summary */}
        <div className="space-y-6">
          <h3 className="font-orbitron text-sm font-black text-cyber-magenta border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cyber-magenta" /> TU RECETA DE VOTO ELECTIVO
          </h3>

          <div className="bg-neutral-950 border border-cyber-magenta p-5 rounded-2xl space-y-5 shadow-lg shadow-cyber-magenta/5">
            <p className="text-xs font-sans text-neutral-400 leading-relaxed">
              La hamburguesa secreta semanal de Cd. Victoria se forja combinando la opción más votada de cada categoría:
            </p>

            <div className="space-y-3.5 pt-2">
              {categories.map((cat) => {
                const votedOpt = getVotedItemForCategory(cat);
                return (
                  <div key={cat} className="p-3 bg-neutral-900/70 border border-neutral-850 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 block">{cat.toUpperCase()}</span>
                      <span className={`font-orbitron font-extrabold text-xs block truncate max-w-[180px] ${votedOpt ? 'text-white' : 'text-neutral-600 italic'}`}>
                        {votedOpt ? votedOpt.name : 'Sin votación registrada'}
                      </span>
                    </div>
                    {votedOpt ? (
                      <div className="w-8 h-8 rounded-full bg-cyber-green/10 border border-cyber-green text-cyber-green flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-850 text-neutral-600 flex items-center justify-center font-black text-xs">
                        ?
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {userProfile ? (
              <div className="bg-neutral-900 p-3.5 rounded-xl text-[11px] font-mono text-neutral-400 border border-neutral-850 flex items-center gap-2">
                <span>💡</span>
                <p>Puedes cambiar tu voto cuantas veces quieras haciendo clic en “VOTAR” en otra opción de la misma categoría.</p>
              </div>
            ) : (
              <button
                onClick={onRequestRegister}
                className="w-full py-3 bg-cyber-cyan text-black font-orbitron font-extrabold text-xs tracking-wider rounded-lg shadow-md hover:shadow-cyan-400/20 transition-all select-none cursor-pointer"
              >
                REGÍSTRATE PARA EMITIR VOTOS
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
