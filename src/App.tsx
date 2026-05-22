import React, { useState, useEffect } from 'react';
import { MenuItem, Reservation, UserProfile, Coupon, RestaurantOrder } from './types';
import { INITIAL_MENU_ITEMS, GAME_MODIFIERS } from './data';

import MenuCatalog from './components/MenuCatalog';
import AlchemyNexus from './components/AlchemyNexus';
import ReservationsGamer from './components/ReservationsGamer';
import AchievementsBonus from './components/AchievementsBonus';
import OwnerDashboard from './components/OwnerDashboard';

import {
  Home,
  Utensils,
  Sparkles,
  Calendar,
  Award,
  Store,
  User,
  Plus,
  Minus,
  Trash2,
  Satellite,
  Info,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function App() {
  const [welcomeScreen, setWelcomeScreen] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tempGamertag, setTempGamertag] = useState<string>('');

  // 1. New Restaurant Orders State
  const [orders, setOrders] = useState<RestaurantOrder[]>(() => {
    const saved = localStorage.getItem('nexus_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ord-v3f1',
        gamertag: 'MASTER_CHIEF',
        itemId: 'm-bowser',
        itemName: 'Bowser Smash Burger XL (Raid Boss)',
        price: 249,
        xpReward: 480,
        status: 'pending',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: 'ord-f921',
        gamertag: 'VIC_PLAYER_1',
        itemId: 'd-poke',
        itemName: 'Zumo Elixir de Bayas Oran',
        price: 75,
        xpReward: 120,
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      }
    ];
  });

  // 2. New Dynamic Menu Items State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('nexus_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  // 3. Global Ingredient Votes State
  const [globalVotes, setGlobalVotes] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('nexus_global_votes');
    return saved ? JSON.parse(saved) : {
      'v-angus': 4320,
      'v-jack': 3410,
      'v-doritos': 5890,
      'v-mayo-wasabi': 2140,
      'v-habanero-mango': 3820,
      'v-pan-brioche': 4910
    };
  });

  // Loaded from storage
  useEffect(() => {
    // 1. Check active Gamertag
    const savedTag = localStorage.getItem('nexusPlayer');
    if (savedTag) {
      const profileKey = `nexus_profile_${savedTag}`;
      const savedProfile = localStorage.getItem(profileKey);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        const initialProfile: UserProfile = {
          gamertag: savedTag,
          xp: 150, // bonus 150 XP for existing players
          unlockedAchievements: [],
          claimedCoupons: [],
          votedIngredients: {}
        };
        setUserProfile(initialProfile);
        localStorage.setItem(profileKey, JSON.stringify(initialProfile));
      }
    }

    // 2. Load reservations
    const savedReservations = localStorage.getItem('nexus_reservations');
    if (savedReservations) {
      setReservations(JSON.parse(savedReservations));
    }
  }, []);

  // Save changes helper
  const saveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    if (updated.gamertag) {
      localStorage.setItem(`nexus_profile_${updated.gamertag}`, JSON.stringify(updated));
    }
  };

  const handleRegisterPlayer = (tag: string) => {
    if (!tag.trim()) {
      alert("⚠️ El Gamertag no puede estar vacío.");
      return;
    }
    const cleanTag = tag.toUpperCase().trim();
    localStorage.setItem('nexusPlayer', cleanTag);

    const profileKey = `nexus_profile_${cleanTag}`;
    const existing = localStorage.getItem(profileKey);
    let profileToSet: UserProfile;

    if (existing) {
      profileToSet = JSON.parse(existing);
    } else {
      profileToSet = {
        gamertag: cleanTag,
        xp: 150, // starting gift
        unlockedAchievements: [],
        claimedCoupons: [],
        votedIngredients: {}
      };
    }

    setUserProfile(profileToSet);
    localStorage.setItem(profileKey, JSON.stringify(profileToSet));
    alert(`🚀 ¡AVATAR CONFIRMADO! Bienvenido al Servidor, Player ${cleanTag}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexusPlayer');
    setUserProfile(null);
  };

  // Order Mechanics (Direct instant order / single checkout)
  const handleOrderDirectly = (item: MenuItem) => {
    const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: RestaurantOrder = {
      id: orderId,
      gamertag: userProfile ? userProfile.gamertag : 'ANÓNIMO',
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      xpReward: item.xpReward,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (userProfile) {
      let achievements = [...userProfile.unlockedAchievements];
      
      // Unlock Recurrent spender if price >= 500
      if (item.price >= 500 && !achievements.includes('comprador_recurrente')) {
        achievements.push('comprador_recurrente');
        alert("🏆 ¡LOGRO DESBLOQUEADO: Ballena del Servidor! Gastas más de $500 MXN en una sola raid.");
      }

      const updatedProfile: UserProfile = {
        ...userProfile,
        xp: userProfile.xp + item.xpReward,
        unlockedAchievements: achievements
      };
      saveProfile(updatedProfile);
      alert(`🛰️ ¡BOTÍN ADQUIRIDO! Tu pedido de "${item.name}" por $${item.price} MXN ha sido enviado a la cocina del chef. Has ganado +${item.xpReward} XP reales.`);
    } else {
      alert(`🛰️ ¡BOTÍN ADQUIRIDO! Pedido de "${item.name}" enviado a cocina. Pago de $${item.price} MXN procesado. Regístrate en PERFIL para que tus consumos te retribuyan XP.`);
    }

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('nexus_orders', JSON.stringify(updatedOrders));
  };

  const handleUpdateMenuItemPrice = (itemId: string, newPrice: number) => {
    const updated = menuItems.map(item => {
      if (item.id === itemId) {
        return { ...item, price: newPrice };
      }
      return item;
    });
    setMenuItems(updated);
    localStorage.setItem('nexus_menu_items', JSON.stringify(updated));
  };

  const handleResetVotes = () => {
    const reset = {
      'v-angus': 0,
      'v-jack': 0,
      'v-doritos': 0,
      'v-mayo-wasabi': 0,
      'v-habanero-mango': 0,
      'v-pan-brioche': 0
    };
    setGlobalVotes(reset);
    localStorage.setItem('nexus_global_votes', JSON.stringify(reset));
    
    if (userProfile) {
      const updated = {
        ...userProfile,
        votedIngredients: {}
      };
      saveProfile(updated);
    }
    alert("🗳️ Urna electoral de Alquimia reseteada por el Dueño.");
  };

  const handleChangeOrderStatus = (orderId: string, status: 'completed' | 'cancelled') => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status };
      }
      return ord;
    });
    setOrders(updated);
    localStorage.setItem('nexus_orders', JSON.stringify(updated));
  };

  // Reservation mechanics
  const handleAddReservation = (newRes: Reservation) => {
    const updated = [newRes, ...reservations];
    setReservations(updated);
    localStorage.setItem('nexus_reservations', JSON.stringify(updated));
  };

  const handleUpdateReservationStatus = (
    resId: string,
    status: 'completed' | 'failed',
    unlockedCoupon?: Coupon,
    rewardedXp?: number
  ) => {
    const updatedResList = reservations.map((res) => {
      if (res.id === resId) {
        return { ...res, status, isVerified: true };
      }
      return res;
    });

    setReservations(updatedResList);
    localStorage.setItem('nexus_reservations', JSON.stringify(updatedResList));

    // If completed & coupon exists, insert to active user profile
    if (status === 'completed' && userProfile) {
      let achievements = [...userProfile.unlockedAchievements];
      let coupons = [...userProfile.claimedCoupons];
      let currentXp = userProfile.xp;

      // Unlocks achievements depending on modifier completed
      const actingRes = reservations.find(r => r.id === resId);
      if (actingRes) {
        if (actingRes.modifierId === 'desconexion-red' && !achievements.includes('desconexion_total')) {
          achievements.push('desconexion_total');
        } else if (actingRes.modifierId === 'trivia-geek' && !achievements.includes('trivia_master')) {
          achievements.push('trivia_master');
        } else if (actingRes.modifierId === 'boss-battle' && !achievements.includes('bowser_slayer')) {
          achievements.push('bowser_slayer');
        }
      }

      if (unlockedCoupon) {
        coupons.push(unlockedCoupon);
      }

      if (rewardedXp) {
        currentXp += rewardedXp;
      }

      const updatedProfile: UserProfile = {
        ...userProfile,
        xp: currentXp,
        claimedCoupons: coupons,
        unlockedAchievements: achievements
      };
      saveProfile(updatedProfile);
    }
  };

  const handleClearAllCoupons = () => {
    if (userProfile) {
      const updated: UserProfile = {
        ...userProfile,
        claimedCoupons: []
      };
      saveProfile(updated);
    }
  };

  const handleRedeemCoupon = (couponId: string) => {
    if (userProfile) {
      const updatedCoupons = userProfile.claimedCoupons.map(c => {
        if (c.id === couponId) {
          return { ...c, isUsed: true };
        }
        return c;
      });
      const updatedProfile: UserProfile = {
        ...userProfile,
        claimedCoupons: updatedCoupons
      };
      saveProfile(updatedProfile);
      alert("✨ ¡CUPÓN VALIDADO! Entrégaselo al Cajero para aplicar tu recompensa.");
    }
  };

  // Allocate XP on alchemy voting
  const handleAllocateXpToVote = (optionId: string, xpAmount: number) => {
    if (!userProfile) return;

    const currentAllocated = userProfile.votedIngredients[optionId] || 0;
    
    // Add achievement for first alchemy vote
    let achievements = [...userProfile.unlockedAchievements];
    if (!achievements.includes('unidos_venceremos')) {
      achievements.push('unidos_venceremos');
      alert("🏆 ¡LOGRO DESBLOQUEADO: Primer Voto Alquímico! Tus ideas forjarán el menú de Nexus.");
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      xp: userProfile.xp - xpAmount,
      votedIngredients: {
        ...userProfile.votedIngredients,
        [optionId]: currentAllocated + xpAmount
      },
      unlockedAchievements: achievements
    };

    saveProfile(updatedProfile);

    // Also update global votes state
    setGlobalVotes(prev => {
      const next = {
        ...prev,
        [optionId]: (prev[optionId] || 0) + xpAmount
      };
      localStorage.setItem('nexus_global_votes', JSON.stringify(next));
      return next;
    });
  };

  // Navigate to profile for quick registration
  const handleRequestRegister = () => {
    setCurrentPage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-white bg-grid-cyber font-rajdhani flex flex-col justify-between selection:bg-cyber-magenta selection:text-white">
      
      {/* Intro Portal (Splash screen) */}
      {welcomeScreen ? (
        <div className="fixed inset-0 bg-cyber-dark bg-grid-cyber z-[9999] flex flex-col justify-center items-center text-center p-6 space-y-8">
          <div className="absolute top-1/4 w-96 h-96 bg-cyber-cyan/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="space-y-3 animate-flicker">
            <span className="font-press-start text-[10px] text-cyber-magenta select-none tracking-widest block">SERVER VECTOR ONLINE</span>
            <h1 className="font-press-start font-black text-xl sm:text-2xl leading-relaxed text-shadow text-white select-none">
              ¿ESTÁS LISTO<br />PARA PEDIR?
            </h1>
          </div>

          <div className="p-4 bg-neutral-900/60 border border-cyber-cyan/30 rounded-2xl max-w-sm">
            <p className="text-neutral-400 font-sans text-xs leading-relaxed">
              Ingresa al centro de operaciones gastronómico de Cd. Victoria, Tamaulipas. Consigue recompensas gimiendo tus XP y liderando modificadores de mesa.
            </p>
          </div>

          <button
            onClick={() => setWelcomeScreen(false)}
            className="relative z-10 px-10 py-5 bg-cyber-magenta text-white font-orbitron font-extrabold text-lg rounded-full shadow-[0_0_25px_rgba(255,0,255,0.5)] border border-white/20 select-none hover:shadow-[0_0_45px_rgba(255,0,255,0.8)] active:scale-95 transition-all outline-none cursor-pointer"
          >
            COMENCEMOS
          </button>
        </div>
      ) : null}

      {/* Main Core Viewport */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-[1000] bg-cyber-dark/95 border-b-2 border-cyber-magenta shadow-[0_5px_15px_rgba(255,0,255,0.15)] p-4 text-center">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex flex-col items-center sm:items-start cursor-pointer" onClick={() => setCurrentPage('home')}>
              <h1 className="font-press-start text-sm select-none tracking-wider text-white animate-flicker">
                NEXUS GASTRO-BAR
              </h1>
              <span className="font-orbitron font-bold text-[9px] text-cyber-yellow flex items-center gap-1 mt-1 tracking-widest">
                <Satellite className="w-3 h-3 text-cyber-yellow animate-spin" /> CD. VICTORIA, TAMAULIPAS
              </span>
            </div>

            <div className="flex gap-2 items-center text-xs font-mono">
              {userProfile ? (
                <div className="flex items-center gap-2 bg-neutral-900 border border-cyber-green/45 px-3 py-1.5 rounded-full select-none">
                  <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse"></span>
                  <span className="text-neutral-400 text-[10px] uppercase font-bold">{userProfile.gamertag}</span>
                  <span className="text-cyber-green font-bold text-[11px] font-orbitron">({userProfile.xp} XP)</span>
                </div>
              ) : (
                <button
                  onClick={handleRequestRegister}
                  className="bg-neutral-900 hover:bg-neutral-800 border border-cyber-cyan text-cyber-cyan px-4 py-1.5 rounded-full text-[10px] font-orbitron font-semibold uppercase transition-all"
                >
                  Registrar Player
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Canvas Area */}
        <div className="max-w-7xl mx-auto w-full p-4 flex-1 pb-28">
          
          {/* Welcome alert if Friday */}
          {currentPage === 'home' && (
            <div className="p-4 bg-gradient-to-r from-cyber-magenta/10 to-red-500/5 border-2 border-dashed border-cyber-magenta/80 rounded-2xl text-center mb-6 relative overflow-hidden animate-fadeIn">
              <span className="absolute -top-1 -right-1 font-press-start text-[7px] bg-cyber-yellow text-black font-bold px-1.5 py-0.5 rounded rotate-3">
                MEGABONUS
              </span>
              <h3 className="font-press-start text-xs text-cyber-yellow">EVENTO CD. VICTORIA</h3>
              <p className="text-sm text-neutral-200 mt-2 font-rajdhani">
                💥 <strong>¡Viernes de Cosplay!</strong> Obtén hasta <strong>20% de descuento</strong> directo en tu cuenta final de botines si acudes personificando a tu héroe favorito.
              </p>
            </div>
          )}

          {/* PAGE: HOME */}
          {currentPage === 'home' && (
            <div className="space-y-10 animate-fadeIn">
              
              {/* Promo Banner Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-neutral-950/80 border border-neutral-800/80 p-5 sm:p-7 rounded-3xl">
                <div className="space-y-4 text-center md:text-left">
                  <span className="text-[10px] font-mono tracking-widest bg-cyber-cyan/15 text-cyber-cyan px-2.5 py-1 rounded">ESTACIÓN DE OPERACIONES</span>
                  <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-shadow leading-tight text-white">
                    LA PRÓXIMA GENERACIÓN DEL SABOR GAMER
                  </h2>
                  <p className="text-neutral-400 font-sans text-sm leading-relaxed">
                    Combina ingredientes únicos con mecánicas de juego en tu mesa. ¿Crees poder aguantar la Bowser Burger sin tomar agua? Organiza tu raid ahora.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                    <button
                      onClick={() => setCurrentPage('menu')}
                      className="px-6 py-3 bg-cyber-cyan text-black font-orbitron font-extrabold text-xs tracking-wider rounded-xl shadow-md hover:shadow-cyber-cyan/35 transition-all flex items-center gap-1.5"
                    >
                      ABRIR MENÚ <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage('reservations')}
                      className="px-6 py-3 bg-neutral-900 border border-cyber-magenta hover:bg-neutral-800 text-cyber-magenta font-orbitron font-extrabold text-xs tracking-wider rounded-xl transition-all"
                    >
                      DILUCIDAR RESERVA WITH MODS
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=600"
                    alt="Godzilla XL"
                    referrerPolicy="no-referrer"
                    className="w-full h-64 object-cover rounded-2xl border-2 border-cyber-cyan animate-flicker"
                  />
                  <div className="absolute top-4 left-4 bg-black/90 p-3 rounded-xl border border-cyber-magenta">
                    <span className="font-press-start text-[8px] text-cyber-magenta">NIVEL 10 BOSS</span>
                  </div>
                </div>
              </div>

              {/* Popular list */}
              <div className="space-y-5">
                <h3 className="font-orbitron text-md font-bold text-cyber-cyan tracking-wider flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyber-cyan" /> COMBATES POPULARES (EDICIÓN ESTRELLA)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {INITIAL_MENU_ITEMS.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setCurrentPage('menu')}
                      className="group cursor-pointer bg-neutral-950 border border-neutral-800 hover:border-cyber-cyan rounded-2xl overflow-hidden shadow-sm transition-all hover:scale-[1.02] duration-300"
                    >
                      <div className="relative h-40">
                        <img
                          src={item.img}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 right-2.5 bg-black/85 border border-cyber-green/40 text-cyber-green text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                          +{item.xpReward} XP
                        </div>
                      </div>
                      <div className="p-3 text-center space-y-2">
                        <h4 className="font-orbitron text-xs font-extrabold text-neutral-200 group-hover:text-cyber-cyan transition-colors line-clamp-1">{item.name}</h4>
                        <span className="bg-neutral-900 px-2.5 py-1 rounded text-xs font-mono font-bold font-white">
                          $ {item.price} MXN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* PAGE: CATALOG / MENU */}
          {currentPage === 'menu' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h2 className="font-orbitron font-black text-xl text-cyber-cyan text-shadow-sm flex items-center gap-2">
                  <Utensils className="w-6 h-6 text-cyber-cyan" /> INVENTARIO DE ALIMENTOS Y POCIONES
                </h2>
                <span className="text-xs font-mono text-neutral-500">Cd. Victoria Server</span>
              </div>
              <MenuCatalog onAddToCart={handleOrderDirectly} activeGamertag={userProfile?.gamertag || null} menuItems={menuItems} />
            </div>
          )}

          {/* PAGE: ALCHEMY  */}
          {currentPage === 'alchemy' && (
            <AlchemyNexus
              userProfile={userProfile}
              onAllocateXp={handleAllocateXpToVote}
              onRequestRegister={handleRequestRegister}
              globalVotes={globalVotes}
            />
          )}

          {/* PAGE: RESERVATIONS WITH MODIFIERS */}
          {currentPage === 'reservations' && (
            <ReservationsGamer
              userProfile={userProfile}
              onAddReservation={handleAddReservation}
              onUpdateReservation={handleUpdateReservationStatus}
              activeReservations={reservations}
              onRequestRegister={handleRequestRegister}
            />
          )}

          {/* PAGE: CORE LOGROS / COUPONS */}
          {currentPage === 'achievements' && (
            <AchievementsBonus
              userProfile={userProfile}
              onClearCoupons={handleClearAllCoupons}
              onRedeemCoupon={handleRedeemCoupon}
              onRequestRegister={handleRequestRegister}
            />
          )}

          {/* PAGE: OWNER DASHBOARD */}
          {currentPage === 'owner' && (
            <OwnerDashboard
              reservations={reservations}
              onUpdateReservation={handleUpdateReservationStatus}
              orders={orders}
              onChangeOrderStatus={handleChangeOrderStatus}
              menuItems={menuItems}
              onUpdateMenuItemPrice={handleUpdateMenuItemPrice}
              onResetVotes={handleResetVotes}
              globalVotes={globalVotes}
            />
          )}

          {/* PAGE: PROFILE (USER AVATAR) */}
          {currentPage === 'profile' && (
            <div className="max-w-md mx-auto space-y-6 animate-fadeIn">
              <h2 className="font-orbitron font-black text-xl text-cyber-cyan border-b border-neutral-800 pb-2 text-center">
                PORTAL DEL AVATAR (PLAYER)
              </h2>

              {userProfile ? (
                <div className="bg-neutral-950 border border-cyber-magenta p-6 rounded-2xl text-center space-y-6 shadow-lg shadow-cyber-magenta/10">
                  <div className="w-20 h-20 bg-cyber-magenta/15 border border-cyber-magenta rounded-full mx-auto flex items-center justify-center text-cyber-magenta shadow-[0_0_15px_rgba(255,0,255,0.25)] animate-pulse">
                    <User className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-500 block">AVATAR ACTIVO (NIVEL {Math.max(1, Math.floor(userProfile.xp / 100))})</span>
                    <h3 className="font-orbitron font-black text-xl text-white">{userProfile.gamertag}</h3>
                  </div>

                  <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-center space-y-1">
                    <span className="text-[10px] text-neutral-400 block font-mono">SALDO REAL DE XP DISPONIBLE</span>
                    <div className="font-orbitron font-extrabold text-2xl text-cyber-green flex items-center justify-center gap-1.5 animate-pulse">
                      <Sparkles className="w-6 h-6 text-cyber-green" /> {userProfile.xp} XP
                    </div>
                    <span className="text-[10px] text-neutral-500 block max-w-xs mx-auto pt-1 leading-snug">
                      Gana +XP realizando pedidos de alimentos y úsala en &apos;Alquimia&apos; para elegir los ingredientes de la semana.
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 hover:text-red-500 border border-neutral-800 hover:border-red-500/40 text-neutral-400 font-orbitron text-xs rounded-lg transition-all"
                  >
                    CERRAR SESIÓN DEL AVATAR
                  </button>
                </div>
              ) : (
                <div className="bg-neutral-950 border border-cyber-cyan p-6 rounded-2xl space-y-4 shadow-lg shadow-cyber-cyan/10">
                  <div className="space-y-1 text-center mb-4">
                    <span className="text-[10px] font-mono text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded">REGISTRO DE PILOTO</span>
                    <h3 className="font-orbitron font-bold text-md text-white">REIVINDICAR GAMERTAG</h3>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-mono text-neutral-400 block">Ingresa tu Seudónimo / GamerTag oficial:</label>
                    <input
                      type="text"
                      placeholder="Ej: CRITICAL_HIT, VIC_PLAYER_1"
                      value={tempGamertag}
                      onChange={(e) => setTempGamertag(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white uppercase font-mono tracking-wider text-center focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>

                  <button
                    onClick={() => {
                      handleRegisterPlayer(tempGamertag);
                      setTempGamertag('');
                    }}
                    className="w-full py-3 bg-cyber-cyan text-black font-orbitron font-extrabold text-xs tracking-wider rounded-lg shadow-md hover:shadow-cyan-500/35 transition-all"
                  >
                    FORJAR PERFIL DE AVATAR
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Global Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/95 border-t-3 border-cyber-cyan shadow-[0_-5px_20px_rgba(0,243,255,0.25)] flex justify-around items-center px-1 z-[2000] select-none">
          <button
            onClick={() => setCurrentPage('home')}
            className={`flex flex-col items-center gap-1 font-orbitron text-[9px] font-bold py-1.5 transition-colors w-12 sm:w-16 outline-none ${
              currentPage === 'home' ? 'text-cyber-cyan' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Home className={`w-5 h-5 ${currentPage === 'home' ? 'text-cyber-cyan' : 'text-cyber-magenta'}`} />
            <span>INICIO</span>
          </button>

          <button
            onClick={() => setCurrentPage('menu')}
            className={`flex flex-col items-center gap-1 font-orbitron text-[9px] font-bold py-1.5 transition-colors w-12 sm:w-16 outline-none ${
              currentPage === 'menu' ? 'text-cyber-cyan' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Utensils className={`w-5 h-5 ${currentPage === 'menu' ? 'text-cyber-cyan' : 'text-cyber-magenta'}`} />
            <span>MENÚ</span>
          </button>

          <button
            onClick={() => setCurrentPage('alchemy')}
            className={`flex flex-col items-center gap-1 font-orbitron text-[9px] font-bold py-1.5 transition-colors w-12 sm:w-16 outline-none ${
              currentPage === 'alchemy' ? 'text-cyber-cyan' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${currentPage === 'alchemy' ? 'text-cyber-cyan' : 'text-cyber-magenta'}`} />
            <span>ALQUIMIA</span>
          </button>

          <button
            onClick={() => setCurrentPage('reservations')}
            className={`flex flex-col items-center gap-1 font-orbitron text-[9px] font-bold py-1.5 transition-colors w-12 sm:w-16 outline-none ${
              currentPage === 'reservations' ? 'text-cyber-cyan' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Calendar className={`w-5 h-5 ${currentPage === 'reservations' ? 'text-cyber-cyan' : 'text-cyber-magenta'}`} />
            <span>RAIDS</span>
          </button>

          <button
            onClick={() => setCurrentPage('achievements')}
            className={`flex flex-col items-center gap-1 font-orbitron text-[9px] font-bold py-1.5 transition-colors w-12 sm:w-16 outline-none ${
              currentPage === 'achievements' ? 'text-cyber-cyan' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Award className={`w-5 h-5 ${currentPage === 'achievements' ? 'text-cyber-cyan' : 'text-cyber-magenta'}`} />
            <span>LOGROS</span>
          </button>

          <button
            onClick={() => setCurrentPage('owner')}
            className={`flex flex-col items-center gap-1 font-orbitron text-[9px] font-bold py-1.5 transition-colors w-12 sm:w-16 relative outline-none ${
              currentPage === 'owner' ? 'text-cyber-cyan' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Store className={`w-5 h-5 ${currentPage === 'owner' ? 'text-cyber-cyan' : 'text-cyber-magenta'}`} />
            <span>DUEÑO</span>
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1.5 sm:right-2 bg-cyber-yellow text-black font-mono font-bold text-[8px] px-1.5 py-0.5 rounded-full shadow-sm animate-bounce">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentPage('profile')}
            className={`flex flex-col items-center gap-1 font-orbitron text-[9px] font-bold py-1.5 transition-colors w-12 sm:w-16 outline-none ${
              currentPage === 'profile' ? 'text-cyber-cyan' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <User className={`w-5 h-5 ${currentPage === 'profile' ? 'text-cyber-cyan' : 'text-cyber-magenta'}`} />
            <span>PERFIL</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
