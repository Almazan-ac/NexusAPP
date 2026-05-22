import React, { useState } from 'react';
import { Reservation, GameModifier, UserProfile, Coupon } from '../types';
import { GAME_MODIFIERS } from '../data';
import { Calendar, Users, Clock, Award, CheckCircle2, QrCode, Smartphone, HelpCircle, Gamepad2, Coins, ArrowRight, ShieldCheck, Trophy } from 'lucide-react';

interface ReservationsGamerProps {
  userProfile: UserProfile | null;
  onAddReservation: (res: Reservation) => void;
  onUpdateReservation: (resId: string, status: 'completed' | 'failed', unlockedCoupon?: Coupon, rewardedXp?: number) => void;
  activeReservations: Reservation[];
  onRequestRegister: () => void;
}

export default function ReservationsGamer({
  userProfile,
  onAddReservation,
  onUpdateReservation,
  activeReservations,
  onRequestRegister
}: ReservationsGamerProps) {
  
  // Form State
  const [date, setDate] = useState<string>('2026-05-29');
  const [time, setTime] = useState<string>('20:30');
  const [dinerCount, setDinerCount] = useState<number>(4);
  const [selectedModId, setSelectedModId] = useState<string>(GAME_MODIFIERS[0].id);
  const [customGamertag, setCustomGamertag] = useState<string>('');

  // Simulation Admin State
  const [simulatingResId, setSimulatingResId] = useState<string | null>(null);
  const [triviaAnswers, setTriviaAnswers] = useState<{[key: number]: number}>({});
  const [triviaResult, setTriviaResult] = useState<'success' | 'failed' | null>(null);

  // Active modifier calculation
  const selectedModifier = GAME_MODIFIERS.find(m => m.id === selectedModId) || GAME_MODIFIERS[0];

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const activeNick = userProfile?.gamertag || customGamertag;

    if (!activeNick || activeNick.trim() === '') {
      alert("⚠️ Gamertag requerido. Regístrate en PERFIL o escribe tu Gamertag en el formulario.");
      return;
    }

    const newRes: Reservation = {
      id: "res-" + Math.random().toString(36).substring(2, 9),
      gamertag: activeNick.toUpperCase(),
      date,
      time,
      dinerCount,
      modifierId: selectedModId,
      qrCodeValue: `NEXUS-RES_${Date.now()}_${selectedModId}`,
      isVerified: false,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onAddReservation(newRes);
    alert("🌌 ¡RESERVA CON MODIFICADOR SINDICADA! Puedes ver tu ticket abajo.");
  };

  // Mock trivia questions
  const triviaQuestions = [
    {
      q: "¿En qué legendaria saga RPG de Squaresoft aparece el arma 'Mesa de Autores' o el monstruo 'Cactilio'?",
      options: ["Chrono Trigger", "Dragon Quest", "Final Fantasy"],
      correct: 2
    },
    {
      q: "¿Cuál es el compuesto secreto principal de la Bowser Burger (FIRE) en Nexus Gastro-Bar?",
      options: ["Chile Chiltepín", "Ghost Pepper (Chile Fantasma)", "Salsa Buffalo Sriracha"],
      correct: 1
    },
    {
      q: "En el torneo original de Super Smash Bros. Melee, ¿cuál es el escenario competitivo neutro por excelencia?",
      options: ["FD (Final Destination)", "Dream Land", "Battlefield"],
      correct: 0
    }
  ];

  const handleTriviaSubmit = (resId: string) => {
    let score = 0;
    triviaQuestions.forEach((q, idx) => {
      if (triviaAnswers[idx] === q.correct) {
        score++;
      }
    });

    if (score >= 2) {
      setTriviaResult('success');
      const coupon: Coupon = {
        id: "c-triv-" + Math.random().toString(36).substring(2, 6),
        code: "TRIVIA-CHAMP-15",
        title: "15% OFF Bebidas Geek",
        description: "Recompensa del Cuestionario del Tabernero. Inválido en alimentos.",
        isUsed: false,
        source: "Trivia Geek lograda con éxito"
      };
      // Complete reservation with coupon reward
      onUpdateReservation(resId, 'completed', coupon);
    } else {
      setTriviaResult('failed');
      onUpdateReservation(resId, 'failed');
    }
  };

  const executeManualModifierValidation = (resId: string, modifierId: string) => {
    // Determine reward depending on modifier
    let coupon: Coupon | undefined;
    let xpReward = 0;

    if (modifierId === 'desconexion-red') {
      coupon = {
        id: "c-desc-" + Math.random().toString(36).substring(2, 6),
        code: "FREE-PIKACHU",
        title: "Tarta Pikachu Gratis",
        description: "Postre gratis Cheesecake Pikachu de Obsequio por desconexión de red superada.",
        isUsed: false,
        source: "Hack Desconexión Total"
      };
    } else if (modifierId === 'boss-battle') {
      coupon = {
        id: "c-boss-" + Math.random().toString(36).substring(2, 6),
        code: "BOWSER-BOSS-20",
        title: "20% OFF Cuenta Total",
        description: "Bono por derrotar a la Bowser Burger con picante habanero-mango extra.",
        isUsed: false,
        source: "Bowser Slayer Challenge"
      };
    } else if (modifierId === 'speed-drinking') {
      xpReward = 100;
    }

    onUpdateReservation(resId, 'completed', coupon, xpReward);
    setSimulatingResId(null);
    alert("🏆 ¡MECÁNICA VALIDADA! Recompensa reclamada en LOGROS / PERFIL.");
  };

  return (
    <div className="space-y-8">
      
      {/* Dynamic Selector of modifiers */}
      <div className="bg-neutral-950 border border-cyber-cyan/30 p-6 rounded-2xl shadow-lg">
        <h3 className="font-orbitron font-extrabold text-lg text-cyber-cyan mb-4 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-cyber-cyan text-shadow" /> REGISTRAR NUEVA RAID (RESERVAS)
        </h3>

        <form onSubmit={handleCreateReservation} className="space-y-6">
          
          {/* GamerTag check or input */}
          {!userProfile ? (
            <div className="bg-neutral-900 border border-cyber-yellow/40 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-cyber-yellow font-press-start text-[8px] flex items-center gap-1">
                  ⚠️ INCOGNITO MODE
                </span>
                <p className="text-xs text-neutral-300">
                  No has registrado tu Gamertag. Puedes ingresar uno manual para esta reserva, o conectarte en tu perfil.
                </p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Gamertag Temporal"
                  value={customGamertag}
                  onChange={(e) => setCustomGamertag(e.target.value)}
                  className="bg-black border border-neutral-700 rounded px-3 py-2 text-xs text-white uppercase focus:border-cyber-cyan outline-none w-full md:w-44 font-mono"
                />
                <button
                  type="button"
                  onClick={onRequestRegister}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-white font-orbitron text-[10px] rounded"
                >
                  Registrarse
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-400 flex justify-between items-center">
              <span>LIGADO AL AVATAR ACTIVO: <strong className="text-cyber-green font-mono">{userProfile.gamertag}</strong></span>
              <span className="text-[10px] text-cyber-cyan font-mono">Bono Multijugador Activo</span>
            </div>
          )}

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="font-orbitron text-xs text-neutral-400 block flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyber-cyan" /> FECHA DE ABORDAR
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-cyan font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="font-orbitron text-xs text-neutral-400 block flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyber-cyan" /> HORA DEL ENCUENTRO
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-cyan font-mono"
              >
                {['18:00', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '23:00'].map((slot) => (
                  <option key={slot} value={slot}>{slot} HRS</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-orbitron text-xs text-neutral-400 block flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyber-cyan" /> PLAYERS EN LA MESA
              </label>
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={() => setDinerCount(Math.max(1, dinerCount - 1))}
                  className="w-10 h-10 bg-black/40 text-white rounded-lg flex items-center justify-center hover:bg-neutral-800 font-extrabold"
                >
                  -
                </button>
                <span className="flex-1 text-center font-mono font-bold text-sm text-white">
                  {dinerCount} {dinerCount === 1 ? 'PLAYER' : 'PLAYERS'}
                </span>
                <button
                  type="button"
                  onClick={() => setDinerCount(Math.min(12, dinerCount + 1))}
                  className="w-10 h-10 bg-black/40 text-white rounded-lg flex items-center justify-center hover:bg-neutral-800 font-extrabold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Select Modifier */}
          <div className="space-y-3">
            <span className="font-orbitron text-xs text-neutral-400 block">SELECCIONA UN MODIFICADOR DE MESA (REGLA DE JUEGO):</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GAME_MODIFIERS.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => setSelectedModId(mod.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 text-left space-y-2 transition-all duration-300 ${
                    selectedModId === mod.id
                      ? 'bg-neutral-900 border-cyber-cyan shadow-md shadow-cyber-cyan/15'
                      : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded ${
                      mod.difficulty === 'Hardcore' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                      mod.difficulty === 'Media' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                      'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {mod.difficulty}
                    </span>
                    {selectedModId === mod.id && <div className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse"></div>}
                  </div>
                  <h4 className="font-orbitron text-xs font-bold text-white">{mod.name}</h4>
                  <p className="font-rajdhani text-xs text-neutral-400 line-clamp-2 leading-relaxed">{mod.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card of chosen Mod */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-3 animate-fadeIn">
            <h4 className="font-orbitron text-xs text-cyber-yellow flex items-center gap-1.5 uppercase">
              <Trophy className="w-4 h-4 text-cyber-yellow" /> RECOMPENSA DE QUEST: {selectedModifier.reward}
            </h4>
            <div className="text-xs font-sans text-neutral-300 space-y-1">
              <span className="font-bold text-white font-mono block mb-1">REGLAMENTO DE LA ACTIVIDAD:</span>
              <p className="leading-relaxed text-neutral-400 italic">
                {selectedModifier.rules}
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-cyber-cyan text-black font-orbitron font-extrabold text-xs tracking-wider rounded-xl shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] transform hover:scale-[1.01] transition-all"
          >
            CONFIRMAR Y GENERAR TICKET DE RAID
          </button>
        </form>
      </div>

      {/* Active reservations listing with mock QR codes and Waiter Validation simulation trigger */}
      <div className="space-y-4">
        <h3 className="font-orbitron font-extrabold text-md text-cyber-magenta border-b border-neutral-800 pb-2">
          MIS TICKETS DE RAIDS INICIADAS ({activeReservations.length})
        </h3>

        {activeReservations.length === 0 ? (
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-8 text-center text-neutral-500 text-sm">
            Ninguna raid activa. Programa una mesa con modificador arriba para poner a prueba tu equipo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeReservations.map((res) => {
              const modifier = GAME_MODIFIERS.find(m => m.id === res.modifierId) || GAME_MODIFIERS[0];

              return (
                <div
                  key={res.id}
                  className={`bg-neutral-950 border-3 rounded-2xl overflow-hidden p-5 flex flex-col justify-between gap-5 relative ${
                    res.status === 'completed' ? 'border-cyber-green/50 shadow-md shadow-cyber-green/5' : 
                    res.status === 'failed' ? 'border-red-500/40' : 
                    'border-cyber-cyan/50 shadow-md shadow-cyber-cyan/10'
                  }`}
                >
                  {/* Badge */}
                  <div className="absolute top-4 right-4 text-right">
                    <span className={`text-[10px] font-mono px-2 py-1 rounded inline-block ${
                      res.status === 'completed' ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30' :
                      res.status === 'failed' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                      'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 animate-pulse'
                    }`}>
                      {res.status === 'completed' ? 'COMPLETADO' : res.status === 'failed' ? 'FALLIDO' : 'QUEST ACTIVA'}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500 block mt-1">ID: {res.id}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-neutral-500 text-[10px] font-mono block">MODIFICADOR ESTILO DE JUEGO</span>
                      <h4 className="font-orbitron font-extrabold text-md text-white mt-1 ">{modifier.name}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-y border-neutral-900 py-3 text-xs">
                      <div>
                        <span className="text-neutral-500 block">FECHA DE RAID</span>
                        <span className="font-semibold text-neutral-200 mt-1 block font-mono">{res.date}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">HORARIO</span>
                        <span className="font-semibold text-neutral-200 mt-1 block font-mono">{res.time} HRS</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">PLAYERS</span>
                        <span className="font-semibold text-neutral-200 mt-1 block font-mono">{res.dinerCount} PERSONAS</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">GAMERTAG</span>
                        <span className="font-bold text-cyber-cyan mt-1 block font-mono">{res.gamertag}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                      <QrCode className="w-16 h-16 text-white bg-white p-1 rounded-md" />
                      <div className="space-y-1">
                        <span className="font-bold text-xs block text-white font-mono flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-cyber-green" /> QR DE ENLACE DE MESA
                        </span>
                        <p className="text-[10px] text-neutral-400 leading-snug">
                          Al llegar a Cd. Victoria, muestra este código QR al Staff. El tabernero habilitará tu Modificador de Mesa desde su terminal portátil.
                        </p>
                      </div>
                    </div>
                  </div>

                  {res.status === 'pending' && (
                    <button
                      onClick={() => {
                        setSimulatingResId(res.id);
                        setTriviaAnswers({});
                        setTriviaResult(null);
                      }}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-cyber-yellow border border-cyber-yellow/40 hover:border-cyber-yellow font-press-start text-[8px] rounded transition-all flex items-center justify-center gap-1.5"
                    >
                      <Gamepad2 className="w-4 h-4 animate-bounce" /> SIMULAR ESCANEO DEL MESERO (NPC ADMIN)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADMIN Waiter simulator Modal */}
      {simulatingResId && (() => {
        const actingRes = activeReservations.find(r => r.id === simulatingResId);
        if (!actingRes) return null;
        const actingMod = GAME_MODIFIERS.find(m => m.id === actingRes.modifierId) || GAME_MODIFIERS[0];

        return (
          <div className="fixed inset-0 bg-black/95 z-[3100] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="w-full max-w-xl bg-neutral-950 border-3 border-cyber-yellow rounded-2xl p-6 shadow-2xl shadow-cyber-yellow/10 space-y-6">
              
              <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
                <Smartphone className="w-7 h-7 text-cyber-yellow animate-bounce" />
                <div>
                  <h3 className="font-press-start text-[10px] text-cyber-yellow">TERMINAL PORTÁTIL DEL MESERO</h3>
                  <p className="text-xs text-neutral-400 font-rajdhani mt-1">Simulación del NPC Validador (Cd. Victoria)</p>
                </div>
              </div>

              <div className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-800 space-y-2 text-sm">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider block">ID RESERVA</span>
                  <span className="font-bold text-white font-mono text-xs">{actingRes.id} ({actingRes.gamertag})</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider block">MODIFICADOR LIGADO</span>
                  <span className="font-bold text-cyber-cyan font-orbitron text-sm">{actingMod.name}</span>
                </div>
              </div>

              {/* Specific Simulation Depending on Chosen Game Mod */}
              {actingRes.modifierId === 'desconexion-red' && (
                <div className="space-y-4 font-sans text-sm text-neutral-300">
                  <p className="leading-relaxed">
                    📱 El mesero verifica visualmente que todos los integrantes de la mesa contuvieron su adicción y colocaron sus celulares boca abajo dentro del contenedor durante la cena entera.
                  </p>
                  <p className="text-xs text-cyber-green bg-cyber-green/10 p-3 rounded border border-cyber-green/35">
                    <strong>Premio Activado:</strong> 1x Cupón de Tarta Pikachu (Cheesecake) de Cortesía para la mesa.
                  </p>
                  <button
                    onClick={() => executeManualModifierValidation(actingRes.id, 'desconexion-red')}
                    className="w-full py-3 bg-cyber-green text-black font-orbitron font-extrabold text-xs rounded transition-all shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]"
                  >
                    CONFIRMAR QUE LO LOGRARON (OTORGAR PREMIO)
                  </button>
                </div>
              )}

              {actingRes.modifierId === 'boss-battle' && (
                <div className="space-y-4 font-sans text-sm text-neutral-300">
                  <p className="leading-relaxed">
                    🌶️ El mesero supervisa la mesa de los retadores de Bowser. Confirma que terminaron hasta el último bocado de la Bowser Burger (FIRE) sin soltar lágrimas ni pedir agua/pociones extras para apagar el fuego en menos de 15 minutos.
                  </p>
                  <p className="text-xs text-cyber-green bg-cyber-green/10 p-3 rounded border border-cyber-green/35">
                    <strong>Premio Activado:</strong> Achievement &quot;Bowser Slayer&quot; + 20% descuento de Cuenta Completa.
                  </p>
                  <button
                    onClick={() => executeManualModifierValidation(actingRes.id, 'boss-battle')}
                    className="w-full py-3 bg-cyber-green text-black font-orbitron font-extrabold text-xs rounded transition-all shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]"
                  >
                    CONFIRMAR VICTORIA PICANTE (APROBAR RETO)
                  </button>
                </div>
              )}

              {actingRes.modifierId === 'speed-drinking' && (
                <div className="space-y-4 font-sans text-sm text-neutral-300">
                  <p className="leading-relaxed">
                    🧪 El mesero toma tiempo con el cronómetro de la terminal. El retador toma su poción de corrido y sin respirar, registrando un tiempo récord menor a 5 segundos.
                  </p>
                  <p className="text-xs text-cyber-green bg-cyber-green/10 p-3 rounded border border-cyber-green/35">
                    <strong>Premio Activado:</strong> +100 XP instantáneos sumados para su saldo de Alquimia.
                  </p>
                  <button
                    onClick={() => executeManualModifierValidation(actingRes.id, 'speed-drinking')}
                    className="w-full py-3 bg-cyber-green text-black font-orbitron font-extrabold text-xs rounded transition-all shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]"
                  >
                    COMPLETADO EN TIEMPO RÉCORD (SUMAR +100 XP)
                  </button>
                </div>
              )}

              {actingRes.modifierId === 'trivia-geek' && (
                <div className="space-y-4">
                  <p className="text-xs text-neutral-300 font-sans">
                    El mesero de Cd. Victoria les pregunta en voz alta las siguientes 3 adivinanzas geek de la taberna. Selecciona las respuestas correctas obtenidas por la mesa:
                  </p>

                  <div className="space-y-4">
                    {triviaQuestions.map((q, idx) => (
                      <div key={idx} className="bg-neutral-900 p-3.5 rounded-lg border border-neutral-800 text-xs">
                        <p className="font-semibold text-white mb-2 leading-relaxed">{idx + 1}. {q.q}</p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-2 cursor-pointer text-neutral-300 hover:text-white">
                              <input
                                type="radio"
                                name={`trivia-q-${idx}`}
                                checked={triviaAnswers[idx] === oIdx}
                                onChange={() => setTriviaAnswers(prev => ({ ...prev, [idx]: oIdx }))}
                                className="accent-cyber-cyan"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {triviaResult === 'success' && (
                    <div className="p-3 bg-cyber-green/10 border border-cyber-green/45 rounded-lg text-xs text-cyber-green text-center">
                      🎉 ¡Trivia Superada con Éxito! Copa ganada. Se liberó el cupón de descuento.
                    </div>
                  )}

                  {triviaResult === 'failed' && (
                    <div className="p-3 bg-red-500/10 border border-red-500/45 rounded-lg text-xs text-red-500 text-center">
                      💀 Trivia fallida. Respuesta incorrecta o sin responder. Quest fallida.
                    </div>
                  )}

                  {!triviaResult && (
                    <button
                      onClick={() => handleTriviaSubmit(actingRes.id)}
                      className="w-full py-3 bg-cyber-cyan text-black font-orbitron font-bold text-xs rounded"
                    >
                      CALIFICAR CUESTIONARIO (RESOLVER DE FORMA GRUPAL)
                    </button>
                  )}
                </div>
              )}

              <div className="pt-2 flex gap-3 text-xs">
                {actingRes.modifierId !== 'trivia-geek' && (
                  <button
                    onClick={() => {
                      onUpdateReservation(actingRes.id, 'failed');
                      setSimulatingResId(null);
                      alert("⚠️ Reto marcado como fallido por el mesero.");
                    }}
                    className="flex-1 py-2 bg-red-950/40 border border-red-500/30 text-red-500 hover:bg-neutral-900 rounded font-orbitron"
                  >
                    MARCAR RETO COMO FALLIDO
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setSimulatingResId(null);
                    setTriviaAnswers({});
                    setTriviaResult(null);
                  }}
                  className="flex-1 py-2 bg-neutral-900 text-neutral-400 hover:text-white rounded border border-neutral-800 font-orbitron text-center"
                >
                  SALIR DEL NPC ADMIN
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
