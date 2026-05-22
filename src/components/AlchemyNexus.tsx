import React, { useState } from 'react';
import { VotingOption, UserProfile } from '../types';
import { INITIAL_VOTING_OPTIONS } from '../data';
import { Sparkles, Trophy, ShieldAlert, Cpu, Check, HelpCircle } from 'lucide-react';

interface AlchemyNexusProps {
  userProfile: UserProfile | null;
  onAllocateXp: (optionId: string, xpAmount: number) => void;
  onRequestRegister: () => void;
  globalVotes: { [key: string]: number };
}

export default function AlchemyNexus({ userProfile, onAllocateXp, onRequestRegister, globalVotes }: AlchemyNexusProps) {
  const [selectedOption, setSelectedOption] = useState<VotingOption | null>(null);
  const [xpToVote, setXpToVote] = useState<number>(20);

  // Categories for separation
  const categories = ['Proteína', 'Topping Extra', 'Salsa', 'Pan Especial'] as const;

  // Let's count current votes inside options + local allocated votes
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

  const handleVoteSubmission = () => {
    if (!userProfile) {
      onRequestRegister();
      return;
    }
    if (!selectedOption) return;
    if (xpToVote <= 0) return;
    if (userProfile.xp < xpToVote) {
      alert("⚠️ ¡No tienes suficiente XP para transaccionar este voto! Consigue más XP ordenando del Menú.");
      return;
    }

    // Allocate vote
    onAllocateXp(selectedOption.id, xpToVote);

    setSelectedOption(null);
    alert(`⚡ ¡Alquimia Completada! Has consagrado ${xpToVote} XP a: ${selectedOption.name}`);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-950 to-neutral-900 border-2 border-cyber-magenta/30 rounded-2xl p-6 shadow-md shadow-cyber-magenta/10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-magenta/10 blur-xl rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="font-press-start text-[9px] text-cyber-yellow animate-pulse bg-cyber-yellow/10 px-2 py-1 rounded">MECÁNICA SEMANAL</span>
            <h2 className="font-orbitron font-black text-2xl text-shadow text-white">LA ALQUIMIA DE NEXUS</h2>
            <p className="font-rajdhani text-sm text-neutral-400">
              Gasta tus puntos de <strong className="text-cyber-green">XP</strong> recolectados en consumo real para forjar de manera democrática los ingredientes del próximo menú experimental. Elige sabiamente.
            </p>
          </div>

          <div className="flex-shrink-0 bg-neutral-900/90 border border-cyber-green/30 px-5 py-4 rounded-xl text-center">
            {userProfile ? (
              <>
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <span className="font-press-start text-[8px] text-neutral-400">PLAYER:</span>
                  <span className="font-orbitron text-xs text-cyber-cyan font-bold">{userProfile.gamertag}</span>
                </div>
                <div className="text-2xl font-orbitron font-black text-cyber-green flex items-center justify-center gap-1.5">
                  <Cpu className="w-5 h-5 text-cyber-green" /> {userProfile.xp} <span className="text-xs font-normal">XP</span>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-rajdhani text-neutral-400 block max-w-[150px]">Registra tu Gamertag para empezar a destilar XP</span>
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
          <h3 className="font-orbitron text-md font-bold text-cyber-cyan border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyber-cyan" /> INGREDIENTES EN CONTENSIÓN
          </h3>

          <div className="space-y-8">
            {categories.map((cat) => {
              const catOptions = updatedOptions.filter(o => o.category === cat);
              const maxCatVotes = Math.max(...catOptions.map(o => o.xpAllocated), 1);
              const categoryWinner = getWinnerForCategory(cat);

              return (
                <div key={cat} className="space-y-3 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/60">
                  <div className="flex justify-between items-center bg-neutral-900/50 px-3 py-1.5 rounded-lg border border-neutral-800">
                    <span className="text-xs font-press-start text-neutral-300">{cat.toUpperCase()}</span>
                    {categoryWinner && (
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-cyber-yellow flex items-center gap-1 animate-pulse">
                        <Trophy className="w-3.5 h-3.5 text-cyber-yellow" /> LIDER: {categoryWinner.name.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {catOptions.map((opt) => {
                      const userVoteAllocation = userProfile?.votedIngredients[opt.id] || 0;
                      const hasVotedThis = userVoteAllocation > 0;
                      // Percentage of votes
                      const percentage = Math.round((opt.xpAllocated / maxCatVotes) * 100);

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border transition-all ${
                            selectedOption?.id === opt.id
                              ? 'bg-cyber-magenta/10 border-cyber-magenta'
                              : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex gap-3 justify-between items-start mb-2">
                            <div className="flex gap-3">
                              <img
                                src={opt.image}
                                alt={opt.name}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-lg object-cover border border-neutral-800"
                              />
                              <div>
                                <h4 className="font-sans font-bold text-sm text-white">{opt.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-mono text-neutral-400">Total: {opt.xpAllocated} XP</span>
                                  {hasVotedThis && (
                                    <span className="text-[9px] font-mono text-cyber-green bg-cyber-green/10 border border-cyber-green/30 px-1 rounded flex items-center gap-0.5 animate-fadeIn">
                                      <Check className="w-2.5 h-2.5" /> Aportaste +{userVoteAllocation} XP
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (!userProfile) {
                                  onRequestRegister();
                                  return;
                                }
                                setSelectedOption(opt);
                              }}
                              className={`px-3 py-1 rounded-md font-orbitron text-xs font-bold transition-all ${
                                selectedOption?.id === opt.id
                                  ? 'bg-cyber-magenta text-white shadow-sm'
                                  : 'bg-neutral-900 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black'
                              }`}
                            >
                              Canalizar XP
                            </button>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                            <div
                              style={{ width: `${percentage}%` }}
                              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                                percentage >= 80 ? 'from-cyber-green to-emerald-500' : 'from-cyber-cyan to-blue-500'
                              }`}
                            ></div>
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

        {/* Voting Drawer Panel */}
        <div className="space-y-6">
          <h3 className="font-orbitron text-md font-bold text-cyber-magenta border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyber-magenta" /> PANEL DE TRANSLULACIÓN
          </h3>

          {selectedOption ? (
            <div className="bg-neutral-950 border-2 border-cyber-magenta p-5 rounded-xl space-y-5 shadow-lg shadow-cyber-magenta/10">
              <span className="text-[10px] font-mono bg-neutral-900 text-pink-300 border border-neutral-800 px-2 py-1 rounded">
                DESTILAR XP: {selectedOption.category.toUpperCase()}
              </span>

              <h4 className="font-orbitron text-md text-white font-black">{selectedOption.name}</h4>

              <div className="space-y-3 pt-3 border-t border-neutral-900">
                <label className="text-xs font-mono text-neutral-400 block">Elegir Cantidad de XP a Consagrar:</label>
                
                <div className="flex gap-2">
                  {[20, 50, 100, 250].map((val) => (
                    <button
                      key={val}
                      onClick={() => setXpToVote(val)}
                      className={`flex-1 py-2 rounded font-mono text-xs font-bold border ${
                        xpToVote === val
                          ? 'bg-cyber-magenta border-cyber-magenta text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {val} XP
                    </button>
                  ))}
                </div>

                {/* Custom numeric select */}
                <input
                  type="number"
                  min="5"
                  max={userProfile ? userProfile.xp : 1000}
                  value={xpToVote}
                  onChange={(e) => setXpToVote(Math.max(5, parseInt(e.target.value) || 0))}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono rounded px-3 py-2 text-sm focus:outline-none focus:border-cyber-magenta"
                />
              </div>

              <button
                onClick={handleVoteSubmission}
                className="w-full py-3.5 bg-cyber-magenta text-white font-orbitron font-extrabold text-xs tracking-wider rounded-lg shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:shadow-[0_0_25px_rgba(255,0,255,0.6)] animate-pulse"
              >
                INYECTAR XP VOTOS
              </button>

              <button
                onClick={() => setSelectedOption(null)}
                className="w-full py-2 bg-neutral-900 text-neutral-400 hover:text-white font-orbitron text-xs rounded-lg transition-colors border border-neutral-800"
              >
                CANCELAR
              </button>
            </div>
          ) : (
            <div className="bg-neutral-950/60 border border-neutral-900 p-6 rounded-xl text-center space-y-4 text-sm text-neutral-400">
              <HelpCircle className="w-12 h-12 text-cyber-cyan/50 mx-auto animate-bounce" />
              <p className="font-sans leading-relaxed">
                Selecciona cualquier ingrediente en el catálogo izquierdo para abrir el destilador automático de Alquimia.
              </p>
              <div className="bg-neutral-900 p-3 rounded-lg text-[11px] font-mono text-neutral-500 border border-neutral-800">
                💡 <span className="font-bold">Regla de Seguridad:</span> Tu voto queda grabado con tu Gamertag único. No puedes acumular más XP de la que ganaste consumiendo.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
