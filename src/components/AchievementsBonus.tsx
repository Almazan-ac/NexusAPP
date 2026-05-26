import React from 'react';
import { UserProfile, Coupon } from '../types';
import { Gift, Info, ShieldAlert, Copy, Trash2, Cpu, CheckCircle } from 'lucide-react';

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
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Profile/Coupon Overview Banner */}
      <div className="bg-neutral-950 border border-cyber-magenta/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md shadow-cyber-magenta/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cyber-magenta/10 border-2 border-cyber-magenta flex items-center justify-center text-cyber-magenta shadow-[0_0_15px_rgba(255,0,255,0.2)]">
            <Gift className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-lg text-white">MIS RECOMPENSAS Y CUPONES</h3>
            <p className="font-sans text-xs text-neutral-400">Canjea tus botines ganados al completar misiones en el restaurante</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-neutral-900 px-5 py-3 rounded-xl border border-neutral-800 text-center flex-1 sm:flex-initial min-w-[120px]">
            <span className="text-[9px] text-neutral-500 font-mono block mb-1">XP ACUMULADA</span>
            <span className="font-orbitron font-extrabold text-cyber-green text-md flex items-center justify-center gap-1">
              <Cpu className="w-4 h-4" /> {userProfile ? userProfile.xp : 0} XP
            </span>
          </div>

          <div className="bg-neutral-900 px-5 py-3 rounded-xl border border-neutral-800 text-center flex-1 sm:flex-initial min-w-[120px]">
            <span className="text-[9px] text-neutral-500 font-mono block mb-1">CUPONES DISPONIBLES</span>
            <span className="font-orbitron font-bold text-cyber-cyan text-md">
              {userProfile ? userProfile.claimedCoupons.filter(c => !c.isUsed).length : 0} Activos
            </span>
          </div>
        </div>
      </div>

      {/* Main Coupons Container */}
      <div className="bg-neutral-950/40 border border-neutral-900 p-6 rounded-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
          <h3 className="font-orbitron font-black text-sm text-cyber-cyan flex items-center gap-2">
            <Gift className="w-5 h-5 text-cyber-cyan" /> COFRE DE CUPONES DE RAID ({userProfile?.claimedCoupons.length || 0})
          </h3>
          {userProfile && userProfile.claimedCoupons.length > 0 && (
            <button
              onClick={onClearCoupons}
              className="text-red-500 hover:text-red-400 font-mono text-xs flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Limpiar Todo
            </button>
          )}
        </div>

        {!userProfile ? (
          <div className="bg-neutral-950/60 border border-neutral-900 text-center rounded-2xl p-10 text-sm text-neutral-500 space-y-4">
            <ShieldAlert className="w-12 h-12 text-cyber-yellow/50 mx-auto animate-pulse" />
            <p className="max-w-md mx-auto">Reclama tu Gamertag en el perfil para poder atesorar cupones de comidas y bebidas gratis reales de Cd. Victoria.</p>
            <button
              onClick={onRequestRegister}
              className="px-5 py-2.5 bg-cyber-cyan text-black font-orbitron text-xs font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.01]"
            >
              Iniciar Sincronización
            </button>
          </div>
        ) : userProfile.claimedCoupons.length === 0 ? (
          <div className="bg-neutral-950/40 border border-neutral-900 text-center rounded-2xl p-12 text-sm text-neutral-400 space-y-4 max-w-md mx-auto">
            <Info className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="font-sans font-medium text-white text-md">Tu cofre de recompensas está vacío</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Reserva una mesa con desafíos de gaming en la pestaña de <strong className="text-cyber-magenta">Raids</strong>. El mesero del local las validará para otorgarte cupones reales directo a esta sección.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userProfile.claimedCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`border-2 border-dashed rounded-2xl p-5 relative transition-all ${
                  coupon.isUsed 
                    ? 'border-neutral-900 bg-neutral-950/20 opacity-40' 
                    : 'border-cyber-magenta bg-neutral-900/30 shadow-[0_0_15px_rgba(255,0,255,0.03)]'
                }`}
              >
                <div className="pr-16 space-y-2">
                  <span className="text-[10px] font-mono text-pink-300 uppercase px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 block w-fit">
                    Misión exitosa: {coupon.source}
                  </span>
                  <h4 className="font-orbitron text-sm font-black text-white">{coupon.title}</h4>
                  <p className="font-rajdhani text-xs text-neutral-400 leading-relaxed">{coupon.description}</p>
                </div>

                <div className="absolute top-5 right-5 text-xs font-mono">
                  {coupon.isUsed ? (
                    <span className="text-neutral-500 font-bold border border-neutral-900 bg-neutral-950 px-2.5 py-1 rounded">CANJEADO</span>
                  ) : (
                    <button
                      onClick={() => onRedeemCoupon(coupon.id)}
                      className="px-3 py-1.5 bg-cyber-green text-black font-orbitron font-extrabold text-[10px] rounded-lg hover:bg-emerald-400 shadow-sm transition-all"
                    >
                      CANJEAR
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-neutral-800 flex justify-between items-center bg-black/40 p-3 rounded-xl">
                  <span className="font-mono text-xs font-bold text-cyber-yellow tracking-wider">{coupon.code}</span>
                  {!coupon.isUsed && (
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="p-1 px-2.5 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded border border-neutral-700 flex items-center gap-1.5 text-[10px] font-mono transition-colors"
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
  );
}
