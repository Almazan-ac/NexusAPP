import React, { useState } from 'react';
import { UserProfile, Coupon } from '../types';
import { Gift, Info, ShieldAlert, Copy, Trash2, Cpu, CheckCircle, Calculator, HelpCircle, ChevronDown, ChevronUp, Landmark, Sparkles } from 'lucide-react';

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

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [budgetLimit, setBudgetLimit] = useState<number>(250);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopyFeedback(code);
    setTimeout(() => {
      setCopyFeedback(null);
    }, 4000);
  };

  // Local static food inventory for budget suggetions
  const RECOMMENDED_ITEMS = [
    { name: "Hamburguesa Godzilla XL 🦖", price: 165, xp: 45, icon: "🍔" },
    { name: "Ramen de Cerdo Estilo Hakata 🍜", price: 140, xp: 35, icon: "🍜" },
    { name: "Alitas Atómicas Chipotle-Miso 🌶️", price: 120, xp: 30, icon: "🍗" },
    { name: "Crepas Celestiales de Nutella 🌸", price: 75, xp: 20, icon: "🥞" },
    { name: "Malteada Elixir de Fresa 🍧", price: 65, xp: 15, icon: "🥤" },
    { name: "Soda de Cura de Manzana Azul 🧪", price: 50, xp: 12, icon: "🧪" }
  ];

  // Simple knapsack / selector for suggested combo within budget limit
  const getSuggestedCombo = (maxBudget: number) => {
    let sorted = [...RECOMMENDED_ITEMS].sort((a, b) => (b.xp / b.price) - (a.xp / a.price)); // Best value first
    let selected: typeof RECOMMENDED_ITEMS = [];
    let totalCost = 0;
    let totalXp = 0;

    for (const item of sorted) {
      if (totalCost + item.price <= maxBudget) {
        selected.push(item);
        totalCost += item.price;
        totalXp += item.xp;
      }
    }
    return { items: selected, totalCost, totalXp };
  };

  const comboResult = getSuggestedCombo(budgetLimit);

  // FAQ Data
  const FAQS = [
    {
      id: 1,
      q: "¿Cómo consigo más puntos de XP para Alquimia?",
      a: "Cada vez que acudes a los negocios afiliados en Cd. Victoria y completas un 'Gamer Raid' (como el Spicy Challenge o el Viernes de Cosplay) o realizas un pedido, el mesero escanea tu ticket y automáticamente tu perfil de Gamertag se actualiza con los puntos de XP que puedes usar en el menú democrático de Alquimia."
    },
    {
      id: 2,
      q: "¿Los cupones de descuento son reales y aplicables?",
      a: "¡Sí! Todos los cupones que consigues son respaldados por la Red de Incubación de Cd. Victoria, Tamaulipas. Copia el código al portapapeles y muéstralo al cajero o cocinero del local afiliado participante para validar tu rebaja."
    },
    {
      id: 3,
      q: "¿Tengo que pagar dinero real dentro de la aplicación?",
      a: "No. Esta es una plataforma educativa y de modelado de mercado local. Toda simulación de pagos con 'Tarjeta MKT' o 'QR Coppel' simula la viabilidad bancaria sin debitar dinero real, sirviendo como un sandbox para jóvenes mercadólogos de Tamaulipas."
    },
    {
      id: 4,
      q: "¿Por qué no se guardan mis cupones anteriores?",
      a: "Para que queden atesorados de manera segura en la nube permanente, te aconsejamos registrar oficialmente tu cuenta a través de Google en la pestaña de PERFIL en lugar de usar sesiones de Invitado."
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto font-sans">
      
      {/* COPIED TOAST / FLOATING FEEDBACK */}
      {copyFeedback && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded-xl flex items-center justify-between text-xs font-mono animate-slideIn shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-2">
            <span className="animate-bounce">🔑</span>
            <span>CÓDIGO DE CUPÓN <strong className="text-white bg-black/40 px-2 py-0.5 rounded border border-neutral-850">{copyFeedback}</strong> COPIADO CON ÉXITO</span>
          </div>
          <button 
            onClick={() => setCopyFeedback(null)} 
            className="text-[10px] bg-black/60 border border-neutral-800 text-slate-400 px-2 py-1 rounded hover:text-white"
          >
            OCULTAR ✕
          </button>
        </div>
      )}
      
      {/* Profile/Coupon Overview Banner with beautiful background image */}
      <div className="relative overflow-hidden border border-cyber-magenta/30 rounded-3xl p-6 shadow-xl shadow-cyber-magenta/5 flex items-center min-h-[160px]">
        {/* Unsplash celebratory box background */}
        <img 
          src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200" 
          alt="Premios y Recompensas" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-transparent"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 w-full">
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
            <div className="bg-neutral-900/90 backdrop-blur px-5 py-3 rounded-xl border border-neutral-800 text-center flex-1 sm:flex-initial min-w-[120px]">
              <span className="text-[9px] text-neutral-500 font-mono block mb-1">XP ACUMULADA</span>
              <span className="font-orbitron font-extrabold text-cyber-green text-md flex items-center justify-center gap-1">
                <Cpu className="w-4 h-4" /> {userProfile ? userProfile.xp : 0} XP
              </span>
            </div>

            <div className="bg-neutral-900/90 backdrop-blur px-5 py-3 rounded-xl border border-neutral-800 text-center flex-1 sm:flex-initial min-w-[120px]">
              <span className="text-[9px] text-neutral-500 font-mono block mb-1">CUPONES DISPONIBLES</span>
              <span className="font-orbitron font-bold text-cyber-cyan text-md">
                {userProfile ? userProfile.claimedCoupons.filter(c => !c.isUsed).length : 0} Activos
              </span>
            </div>
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

      {/* ADDITIONAL HELPFUL OPTIONS AND SERVICES GIVEN TO THE USER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* OPTION A: INTERACTIVE SMART BUDGET SUGGESTOR */}
        <div className="bg-neutral-950 border border-cyber-yellow/40 p-6 rounded-2xl space-y-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Calculator className="w-5 h-5 text-cyber-yellow" />
            <div>
              <h4 className="font-orbitron font-black text-xs text-white uppercase tracking-wider">PLANIFICADOR INTELIGENTE DE COMBOS</h4>
              <p className="text-[10px] text-neutral-400 font-sans">Busca las mejores combinaciones de comida según tu presupuesto en MXN</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400">PRESUPUESTO DISPONIBLE:</span>
              <span className="text-cyber-yellow font-extrabold">${budgetLimit} MXN</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="600" 
              step="10"
              value={budgetLimit} 
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-cyber-yellow"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>$50 MXN (Snacks)</span>
              <span>$600 MXN (Banquete)</span>
            </div>
          </div>

          {/* Result Suggested Items list */}
          <div className="bg-black/40 p-4 rounded-xl border border-neutral-850 space-y-3.5">
            <span className="text-[9px] font-mono bg-cyber-yellow/10 text-cyber-yellow px-2 py-0.5 rounded block w-fit">
              🔥 TRIPLE COMBO RECOMENDADO VALOR-XP
            </span>

            {comboResult.items.length === 0 ? (
              <p className="text-xs text-neutral-500 italic font-mono text-center py-2">Ningún alimento coincide. ¡Sube un poco más tu presupuesto para alimentarte!</p>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {comboResult.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-mono text-neutral-300 border-b border-neutral-900/40 pb-1.5 last:border-0 last:pb-0">
                    <span className="flex items-center gap-1"><span>{it.icon}</span> {it.name}</span>
                    <div className="text-right">
                      <span className="text-white block font-bold">${it.price} MXN</span>
                      <span className="text-cyber-green text-[9px] block">+{it.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs">
              <div className="font-mono">
                <span className="text-neutral-400 block text-[10px]">PRECIO TOTAL:</span>
                <span className="text-white font-extrabold">${comboResult.totalCost} MXN</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-neutral-400 block text-[10px]">XP OBTENIDA:</span>
                <span className="text-cyber-green font-extrabold">+{comboResult.totalXp} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* OPTION B: FAQS & DOCUMENTED HELP GUIDES */}
        <div className="bg-neutral-950 border border-cyber-cyan/30 p-6 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <HelpCircle className="w-5 h-5 text-cyber-cyan" />
            <div>
              <h4 className="font-orbitron font-black text-xs text-white uppercase tracking-wider">MESA DE AYUDA Y SOPORTE</h4>
              <p className="text-[10px] text-neutral-400 font-sans">Dudas frecuentes sobre cupones, mecánicas y el Gastro Hub</p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {FAQS.map((faq) => (
              <div key={faq.id} className="border border-neutral-850 rounded-xl overflow-hidden transition-all bg-neutral-900/30">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full p-3 flex justify-between items-center text-left text-xs font-sans text-neutral-300 hover:text-white font-bold transition-colors select-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  {openFaq === faq.id ? <ChevronUp className="w-4 h-4 text-cyber-cyan flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-cyber-cyan flex-shrink-0" />}
                </button>
                {openFaq === faq.id && (
                  <div className="p-3 pt-0 border-t border-neutral-850/50 text-[11px] text-neutral-400 leading-relaxed font-sans bg-black/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[10px] text-neutral-400 flex items-center gap-2 font-mono">
            <Landmark className="w-4 h-4 text-cyber-green flex-shrink-0" />
            <span>Validez de Red Académica Tamaulipas 🏛️</span>
          </div>
        </div>

      </div>

    </div>
  );
}
