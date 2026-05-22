import React, { useState } from 'react';
import { MenuItem, Reservation, RestaurantOrder } from '../types';
import { INITIAL_MENU_ITEMS, GAME_MODIFIERS } from '../data';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Layers,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Award,
  Calendar,
  Lock,
  Unlock,
  Package,
  Sliders,
  UtensilsCrossed,
  Tv
} from 'lucide-react';

interface OwnerDashboardProps {
  reservations: Reservation[];
  onUpdateReservation: (
    resId: string,
    status: 'completed' | 'failed',
    unlockedCoupon?: any,
    rewardedXp?: number
  ) => void;
  orders: RestaurantOrder[];
  onChangeOrderStatus: (orderId: string, status: 'completed' | 'cancelled') => void;
  menuItems: MenuItem[];
  onUpdateMenuItemPrice: (itemId: string, newPrice: number) => void;
  onResetVotes: () => void;
  globalVotes: { [key: string]: number };
}

export default function OwnerDashboard({
  reservations,
  onUpdateReservation,
  orders,
  onChangeOrderStatus,
  menuItems,
  onUpdateMenuItemPrice,
  onResetVotes,
  globalVotes
}: OwnerDashboardProps) {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(
    () => localStorage.getItem('nexus_admin_unlocked') === 'true'
  );
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'reservations' | 'alchemy' | 'menu'>('orders');

  // Input states for price updates
  const [priceEditingId, setPriceEditingId] = useState<string | null>(null);
  const [tempPriceString, setTempPriceString] = useState<string>('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsAdminUnlocked(true);
      localStorage.setItem('nexus_admin_unlocked', 'true');
      setPinError('');
      setPinInput('');
    } else {
      setPinError('⚡ ACCESO DENEGADO: FIRMA DE SEGURIDAD INVÁLIDA');
      setPinInput('');
    }
  };

  const handleLock = () => {
    setIsAdminUnlocked(false);
    localStorage.removeItem('nexus_admin_unlocked');
  };

  // Telemetry Calculations
  const totalSales = orders
    .filter(o => o.status === 'completed')
    .reduce((acc, o) => acc + o.price, 0);

  const pendingSales = orders
    .filter(o => o.status === 'pending')
    .reduce((acc, o) => acc + o.price, 0);

  const xpIssued = orders
    .filter(o => o.status === 'completed')
    .reduce((acc, o) => acc + o.xpReward, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const pastOrders = orders.filter(o => o.status !== 'pending');

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  
  // Total votes in alchemy
  const totalVotesCount = Object.values(globalVotes).reduce((a, b) => a + b, 0);

  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 animate-fadeIn">
        <div className="bg-neutral-950 border-3 border-cyber-magenta p-8 rounded-3xl shadow-2xl shadow-cyber-magenta/15 space-y-6 text-center">
          <div className="w-16 h-16 bg-cyber-magenta/15 border border-cyber-magenta rounded-full mx-auto flex items-center justify-center text-cyber-magenta shadow-[0_0_20px_rgba(255,0,255,0.3)]">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h2 className="font-orbitron font-black text-xl text-white tracking-widest text-shadow-sm">
              TERMINAL DE ACCESO DIRECTORES
            </h2>
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Control de Operaciones Gastro-Nexus
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <label className="text-left block text-[10px] font-mono text-neutral-400 tracking-wider">
                INGRESE EL PIN DE MANDO DE CD. VICTORIA:
              </label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PRO TIP: PIN ES 1234"
                className="w-full bg-neutral-900 border-2 border-neutral-800 rounded-xl px-4 py-3.5 text-center text-white font-mono tracking-widest focus:outline-none focus:border-cyber-magenta focus:ring-1 focus:ring-cyber-magenta text-lg"
              />
            </div>

            {pinError && (
              <p className="text-[10px] font-mono text-cyber-magenta animate-pulse text-center leading-relaxed">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-cyber-magenta text-white font-orbitron font-extrabold text-xs tracking-widest rounded-xl shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:shadow-[0_0_25px_rgba(255,0,255,0.6)] transform hover:scale-[1.01] transition-all cursor-pointer"
            >
              AUTENTICAR FIRMA
            </button>
          </form>

          <p className="text-[10px] text-neutral-500 font-mono text-center pt-2">
            NEXUS OS Server v3.59 // CD. VICTORIA INDEPENDENCIA
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-950 border border-neutral-800 p-5 rounded-2xl shadow-lg relative">
        <div className="absolute top-0 left-0 bg-cyber-yellow text-black font-press-start text-[7px] font-bold px-2.5 py-0.5 rounded-br-md">
          ADMIN MODE
        </div>
        <div className="space-y-1 pt-1">
          <h2 className="font-orbitron font-black text-xl text-cyber-yellow flex items-center gap-2">
            <Unlock className="w-5 h-5 text-cyber-yellow" /> PANEL DEL PROPIETARIO (CMD ROOM)
          </h2>
          <p className="text-neutral-400 text-xs">
            Gestión en tiempo real de pedidos de comida, reservaciones, inventario, precios y alquimia.
          </p>
        </div>

        <button
          onClick={handleLock}
          className="px-4 py-2 bg-neutral-900 border border-cyber-magenta text-cyber-magenta hover:bg-neutral-850 hover:text-white rounded-xl text-xs font-orbitron transition-all"
        >
          CERRAR TERMINAL
        </button>
      </div>

      {/* Telemetry Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-neutral-950 border border-neutral-800 p-4.5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[8px] font-mono text-neutral-500">Caja Registradora</div>
          <div className="w-11 h-11 bg-cyber-green/10 border border-cyber-green rounded-xl flex items-center justify-center text-cyber-green">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-neutral-400 text-[10px] font-mono block">INGRESOS NETOS REALES</span>
            <span className="font-orbitron font-extrabold text-lg text-white">$ {totalSales} MXN</span>
            {pendingSales > 0 && (
              <span className="text-[10px] text-cyber-yellow block font-mono">+$ {pendingSales} pendientes</span>
            )}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-neutral-950 border border-neutral-800 p-4.5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[8px] font-mono text-neutral-500">Logística de Cocina</div>
          <div className="w-11 h-11 bg-cyber-cyan/10 border border-cyber-cyan rounded-xl flex items-center justify-center text-cyber-cyan">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-neutral-400 text-[10px] font-mono block">PEDIDOS DE COMIDA</span>
            <span className="font-orbitron font-extrabold text-lg text-white">
              {pendingOrders.length} <span className="text-xs text-neutral-400 font-medium">En Espera</span>
            </span>
            <span className="text-[10px] text-neutral-500 block font-mono">
              {pastOrders.length} atendidos con éxito
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-neutral-950 border border-neutral-800 p-4.5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[8px] font-mono text-neutral-500">Reservaciones</div>
          <div className="w-11 h-11 bg-cyber-magenta/10 border border-cyber-magenta rounded-xl flex items-center justify-center text-cyber-magenta">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-neutral-400 text-[10px] font-mono block">MESAS CON RETOS GAMER</span>
            <span className="font-orbitron font-extrabold text-lg text-white">
              {pendingReservations.length} <span className="text-xs text-neutral-400 font-medium">Por Validar</span>
            </span>
            <span className="text-[10px] text-neutral-500 block font-mono">
              De {reservations.length} totales en historial
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-neutral-950 border border-neutral-800 p-4.5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[8px] font-mono text-neutral-500">Economía Local</div>
          <div className="w-11 h-11 bg-cyber-yellow/10 border border-cyber-yellow rounded-xl flex items-center justify-center text-cyber-yellow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-neutral-400 text-[10px] font-mono block">XP ENTREGADA AL CLIENTE</span>
            <span className="font-orbitron font-extrabold text-lg text-cyber-green">{xpIssued} XP GIMIENDO</span>
            <span className="text-[10px] text-neutral-500 block font-mono">
              {totalVotesCount} XP spent in votes
            </span>
          </div>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-lg p-5">
        <div className="flex overflow-x-auto gap-2 border-b border-neutral-800 pb-4 mb-6">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
              activeSubTab === 'orders'
                ? 'bg-cyber-cyan text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                : 'bg-neutral-900 leading-snug text-neutral-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" /> Cocina y Pedidos ({pendingOrders.length})
          </button>

          <button
            onClick={() => setActiveSubTab('reservations')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
              activeSubTab === 'reservations'
                ? 'bg-cyber-magenta text-white shadow-[0_0_15px_rgba(255,0,255,0.3)]'
                : 'bg-neutral-900 leading-snug text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Validar Quests de Mesas ({pendingReservations.length})
          </button>

          <button
            onClick={() => setActiveSubTab('menu')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
              activeSubTab === 'menu'
                ? 'bg-cyber-yellow text-black shadow-[0_0_15px_rgba(244,180,26,0.3)]'
                : 'bg-neutral-900 leading-snug text-neutral-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" /> Gestor de Menú y Precios
          </button>

          <button
            onClick={() => setActiveSubTab('alchemy')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
              activeSubTab === 'alchemy'
                ? 'bg-cyber-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                : 'bg-neutral-900 leading-snug text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" /> Alquimia Electoral
          </button>
        </div>

        {/* Tab 1: Orders Cuisine */}
        {activeSubTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-neutral-900/40 p-4.5 rounded-2xl border border-neutral-900">
              <div>
                <h3 className="font-orbitron font-black text-sm text-cyber-cyan flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-cyber-cyan rounded-full animate-pulse"></span> COLA DE ESPERA EN COCINA (PEDIDOS REALES)
                </h3>
                <p className="text-neutral-400 text-xs mt-1 font-rajdhani">
                  Los clientes ordenan desde el menú. Atiende y entrega las comidas calientes.
                </p>
              </div>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 font-sans text-sm bg-neutral-900/20 border border-dashed border-neutral-900 rounded-2xl space-y-2">
                <p>🍳 No hay ningún pedido pendiente de hamburguesas o bebidas.</p>
                <p className="text-xs text-neutral-600">Simula el pedido del cliente dirigiéndote a la sección de INDUMENTARIA/MENÚ e ingresa un pedido.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingOrders.map(order => (
                  <div key={order.id} className="bg-neutral-900/60 border border-cyber-cyan/35 p-4 rounded-2xl relative space-y-4 shadow-sm hover:border-cyber-cyan/70 transition-colors">
                    <span className="absolute top-3 right-3 text-[9px] font-mono text-neutral-400 bg-neutral-950 border border-neutral-850 px-2 py-0.5 rounded">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-cyber-yellow bg-cyber-yellow/15 px-2 py-0.5 rounded block w-fit">
                        PENDIENTE
                      </span>
                      <h4 className="font-orbitron font-black text-sm text-white mt-1.5">{order.itemName}</h4>
                      <p className="text-[11px] font-mono text-neutral-400">
                        Ordenar por Avatar: <strong className="text-cyber-cyan uppercase">{order.gamertag}</strong>
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-neutral-850">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-mono block">MONTO COBRADO</span>
                        <span className="font-orbitron font-extrabold text-sm text-cyber-green">$ {order.price} MXN</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onChangeOrderStatus(order.id, 'completed')}
                          className="px-3 py-1.5 bg-cyber-green text-black hover:bg-emerald-400 font-orbitron font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> ENTREGAR
                        </button>
                        <button
                          onClick={() => onChangeOrderStatus(order.id, 'cancelled')}
                          className="px-3 py-1.5 bg-neutral-950 hover:bg-red-900/40 text-neutral-400 hover:text-red-500 border border-neutral-800 font-orbitron font-semibold text-[10px] rounded-lg transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> REBOTAR
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List of past orders */}
            {pastOrders.length > 0 && (
              <div className="space-y-3 pt-4.5 border-t border-neutral-900">
                <h4 className="font-orbitron font-bold text-xs text-neutral-400">HISTORIAL DE TRANSACCIONES HOY</h4>
                <div className="bg-neutral-900/20 border border-neutral-900 rounded-2xl overflow-hidden divide-y divide-neutral-900">
                  {pastOrders.slice(0, 10).map((oldOrder) => (
                    <div key={oldOrder.id} className="p-3 text-xs flex justify-between items-center font-mono">
                      <div className="space-y-0.5">
                        <p className="text-white font-rajdhani font-semibold text-xs">{oldOrder.itemName}</p>
                        <p className="text-[10px] text-neutral-500">
                          Player: <span className="text-neutral-300">{oldOrder.gamertag}</span> | {new Date(oldOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-neutral-400 font-bold">$ {oldOrder.price} MXN</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          oldOrder.status === 'completed' 
                            ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {oldOrder.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reservations verification and quests */}
        {activeSubTab === 'reservations' && (
          <div className="space-y-6">
            <div className="bg-neutral-900/40 p-4.5 rounded-2xl border border-neutral-900">
              <h3 className="font-orbitron font-black text-sm text-cyber-magenta flex items-center gap-2">
                <Award className="w-5 h-5 text-cyber-magenta" /> ESTACIÓN DE ARBITRAJE DE JEFES EN MESA
              </h3>
              <p className="text-neutral-400 text-xs mt-1 font-rajdhani">
                Cuando un cliente completa un reto físico en el local (como trivia o comer sin tomar agua), puedes verificar aquí su estado para otorgarle sus Cupones de Logro y XP reales.
              </p>
            </div>

            {pendingReservations.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 font-sans text-sm bg-neutral-900/20 border border-dashed border-neutral-900 rounded-2xl">
                🔮 Faltan reservaciones por validar. Los clientes pueden darlas de alta en la pestaña de &apos;Raids&apos;.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingReservations.map((res) => {
                  const modifier = GAME_MODIFIERS.find(m => m.id === res.modifierId);
                  
                  return (
                    <div key={res.id} className="bg-neutral-900/40 border border-neutral-800 p-5 rounded-2xl space-y-4 hover:border-cyber-magenta/40 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-cyber-magenta bg-cyber-magenta/10 px-2 py-0.5 rounded uppercase">
                            MODIFIER: {modifier?.name || res.modifierId}
                          </span>
                          <h4 className="font-orbitron font-black text-md text-white mt-2">Mesa para {res.dinerCount} personas</h4>
                          <p className="text-xs font-mono text-neutral-400 mt-1">
                            Reservó: <strong className="text-cyber-cyan uppercase">{res.gamertag}</strong>
                          </p>
                          <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                            Fecha sugerida: {res.date} a las {res.time}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono bg-neutral-950 border border-neutral-800 px-2 py-1 rounded">
                          ID: {res.id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="bg-black/40 p-3 rounded-xl border border-neutral-900 text-xs space-y-1 text-neutral-300 font-sans">
                        <strong className="text-cyber-yellow leading-relaxed">REQUISITO DE VALIDACIÓN:</strong>
                        <p className="text-neutral-400 italic">
                          {modifier?.rules || 'Validación estándar por el NPC Mesero.'}
                        </p>
                        <p className="text-cyber-green font-mono pt-1 text-[10px]">
                          Recompensa al completarse: +200 XP y Cupón de Postre/Zumo.
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            // Default mock coupon unlocked
                            const giftCoupon = {
                              id: `coupon-${Date.now()}`,
                              code: `NEX-WIN-${Math.floor(1000 + Math.random() * 9000)}`,
                              title: `Postre Gratis (${modifier?.name || 'Raid Concluida'})`,
                              description: `Valida una rebanada de Tarta Pikachu Gratis por derrotar modificador.`,
                              isUsed: false,
                              source: `${modifier?.name || 'Raid Quest'}`
                            };
                            onUpdateReservation(res.id, 'completed', giftCoupon, 200);
                            alert(`🌟 Reto completado con éxito. Se le asignó +200 XP y un Cupón de Postre al player ${res.gamertag}`);
                          }}
                          className="flex-1 py-2.5 bg-cyber-green text-black hover:bg-emerald-400 font-orbitron font-black text-xs rounded-xl shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" /> COMPLETO (OTORGAR RECOMPENSA)
                        </button>
                        <button
                          onClick={() => {
                            onUpdateReservation(res.id, 'failed');
                            alert(`💀 Reto reportado como Fallido (No completaron las reglas).`);
                          }}
                          className="px-4 py-2 bg-neutral-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-500 border border-neutral-800 font-orbitron font-semibold text-xs rounded-xl transition-all"
                        >
                          FALLÓ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Menu Catalog Pricing modifier */}
        {activeSubTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-neutral-900/40 p-4.5 rounded-2xl border border-neutral-900">
              <h3 className="font-orbitron font-black text-sm text-cyber-yellow flex items-center gap-1.5">
                <UtensilsCrossed className="w-5 h-5 text-cyber-yellow" /> COMPATIBILIDAD DE TARIFAS (CAMBIAR PRECIOS EN DIRECTO)
              </h3>
              <p className="text-neutral-400 text-xs mt-1 font-rajdhani">
                Modifica el precio en Pesos Mexicanos (MXN) de cualquier producto del inventario. El cambio es instantáneo a nivel global para todos los clientes que abran el Menú de la app.
              </p>
            </div>

            <div className="overflow-x-auto select-none">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-850 font-orbitron font-bold text-neutral-400 py-3 block w-full table table-fixed">
                    <th className="py-2.5 w-1/3">Nombre del Alimento</th>
                    <th className="py-2.5 w-1/4">Categoría</th>
                    <th className="py-2.5 w-1/5 text-center">Precio Actual</th>
                    <th className="py-2.5 w-1/4 text-right">Estrategia / Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 block max-h-[420px] overflow-y-auto">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="py-2 hover:bg-neutral-900/40 font-mono tracking-wide leading-relaxed block w-full table table-fixed">
                      <td className="align-middle w-1/3 py-2 font-rajdhani font-extrabold text-sm text-neutral-200">
                        {item.name}
                      </td>
                      <td className="align-middle w-1/4 text-neutral-400 py-2">
                        <span className="capitalize bg-neutral-900 px-2 py-0.5 rounded text-[10px]">
                          {item.cat}
                        </span>
                      </td>
                      <td className="align-middle w-1/5 text-center font-bold text-cyber-green text-sm py-2">
                        $ {item.price} MXN
                      </td>
                      <td className="align-middle w-1/4 text-right py-2">
                        {priceEditingId === item.id ? (
                          <div className="flex gap-1 justify-end items-center">
                            <input
                              type="number"
                              value={tempPriceString}
                              onChange={(e) => setTempPriceString(e.target.value)}
                              className="w-16 bg-neutral-950 border border-cyber-yellow rounded px-1.5 py-0.5 text-center font-bold text-white text-xs focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const parseAmount = parseFloat(tempPriceString);
                                if (!isNaN(parseAmount) && parseAmount >= 0) {
                                  onUpdateMenuItemPrice(item.id, parseAmount);
                                  setPriceEditingId(null);
                                } else {
                                  alert("Ingresa un precio numérico válido.");
                                }
                              }}
                              className="bg-cyber-yellow text-black px-2 py-0.5 rounded text-[10px] font-bold"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setPriceEditingId(null)}
                              className="bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded text-[10px]"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setPriceEditingId(item.id);
                              setTempPriceString(item.price.toString());
                            }}
                            className="px-2.5 py-1 bg-neutral-900 text-cyber-yellow border border-cyber-yellow/40 hover:border-cyber-yellow hover:bg-neutral-850 rounded text-[10px] font-orbitron font-semibold transition-all"
                          >
                            MODIFICAR COSTO
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Alchemy Results Controller */}
        {activeSubTab === 'alchemy' && (
          <div className="space-y-6">
            <div className="bg-neutral-900/40 p-4.5 rounded-2xl border border-neutral-900 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-orbitron font-black text-sm text-cyber-green flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-cyber-green" /> ADMINISTRACIÓN DE ENCUESTA DEMOCRÁTICA
                </h3>
                <p className="text-neutral-400 text-xs mt-1 font-rajdhani">
                  Los jugadores de la comunidad gastan la XP que ganan al comprar alimentos para elegir qué ingrediente premium colocar en el menú semanal.
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm("🛠️ ¿Estás seguro de que deseas vaciar por completo la urna de votaciones para iniciar una nueva campaña?")) {
                    onResetVotes();
                  }
                }}
                className="px-4 py-2.5 bg-red-950/20 hover:bg-neutral-900 text-red-400 hover:text-red-500 border border-red-950 hover:border-red-500 rounded-xl text-xs font-orbitron flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> REINICIAR VOTACIONES
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-orbitron text-xs text-neutral-400">DESGLOSE DEL PESO DEL VOTO COMUNITARIO:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'v-angus', name: "Carne Premium Angus al Carbón con Mezcal", category: "Proteína" },
                  { id: 'v-jack', name: "Queso Monterrey Jack Ahumado Flameado", category: "Topping Extra" },
                  { id: 'v-doritos', name: "Costra de Doritos Spicy Flamin' Hot Crujientes", category: "Topping Extra" },
                  { id: 'v-mayo-wasabi', name: "Mayonesa Casera de Wasabi Fusion", category: "Salsa" },
                  { id: 'v-habanero-mango', name: "Salsa Habanero-Mango Silvestre", category: "Salsa" },
                  { id: 'v-pan-brioche', name: "Pan de Brioche Brioso Glaseado con Mantequilla", category: "Pan Especial" }
                ].map((option) => {
                  const votes = globalVotes[option.id] || 0;
                  const pct = totalVotesCount > 0 ? Math.round((votes / totalVotesCount) * 100) : 0;
                  
                  return (
                    <div key={option.id} className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-800 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-900 text-neutral-400">
                            {option.category}
                          </span>
                          <h5 className="font-railway font-black text-xs text-white leading-tight mt-1.5">
                            {option.name}
                          </h5>
                        </div>
                        <span className="font-orbitron font-extrabold text-sm text-cyber-green shrink-0">
                          {votes} XP <span className="text-[10px] text-neutral-500 font-normal">({pct}%)</span>
                        </span>
                      </div>

                      {/* Bar graph helper */}
                      <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-cyber-green h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
