import React from 'react';
import { UserProfile, Achievement, Coupon } from '../types';
import { ALL_ACHIEVEMENTS } from '../data';
import { Award, CheckCircle, Gift, Info, ShieldAlert, Sparkles, Copy, Trash2, Cpu } from 'lucide-react';

interface AchievementsBonusProps {
  userProfile: UserProfile | null;
  onClearCoupons: () => void;
  onRedeemCoupon: (couponId: string) => void;
  onRequestRegister: () => void;
}

export default function AchievementsBonus({
  userProfile,
  onClearCoupons,
  onRedeemCoupon,
  onRequestRegister
}: AchievementsBonusProps) {

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`🔑 Código copiado al portapapeles: ${code}`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Profile Overview */}
      <div className="bg-neutral-950 border border-cyber-yellow/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md shadow-cyber-yellow/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cyber-yellow/10 border-2 border-cyber-yellow flex items-center justify-center text-cyber-yellow shadow-[0_0_15px_rgba(255,240,0,0.2)]">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-lg text-white">ESTADÍSTICAS DEL AVATAR</h3>
            <p className="font-sans text-xs text-neutral-400">Logros y bonos acumulados en Cd. Victoria</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-neutral-900 px-4 py-2.5 rounded-xl border border-neutral-800 text-center flex-1 md:flex-initial">
            <span className="text-[9px] text-neutral-500 font-mono block mb-1">XP DESTILADA</span>
            <span className="font-orbitron font-extrabold text-cyber-green text-sm flex items-center justify-center gap-1">
              <Cpu className="w-4 h-4" /> {userProfile ? userProfile.xp : 0} XP
            </span>
          </div>

          <div className="bg-neutral-900 px-4 py-2.5 rounded-xl border border-neutral-800 text-center flex-1 md:flex-initial">
            <span className="text-[9px] text-neutral-500 font-mono block mb-1">LOGROS DESBLOQUEADOS</span>
            <span className="font-orbitron font-bold text-cyber-yellow text-sm">
              {userProfile ? userProfile.unlockedAchievements.length : 0} / {ALL_ACHIEVEMENTS.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Achievements list */}
        <div className="space-y-4">
          <h3 className="font-orbitron text-md font-bold text-cyber-cyan border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-cyber-cyan" /> LOGROS Y BADGES (TROFEOS)
          </h3>

          <div className="space-y-3">
            {ALL_ACHIEVEMENTS.map((ach) => {
              const isUnlocked = userProfile?.unlockedAchievements.includes(ach.id);

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                    isUnlocked
                      ? 'bg-neutral-900/60 border-cyber-green/50 shadow-md shadow-cyber-green/5'
                      : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border-2 ${
                    isUnlocked 
                      ? 'bg-cyber-green/10 border-cyber-green text-cyber-green shadow-[0_0_10px_rgba(57,255,20,0.15)]' 
                      : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                  }`}>
                    <Sparkles className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h4 className={`font-orbitron text-xs font-black ${isUnlocked ? 'text-white' : 'text-neutral-500'}`}>
                      {ach.title}
                    </h4>
                    <p className="font-rajdhani text-xs text-neutral-400 leading-snug">{ach.description}</p>
                    {isUnlocked && (
                      <span className="text-[8px] font-press-start text-cyber-green animate-pulse">
                        + DESBLOQUEADO
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coupons and Rewards list */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
            <h3 className="font-orbitron text-md font-bold text-cyber-magenta flex items-center gap-2">
              <Gift className="w-5 h-5 text-cyber-magenta" /> MIS CUPONES DE RAID ({userProfile?.claimedCoupons.length || 0})
            </h3>
            {userProfile && userProfile.claimedCoupons.length > 0 && (
              <button
                onClick={onClearCoupons}
                className="text-red-500 hover:text-red-400 font-mono text-[10px] flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpiar Todo
              </button>
            )}
          </div>

          {!userProfile ? (
            <div className="bg-neutral-950/60 border border-neutral-900 text-center rounded-xl p-6 text-sm text-neutral-500 space-y-4">
              <ShieldAlert className="w-10 h-10 text-cyber-yellow/50 mx-auto animate-pulse" />
              <p>Inicia sesión con tu Gamertag para activar tu inventario de botines de guerra y cupones de descuento.</p>
              <button
                onClick={onRequestRegister}
                className="px-4 py-2 bg-cyber-cyan text-black font-orbitron text-xs font-bold rounded-md"
              >
                Login con Gamertag
              </button>
            </div>
          ) : userProfile.claimedCoupons.length === 0 ? (
            <div className="bg-neutral-950/40 border border-neutral-900 text-center rounded-xl p-8 text-sm text-neutral-500 space-y-3">
              <Info className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="font-sans">No tienes cupones de recompensa en tu inventario de botín activo.</p>
              <p className="text-xs text-neutral-600">
                Completa misiones y modificadores en la pestaña <strong className="text-cyber-cyan">Reservas</strong> para desbloquear postres de Pikachu y 15% de descuentos reales.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userProfile.claimedCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`border-2 border-dashed rounded-xl p-4 relative ${
                    coupon.isUsed 
                      ? 'border-neutral-800 bg-neutral-900/10 opacity-50' 
                      : 'border-cyber-magenta bg-neutral-900/30'
                  }`}
                >
                  <div className="pr-16 space-y-1.5">
                    <span className="text-[9px] font-mono text-pink-300 uppercase px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                      Modificador Completado: {coupon.source}
                    </span>
                    <h4 className="font-orbitron text-sm font-black text-white">{coupon.title}</h4>
                    <p className="font-rajdhani text-xs text-neutral-400">{coupon.description}</p>
                  </div>

                  <div className="absolute top-4 right-4 text-xs font-mono">
                    {coupon.isUsed ? (
                      <span className="text-neutral-500 line-through">CANJEADO</span>
                    ) : (
                      <button
                        onClick={() => onRedeemCoupon(coupon.id)}
                        className="px-2.5 py-1.5 bg-cyber-green text-black font-orbitron font-extrabold text-[10px] rounded hover:bg-emerald-400 shadow-sm"
                      >
                        CANJEAR
                      </button>
                    )}
                  </div>

                  <div className="mt-3.5 pt-3.5 border-t border-dashed border-neutral-800 flex justify-between items-center bg-black/40 p-2.5 rounded">
                    <span className="font-press-start text-[8px] text-cyber-yellow">{coupon.code}</span>
                    {!coupon.isUsed && (
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-1 px-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-700 flex items-center gap-1 text-[10px] font-mono"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar Código
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
