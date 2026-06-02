import React, { useState, useEffect } from 'react';
import { MenuItem, Reservation, UserProfile, Coupon, RestaurantOrder, AppUserRole } from './types';
import { INITIAL_MENU_ITEMS, GAME_MODIFIERS, INITIAL_VOTING_OPTIONS } from './data';

import MenuCatalog from './components/MenuCatalog';
import AlchemyNexus from './components/AlchemyNexus';
import ReservationsGamer from './components/ReservationsGamer';
import AchievementsBonus from './components/AchievementsBonus';
import OwnerDashboard from './components/OwnerDashboard';

import RoleGate from './components/RoleGate';
import RestaurantCreator from './components/RestaurantCreator';
import RestaurantPortal from './components/RestaurantPortal';
import DeveloperChat from './components/DeveloperChat';

import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  signInAnonymously,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  runTransaction
} from 'firebase/firestore';

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
  Check,
  Gift
} from 'lucide-react';

export default function App() {
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  const [welcomeScreen, setWelcomeScreen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tempGamertag, setTempGamertag] = useState<string>('');

  // Radical pivot state variables
  const [activeUserRole, setActiveUserRole] = useState<AppUserRole | null>(() => {
    return localStorage.getItem('nexus_user_role') as AppUserRole | null;
  });
  const [ownerDetails, setOwnerDetails] = useState<{ age?: number; studiesMarketing?: boolean; name?: string }>({
    age: Number(localStorage.getItem('nexus_owner_age') || '26'),
    studiesMarketing: localStorage.getItem('nexus_studies_mkt') !== 'false',
    name: localStorage.getItem('nexus_owner_name') || ''
  });
  const [exploreNexusShowcase, setExploreNexusShowcase] = useState<boolean>(false);
  const [selectedRestForChat, setSelectedRestForChat] = useState<{ id: string; name: string } | null>(null);
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [globalVotes, setGlobalVotes] = useState<{ [key: string]: number }>({
    'v-angus': 0,
    'v-camaron': 0,
    'v-jack': 0,
    'v-doritos': 0,
    'v-mayo-wasabi': 0,
    'v-bbq-miso': 0,
    'v-brioche-negro': 0,
    'v-pretzel': 0
  });
  const [fbLoading, setFbLoading] = useState<boolean>(true);

  const getCurrentProfileId = (): string => {
    if (auth.currentUser) {
      return auth.currentUser.uid;
    }
    let guestId = localStorage.getItem('nexusGuestId');
    if (!guestId) {
      guestId = `guest_${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('nexusGuestId', guestId);
    }
    return guestId;
  };

  const isOwnerByProfile = userProfile?.role === 'owner' || userProfile?.gamertag?.toUpperCase() === 'DUEÑO';
  const isOwnerByEmail = auth.currentUser?.email === '23380363@itcv.edu.mx';
  const isOwnerUnlockedPin = localStorage.getItem('nexus_admin_unlocked') === 'true';
  const isAuthorizedOwner = isOwnerByProfile || isOwnerByEmail || isOwnerUnlockedPin;

  // 1. Initialize and Sync Auth Session in Real-time
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const syncProfileForUid = (uid: string) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }

      const userRef = doc(db, 'users', uid);
      unsubscribeProfile = onSnapshot(userRef, async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as any;
          setUserProfile(data as UserProfile);
          if (data.role) {
            setActiveUserRole(data.role as AppUserRole);
            localStorage.setItem('nexus_user_role', data.role);
            setOwnerDetails({
              age: data.ownerAge || 26,
              studiesMarketing: data.studiesMarketing !== false,
              name: data.gamertag || ''
            });
            if (data.ownerAge) localStorage.setItem('nexus_owner_age', data.ownerAge.toString());
            localStorage.setItem('nexus_studies_mkt', (data.studiesMarketing !== false).toString());
            if (data.gamertag) localStorage.setItem('nexus_owner_name', data.gamertag);
          }
        } else {
          // Check local storage for migration to Firebase!
          const localTag = localStorage.getItem('nexusPlayer');
          if (localTag) {
            const profileKey = `nexus_profile_${localTag}`;
            const localProfileStr = localStorage.getItem(profileKey);
            let localProfile: UserProfile;
            try {
              localProfile = localProfileStr ? JSON.parse(localProfileStr) : {
                gamertag: localTag,
                xp: 150,
                unlockedAchievements: [],
                claimedCoupons: [],
                votedIngredients: {}
              };
            } catch (e) {
              localProfile = {
                gamertag: localTag,
                xp: 150,
                unlockedAchievements: [],
                claimedCoupons: [],
                votedIngredients: {}
              };
            }

            try {
              await setDoc(userRef, localProfile);
            } catch (err) {
              console.error("Error setting initial profile on firestore:", err);
            }
          } else {
            setUserProfile(null);
          }
        }
        setFbLoading(false);
      }, (err) => {
        console.warn("Firestore profile snapshot subscription warn/error (expected for guest sessions):", err);
        setFbLoading(false);
      });
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFbLoading(true);
        try {
          await signInAnonymously(auth);
        } catch (error) {
          // Fallback to guest device ID
          let guestId = localStorage.getItem('nexusGuestId');
          if (!guestId) {
            guestId = `guest_${Math.floor(100000 + Math.random() * 900000)}`;
            localStorage.setItem('nexusGuestId', guestId);
          }
          console.log(`ℹ️ [NEXUS OS] Conexión local activa. El inicio de sesión anónimo en la nube no está habilitado en Firebase Console (Error: ${error instanceof Error ? error.message : 'restricted-operation'}). Operando con sesión local segura persistente: ${guestId}`);
          syncProfileForUid(guestId);
        }
        return;
      }

      // We have an actual authenticated user (Google or anonymous if enabled)
      const actualUid = user.uid;

      // Migrate guest profile if exists
      const guestId = localStorage.getItem('nexusGuestId');
      if (guestId && guestId !== actualUid) {
        try {
          const guestRef = doc(db, 'users', guestId);
          const guestSnap = await getDoc(guestRef);
          if (guestSnap.exists()) {
            const guestData = guestSnap.data() as UserProfile;
            const userRef = doc(db, 'users', actualUid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              // Copy data to Google profile!
              await setDoc(userRef, guestData);
            }
            // Clear local guest ID so we don't migrate multiple times
            localStorage.removeItem('nexusGuestId');
          }
        } catch (err) {
          console.warn("Could not migrate guest profile:", err);
        }
      }

      syncProfileForUid(actualUid);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // 2. Sync Menu Items
  useEffect(() => {
    const unsubMenu = onSnapshot(collection(db, 'menuItems'), async (snapshot) => {
      if (snapshot.empty) {
        for (const item of INITIAL_MENU_ITEMS) {
          try {
            await setDoc(doc(db, 'menuItems', item.id), item);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `menuItems/${item.id}`);
          }
        }
      } else {
        const itemsList: MenuItem[] = [];
        snapshot.forEach(d => itemsList.push(d.data() as MenuItem));
        
        // Sort items so they follow the original hand-crafted order of INITIAL_MENU_ITEMS
        itemsList.sort((a, b) => {
          const indexA = INITIAL_MENU_ITEMS.findIndex(x => x.id === a.id);
          const indexB = INITIAL_MENU_ITEMS.findIndex(x => x.id === b.id);
          return indexA - indexB;
        });

        setMenuItems(itemsList);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'menuItems');
    });

    return () => unsubMenu();
  }, []);

  // 3. Sync Table Raid Reservations
  useEffect(() => {
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const unsubReservations = onSnapshot(q, (snapshot) => {
      const resList: Reservation[] = [];
      snapshot.forEach(d => resList.push(d.data() as Reservation));
      setReservations(resList);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'reservations');
    });

    return () => unsubReservations();
  }, []);

  // 4. Sync Orders (Real-time food orders queue)
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(q, (snapshot) => {
      const orderList: RestaurantOrder[] = [];
      snapshot.forEach(d => orderList.push(d.data() as RestaurantOrder));
      setOrders(orderList);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'orders');
    });

    return () => unsubOrders();
  }, []);

  // 5. Sync Votes
  useEffect(() => {
    const unsubVotes = onSnapshot(collection(db, 'votes'), async (snapshot) => {
      if (snapshot.empty) {
        const defaultVotes: { [key: string]: number } = {
          'v-angus': 15,
          'v-camaron': 6,
          'v-jack': 11,
          'v-doritos': 18,
          'v-mayo-wasabi': 8,
          'v-bbq-miso': 12,
          'v-brioche-negro': 13,
          'v-pretzel': 5
        };
        for (const [id, count] of Object.entries(defaultVotes)) {
          try {
            await setDoc(doc(db, 'votes', id), { id, votes: count });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `votes/${id}`);
          }
        }
      } else {
        const votesMap: { [key: string]: number } = {
          'v-angus': 0,
          'v-camaron': 0,
          'v-jack': 0,
          'v-doritos': 0,
          'v-mayo-wasabi': 0,
          'v-bbq-miso': 0,
          'v-brioche-negro': 0,
          'v-pretzel': 0
        };
        snapshot.forEach(d => {
          const data = d.data();
          if (data && data.votes !== undefined) {
            votesMap[d.id] = Number(data.votes);
          }
        });
        setGlobalVotes(votesMap);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'votes');
    });

    return () => unsubVotes();
  }, []);

  // 6. Auto-sync client votes when admin resets them to 0
  useEffect(() => {
    if (!userProfile) return;
    const userHasVotes = Object.keys(userProfile.votedIngredients || {}).length > 0;
    if (userHasVotes) {
      const keys = Object.keys(globalVotes);
      if (keys.length > 0) {
        const totalVotes = (Object.values(globalVotes) as number[]).reduce((sum, val) => sum + val, 0);
        if (totalVotes === 0) {
          const updated = {
            ...userProfile,
            votedIngredients: {}
          };
          saveProfile(updated).catch(err => {
            console.error("Auto-clear user votes error:", err);
          });
        }
      }
    }
  }, [globalVotes, userProfile]);

  // Save changes helper
  const saveProfile = async (updated: UserProfile) => {
    const profileId = getCurrentProfileId();
    const userRef = doc(db, 'users', profileId);
    try {
      await setDoc(userRef, updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${profileId}`);
    }
  };

  const handleSelectRole = async (role: AppUserRole, details?: { age?: number; studiesMarketing?: boolean; name?: string }) => {
    localStorage.setItem('nexus_user_role', role);
    setActiveUserRole(role);
    if (details) {
      setOwnerDetails(details);
      if (details.age) localStorage.setItem('nexus_owner_age', details.age.toString());
      if (details.studiesMarketing !== undefined) localStorage.setItem('nexus_studies_mkt', details.studiesMarketing.toString());
      if (details.name) {
        localStorage.setItem('nexus_owner_name', details.name);
        await handleRegisterPlayer(details.name, true);
      }
    }
    setWelcomeScreen(false);
  };

  const handleRegisterPlayer = async (tag: string, silent = false) => {
    if (!tag.trim()) {
      if (!silent) alert("⚠️ El Gamertag no puede estar vacío.");
      return;
    }
    const cleanTag = tag.toUpperCase().trim();
    localStorage.setItem('nexusPlayer', cleanTag);

    const profileId = getCurrentProfileId();
    const userRef = doc(db, 'users', profileId);
    const newProfile: UserProfile = {
      gamertag: cleanTag,
      xp: userProfile ? userProfile.xp : 150,
      unlockedAchievements: [],
      claimedCoupons: userProfile ? userProfile.claimedCoupons : [],
      votedIngredients: userProfile ? userProfile.votedIngredients : {}
    };

    try {
      await setDoc(userRef, newProfile);
      if (!silent) {
        alert(`🚀 ¡AVATAR CONFIRMADO EN RED! Bienvenido al Servidor, Player ${cleanTag}`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${profileId}`);
    }
  };

  const handleSwitchRole = async () => {
    const nextRole: AppUserRole = activeUserRole === 'consumer' ? 'retailer' : 'consumer';
    localStorage.setItem('nexus_user_role', nextRole);
    setActiveUserRole(nextRole);
    setExploreNexusShowcase(false);
    setSelectedRestForChat(null);
    
    if (userProfile) {
      const profileId = getCurrentProfileId();
      const userRef = doc(db, 'users', profileId);
      try {
        await setDoc(userRef, { role: nextRole }, { merge: true });
      } catch (err) {
        console.warn("Could not sync role change to cloud:", err);
      }
    }
    alert(`🔄 Modo cambiado con éxito a: ${nextRole === 'retailer' ? 'EMPRENDEDOR (MKT)' : 'CONSUMIDOR (GAMER)'}`);
  };

  const handleLogout = async () => {
    localStorage.removeItem('nexusPlayer');
    localStorage.removeItem('nexus_user_role');
    localStorage.removeItem('nexus_owner_age');
    localStorage.removeItem('nexus_studies_mkt');
    localStorage.removeItem('nexus_owner_name');
    setActiveUserRole(null);
    setExploreNexusShowcase(false);
    setSelectedRestForChat(null);
    setWelcomeScreen(true);
    setUserProfile(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  // Order Mechanics (Direct instant order / single checkout)
  const handleOrderDirectly = async (item: MenuItem) => {
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
      const updatedProfile: UserProfile = {
        ...userProfile,
        xp: userProfile.xp + item.xpReward
      };
      await saveProfile(updatedProfile);
      alert(`🛰️ ¡BOTÍN ADQUIRIDO! Tu pedido de "${item.name}" por $${item.price} MXN ha sido enviado a la cocina del chef. Has ganado +${item.xpReward} XP reales.`);
    } else {
      alert(`🛰️ ¡BOTÍN ADQUIRIDO! Pedido de "${item.name}" enviado a cocina. Pago de $${item.price} MXN procesado. Regístrate en PERFIL para que tus consumos te retribuyan XP.`);
    }

    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  const handleUpdateMenuItemPrice = async (itemId: string, newPrice: number) => {
    try {
      const existingItem = (menuItems.length > 0 ? menuItems : INITIAL_MENU_ITEMS).find(item => item.id === itemId);
      if (existingItem) {
        const updatedItem = { ...existingItem, price: newPrice };
        await setDoc(doc(db, 'menuItems', itemId), updatedItem);
      } else {
        await updateDoc(doc(db, 'menuItems', itemId), { price: newPrice });
      }
      alert(`🏷️ PRECIO ACTUALIZADO: El costo se ha modificado exitosamente a $${newPrice} MXN en el menú global y sección de inicio.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `menuItems/${itemId}`);
    }
  };

  const handleResetVotes = async () => {
    const reset = {
      'v-angus': 0,
      'v-camaron': 0,
      'v-jack': 0,
      'v-doritos': 0,
      'v-mayo-wasabi': 0,
      'v-bbq-miso': 0,
      'v-brioche-negro': 0,
      'v-pretzel': 0
    };

    try {
      // Update all votes documents in Firestore in parallel
      const updatePromises = Object.entries(reset).map(([id, count]) => {
        return setDoc(doc(db, 'votes', id), { id, votes: count }, { merge: true });
      });
      await Promise.all(updatePromises);

      // Instantly update state in case of slow replication
      setGlobalVotes(reset);

      if (userProfile) {
        const updated = {
          ...userProfile,
          votedIngredients: {}
        };
        await saveProfile(updated);
      }
      alert("🗳️ Urna electoral de Alquimia reseteada por el Dueño.");
    } catch (err) {
      console.error("Error resetting votes:", err);
      alert("Error al reiniciar las votaciones. Revisa tu conexión a internet.");
    }
  };

  const handleChangeOrderStatus = async (orderId: string, status: 'completed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  // Reservation mechanics
  const handleAddReservation = async (newRes: Reservation) => {
    try {
      await setDoc(doc(db, 'reservations', newRes.id), newRes);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reservations/${newRes.id}`);
    }
  };

  const handleUpdateReservationStatus = async (
    resId: string,
    status: 'completed' | 'failed',
    unlockedCoupon?: Coupon,
    rewardedXp?: number
  ) => {
    try {
      await updateDoc(doc(db, 'reservations', resId), { status, isVerified: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reservations/${resId}`);
    }

    if (status === 'completed' && userProfile) {
      let coupons = [...userProfile.claimedCoupons];
      let currentXp = userProfile.xp;

      if (unlockedCoupon) {
        coupons.push(unlockedCoupon);
      }

      if (rewardedXp) {
        currentXp += rewardedXp;
      }

      const updatedProfile: UserProfile = {
        ...userProfile,
        xp: currentXp,
        claimedCoupons: coupons
      };
      await saveProfile(updatedProfile);
    }
  };

  const handleClearAllCoupons = async () => {
    if (userProfile) {
      const updated: UserProfile = {
        ...userProfile,
        claimedCoupons: []
      };
      await saveProfile(updated);
    }
  };

  const handleRedeemCoupon = async (couponId: string) => {
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
      await saveProfile(updatedProfile);
      alert("✨ ¡CUPÓN VALIDADO! Entrégaselo al Cajero para aplicar tu recompensa.");
    }
  };

  // Toggle vote on alchemy voting (1 vote per category per account, no XP spent)
  const handleToggleVote = async (optionId: string) => {
    if (!userProfile) return;

    const clickedOption = INITIAL_VOTING_OPTIONS.find(o => o.id === optionId);
    if (!clickedOption) return;

    const category = clickedOption.category;
    const categoryOptionIds = INITIAL_VOTING_OPTIONS
      .filter(o => o.category === category)
      .map(o => o.id);

    let previousVotedId: string | null = null;
    for (const optId of categoryOptionIds) {
      if (userProfile.votedIngredients[optId] === 1) {
        previousVotedId = optId;
        break;
      }
    }

    const nextVotedIngredients = { ...userProfile.votedIngredients };
    let decrId: string | null = null;
    let incrId: string | null = null;

    if (previousVotedId === optionId) {
      delete nextVotedIngredients[optionId];
      decrId = optionId;
      alert(`🗳️ Has retirado tu voto para: ${clickedOption.name}`);
    } else {
      if (previousVotedId) {
         delete nextVotedIngredients[previousVotedId];
         decrId = previousVotedId;
      }
      nextVotedIngredients[optionId] = 1;
      incrId = optionId;
      alert(`🗳️ ¡Voto de cuenta registrado! Elegiste en ${category}: ${clickedOption.name}`);
    }

    try {
      await runTransaction(db, async (transaction) => {
        const profileId = getCurrentProfileId();
        const userRef = doc(db, 'users', profileId);

        let decrSnapObj: any = null;
        let incrSnapObj: any = null;

        // Step 1: Perform ALL reads first
        if (decrId) {
          const decrDocRef = doc(db, 'votes', decrId);
          decrSnapObj = await transaction.get(decrDocRef);
        }

        if (incrId) {
          const incrDocRef = doc(db, 'votes', incrId);
          incrSnapObj = await transaction.get(incrDocRef);
        }

        // Step 2: Perform ALL writes and sets after
        if (decrId && decrSnapObj) {
          const decrDocRef = doc(db, 'votes', decrId);
          const currentVotes = decrSnapObj.exists() ? (decrSnapObj.data().votes || 0) : 0;
          transaction.set(decrDocRef, { id: decrId, votes: Math.max(0, currentVotes - 1) }, { merge: true });
        }

        if (incrId && incrSnapObj) {
          const incrDocRef = doc(db, 'votes', incrId);
          const currentVotes = incrSnapObj.exists() ? (incrSnapObj.data().votes || 0) : 0;
          transaction.set(incrDocRef, { id: incrId, votes: currentVotes + 1 }, { merge: true });
        }

        transaction.update(userRef, { votedIngredients: nextVotedIngredients });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `votes/${optionId}`);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("🔑 ¡CONEXIÓN DE RED ESTABLE - Autenticado con Google!");
    } catch (error) {
      console.error("Google login error:", error);
      if (isIframe) {
        alert("⚠️ Google prohíbe el inicio de sesión con popups dentro del iframe de vista previa de AI Studio.\n\nPor favor, haz clic en el botón '🌐 ABRIR EN PESTAÑA NUEVA' que aparecerá abajo en tu pantalla para abrir la aplicación de forma completa e iniciar sesión de forma segura sin restricciones de iframe.");
      } else {
        alert(`⚠️ Fallo de conexión con Google: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  // Navigate to profile for quick registration
  const handleRequestRegister = () => {
    setCurrentPage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!activeUserRole) {
    return <RoleGate onSelectRole={handleSelectRole} />;
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      exploreNexusShowcase 
        ? "bg-cyber-dark text-white bg-grid-cyber font-rajdhani selection:bg-cyber-magenta selection:text-white" 
        : "bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white"
    }`}>
      
      {/* Intro Portal (Splash screen) */}
      {welcomeScreen ? (
        <div className={`fixed inset-0 z-[9999] flex flex-col justify-center items-center text-center p-6 space-y-8 animate-fadeIn ${
          exploreNexusShowcase ? 'bg-cyber-dark bg-grid-cyber text-white font-rajdhani' : 'bg-slate-950 text-slate-100'
        }`}>
          <div className={`absolute top-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl ${
            exploreNexusShowcase ? 'bg-cyber-cyan/10' : 'bg-indigo-900/15'
          }`}></div>
          
          <div className="space-y-3">
            <span className={`text-[10px] select-none tracking-widest block font-bold ${
              exploreNexusShowcase ? 'font-press-start text-cyber-magenta animate-flicker' : 'font-mono text-indigo-400 uppercase'
            }`}>
              {exploreNexusShowcase ? 'INTERFAZ CARGADA' : 'TAMAULIPAS GASTRO HUB'}
            </span>
            <h1 className={`font-black tracking-tight leading-relaxed select-none text-white uppercase ${
              exploreNexusShowcase ? 'font-press-start text-xl sm:text-2xl text-shadow' : 'font-sans text-2xl sm:text-3xl'
            }`}>
              {exploreNexusShowcase ? 'NEXUS GASTRO-BAR\nSHOWCASE v2.5' : 'Plataforma De Incubación\nGastronómica'}
            </h1>
          </div>

          <div className={`p-5 rounded-2xl max-w-sm border ${
            exploreNexusShowcase ? 'bg-neutral-900/60 border-cyber-cyan/30 text-neutral-400 text-xs' : 'bg-slate-900 border-slate-800 text-slate-300 text-xs'
          }`}>
            <p className="leading-relaxed text-xs">
              Estación de modelado y auditoría culinaria integrada. Tu entorno personalizado como <strong className={exploreNexusShowcase ? 'text-cyber-green uppercase' : 'text-indigo-400 uppercase'}>{activeUserRole === 'retailer' ? 'Emprendedor (Mercadólogo)' : 'Consumidor (Gamer)'}</strong> está listo.
            </p>
          </div>

          <button
            onClick={() => setWelcomeScreen(false)}
            className={`relative z-10 px-10 py-4 font-bold rounded-xl active:scale-95 transition-all outline-none cursor-pointer uppercase tracking-wider text-xs ${
              exploreNexusShowcase
                ? 'bg-cyber-cyan text-black font-orbitron shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:shadow-[0_0_45px_rgba(0,243,255,0.7)]'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-slate-950/40'
            }`}
          >
            Ingresar al Panel
          </button>
        </div>
      ) : null}

      {/* Main Core Viewport */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Header Navigation */}
        <header className={`sticky top-0 z-[1000] p-4 text-center transition-all duration-205 ${
          exploreNexusShowcase
            ? "bg-cyber-dark/95 border-b-2 border-cyber-cyan shadow-[0_5px_15px_rgba(0,243,255,0.15)] text-white"
            : "bg-slate-900 border-b border-slate-850 shadow-[0_4px_20px_rgba(0,0,0,0.35)] text-slate-100"
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            
            <div className="flex flex-col items-center sm:items-start cursor-pointer" onClick={() => {
              if (exploreNexusShowcase) {
                setExploreNexusShowcase(false);
              } else {
                setCurrentPage('home');
              }
            }}>
              <h1 className={`text-xs select-none tracking-wider text-white flex items-center gap-2 uppercase ${
                exploreNexusShowcase ? 'font-press-start' : 'font-sans font-extrabold'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${exploreNexusShowcase ? 'bg-cyber-cyan' : 'bg-indigo-400'}`}></span>
                {exploreNexusShowcase ? 'NEXUS GASTRO-BAR (SHOWCASE)' : 'INCUBADORA GASTRO-MKT'}
              </h1>
              <span className={`flex items-center gap-1 mt-1 tracking-widest uppercase font-bold text-[9px] ${
                exploreNexusShowcase ? 'font-orbitron text-cyber-yellow' : 'font-mono text-slate-400'
              }`}>
                <Satellite className={`w-3.5 h-3.5 ${exploreNexusShowcase ? 'text-cyber-yellow animate-spin' : 'text-slate-450'}`} /> 
                {exploreNexusShowcase ? 'PROYECTO BENCHMARK DE RED' : `MODO: ${activeUserRole === 'retailer' ? 'EMPRENDEDOR (22-35y)' : 'AUDITOR CLIENTE'}`}
              </span>
            </div>

            {/* Middle Quick Return from Showcase */}
            {exploreNexusShowcase && (
              <button
                onClick={() => setExploreNexusShowcase(false)}
                className="px-4 py-1.5 bg-neutral-900 border border-cyber-magenta text-cyber-magenta hover:bg-cyber-magenta/10 hover:text-white rounded-full font-orbitron font-extrabold text-[10px] tracking-wider transition-all uppercase animate-pulse shadow-md"
              >
                ◀ VOLVER AL PORTAL DE MARCAS
              </button>
            )}

            <div className="flex flex-wrap gap-2 items-center text-xs font-mono justify-center sm:justify-end">
              {/* Quick toggle between Entrepreneur and Consumer */}
              <button
                type="button"
                onClick={handleSwitchRole}
                className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/55 text-indigo-400 px-3 py-1.5 rounded-xl text-[9px] font-mono transition-all font-bold uppercase cursor-pointer"
              >
                🔄 {activeUserRole === 'consumer' ? 'Modo Emprendedor' : 'Modo Consumidor'}
              </button>

              {/* Reset to switch roles easily */}
              <button
                onClick={handleLogout}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-500 hover:text-red-400 px-3 py-1.5 rounded-xl text-[9px] font-mono transition-all font-bold uppercase cursor-pointer"
              >
                🚪 Cerrar Sesión
              </button>

              {userProfile && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl select-none border ${
                  exploreNexusShowcase 
                    ? 'bg-neutral-900 border-cyber-green/45 text-neutral-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${exploreNexusShowcase ? 'bg-cyber-green' : 'bg-emerald-400'}`}></span>
                  <span className="text-[10px] uppercase font-bold">{userProfile.gamertag}</span>
                  {activeUserRole === 'consumer' && exploreNexusShowcase && (
                    <span className="text-cyber-green font-bold text-[11px] font-orbitron">({userProfile.xp} XP)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Canvas Area */}
        <div className="max-w-7xl mx-auto w-full p-4 flex-1 pb-28">
          
          {!exploreNexusShowcase ? (
            <div className="space-y-6 animate-fadeIn">
              {activeUserRole === 'consumer' ? (
                /* 1. Consumer Main Platform View: Browse food brands & critiques */
                <RestaurantPortal
                  userRole="consumer"
                  username={userProfile?.gamertag || 'CLIENT_GASTRO'}
                  onExploreNexus={() => {
                    setExploreNexusShowcase(true);
                    setCurrentPage('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSelectRestaurantForChat={() => {}}
                />
              ) : (
                /* 2. Retailer/Young Marketer (22-35y) Tailored Dashboard */
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Retailer Tab Navigation Bar */}
                  <div className="flex border-b border-neutral-800 pb-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('creator');
                        setSelectedRestForChat(null);
                      }}
                      className={`font-orbitron font-extrabold text-[11px] sm:text-xs tracking-wider pb-2 focus:outline-none transition-all uppercase ${
                        currentPage === 'creator' && !selectedRestForChat
                          ? 'text-cyber-cyan border-b-2 border-cyber-cyan'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      🚀 Mi Restaurante (Creador)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('portal');
                        setSelectedRestForChat(null);
                      }}
                      className={`font-orbitron font-extrabold text-[11px] sm:text-xs tracking-wider pb-2 focus:outline-none transition-all uppercase ${
                        currentPage === 'portal' && !selectedRestForChat
                          ? 'text-cyber-cyan border-b-2 border-cyber-cyan'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      🔍 Proyectos Compañeros (MKT)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage('chat');
                        setSelectedRestForChat({ id: `rest_${getCurrentProfileId()}`, name: ownerDetails.name || 'Mi Marca' });
                      }}
                      className={`font-orbitron font-extrabold text-[11px] sm:text-xs tracking-wider pb-2 focus:outline-none transition-all uppercase ${
                        selectedRestForChat || currentPage === 'chat'
                          ? 'text-cyber-cyan border-b-2 border-cyber-cyan'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      💬 Chat Diseñadores
                    </button>
                  </div>

                  {/* Render content based on chosen tabs */}
                  {selectedRestForChat ? (
                    <DeveloperChat
                      restaurantId={selectedRestForChat.id}
                      restaurantName={selectedRestForChat.name}
                      activeUsername={ownerDetails.name || userProfile?.gamertag || 'MARKETING_LEADER'}
                    />
                  ) : currentPage === 'portal' ? (
                    <RestaurantPortal
                      userRole="retailer"
                      username={ownerDetails.name || userProfile?.gamertag || 'MARKETER_PEER'}
                      onExploreNexus={() => {
                        setExploreNexusShowcase(true);
                        setCurrentPage('home');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onSelectRestaurantForChat={(id, name) => {
                        setSelectedRestForChat({ id, name });
                      }}
                    />
                  ) : (
                    /* Default: 'creator' / edit */
                    <RestaurantCreator
                      ownerId={getCurrentProfileId()}
                      ownerName={ownerDetails.name || userProfile?.gamertag || 'COLEGA'}
                      ownerAge={ownerDetails.age}
                      studiedMarketing={ownerDetails.studiesMarketing}
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
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
                    La taberna definitiva de misiones y drops culinarias en Tamaulipas. Elige dinámicas para tu mesa. Vota por ingredientes en tiempo real y sube de nivel con tu consumo.
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
                  {(menuItems.length > 0 ? menuItems : INITIAL_MENU_ITEMS).slice(0, 4).map((item) => (
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
              {/* Premium image banner for the Menu tab */}
              <div className="relative h-48 rounded-2xl overflow-hidden border border-cyber-cyan/30 shadow-[0_0_20px_rgba(0,243,255,0.1)] flex items-end p-6">
                <img 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200" 
                  alt="Menú de alimentos" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent"></div>
                <div className="relative z-10 space-y-1">
                  <span className="text-[9px] font-press-start bg-cyber-cyan text-black px-2 py-0.5 rounded uppercase font-bold text-shadow">DÚOS & COMBOS RECOMENDADOS</span>
                  <h3 className="font-orbitron font-extrabold text-white text-md uppercase">ESTACIÓN DE ABASTECIMIENTO INTEGRAL</h3>
                  <p className="text-[11px] text-neutral-300 font-rajdhani">Arma tu raid gastronómica con las mejores combinaciones gourmet de Tamaulipas.</p>
                </div>
              </div>

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
              onVoteIngredient={handleToggleVote}
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
          {currentPage === 'owner' && isAuthorizedOwner && (
            <OwnerDashboard
              reservations={reservations}
              onUpdateReservation={handleUpdateReservationStatus}
              orders={orders}
              onChangeOrderStatus={handleChangeOrderStatus}
              menuItems={menuItems}
              onUpdateMenuItemPrice={handleUpdateMenuItemPrice}
              onResetVotes={handleResetVotes}
              globalVotes={globalVotes}
              userProfile={userProfile}
              onReturnToProfile={() => setCurrentPage('profile')}
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
                    <span className="text-[10px] font-mono text-neutral-400 block pb-1">AVATAR ACTIVO (NIVEL {Math.max(1, Math.floor(userProfile.xp / 100))})</span>
                    <h3 className="font-orbitron font-black text-xl text-white">{userProfile.gamertag}</h3>
                    <span className="text-[9px] font-mono text-cyber-cyan block uppercase pt-0.5">
                      {auth.currentUser?.isAnonymous ? '🎮 SESIÓN TEMPORAL (Invitado)' : `📧 RESPALDO: ${auth.currentUser?.email}`}
                    </span>
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

                  {auth.currentUser?.isAnonymous && (
                    <div className="space-y-2">
                      <button
                        onClick={handleGoogleSignIn}
                        className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-cyber-cyan text-cyber-cyan font-orbitron text-xs rounded-lg transition-all"
                      >
                        🔓 CONECTAR CUENTA CON GOOGLE
                      </button>
                      {isIframe && (
                        <div className="p-3 bg-cyber-magenta/10 border border-cyber-magenta/30 rounded-xl text-left">
                          <p className="text-[10px] text-cyber-magenta font-mono leading-relaxed">
                            ⚠️ <strong>Nota:</strong> Google Login requiere abrir la app en pestaña nueva por restricciones de iframe.
                          </p>
                          <button
                            onClick={() => window.open(window.location.href, '_blank')}
                            className="mt-2 w-full py-2 bg-cyber-magenta hover:bg-magenta-600 text-white font-orbitron font-extrabold text-[10px] rounded-lg tracking-wider transition-all cursor-pointer shadow-md shadow-cyber-magenta/20"
                          >
                            🌐 ABRIR EN PESTAÑA NUEVA
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 hover:text-red-500 border border-neutral-800 hover:border-red-500/40 text-neutral-400 font-orbitron text-xs rounded-lg transition-all"
                  >
                    CERRAR SESIÓN DEL AVATAR
                  </button>
                </div>
              ) : (
                <div className="bg-neutral-950 border border-cyber-cyan p-6 rounded-2xl space-y-6 shadow-lg shadow-cyber-cyan/10">
                  <div className="space-y-1 text-center mb-2">
                    <span className="text-[10px] font-mono text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded">REGISTRO DE PILOTO</span>
                    <h3 className="font-orbitron font-bold text-md text-white">REIVINDICAR GAMERTAG</h3>
                  </div>

                  {/* Google Authenticator block on top */}
                  <div className="space-y-3 border-b border-neutral-800 pb-4 text-center">
                    <span className="text-[10px] font-mono text-neutral-500 block uppercase">SOPORTE MULTIPLATAFORMA</span>
                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full py-3 bg-white hover:bg-neutral-100 text-black font-orbitron font-extrabold text-xs tracking-wider rounded-lg shadow-md hover:shadow-neutral-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.91h6.63c-.29 1.5-.14 3.09-1.01 4.14v3.45h3.45c3.09-2.85 4.88-7.04 4.88-11.43z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.45-3.45c-.96.65-2.2 1.04-3.51 1.04-2.72 0-5.04-1.84-5.86-4.31H1.69v3.57C3.68 22.1 7.57 24 12 24z"/>
                        <path fill="#FBBC05" d="M6.14 14.37c-.22-.65-.35-1.35-.35-2.07s.13-1.42.35-2.07V6.66H1.69C.61 8.81 0 11.23 0 13.8s.61 4.99 1.69 7.14l4.45-3.57z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.96 1.19 15.24 0 12 0 7.57 0 3.68 1.9 1.69 5.09l4.45 3.57c.82-2.47 3.14-4.31 5.86-4.31z"/>
                      </svg>
                      INICIAR SESIÓN CON GOOGLE
                    </button>
                    {isIframe && (
                      <div className="p-3 bg-cyber-magenta/10 border border-cyber-magenta/30 rounded-xl text-left">
                        <p className="text-[10px] text-cyber-magenta font-mono leading-relaxed">
                          ⚠️ <strong>Nota:</strong> Google Login requiere abrir la app en pestaña nueva por restricciones de iframe.
                        </p>
                        <button
                          onClick={() => window.open(window.location.href, '_blank')}
                          className="mt-2 w-full py-2 bg-cyber-magenta hover:bg-magenta-600 text-white font-orbitron font-extrabold text-[10px] rounded-lg tracking-wider transition-all cursor-pointer shadow-md shadow-cyber-magenta/20"
                        >
                          🌐 ABRIR EN PESTAÑA NUEVA
                        </button>
                      </div>
                    )}
                    <span className="text-[9px] text-neutral-500 block leading-normal">
                      Sincroniza y descarga automáticamente tus XP y cupones mediante tu cuenta de Google.
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-neutral-400 block">O ingresa un Seudónimo / GamerTag oficial:</label>
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
                      className="w-full py-3 bg-cyber-cyan text-black font-orbitron font-extrabold text-xs tracking-wider rounded-lg shadow-md hover:shadow-cyan-500/35 transition-all cursor-pointer"
                    >
                      FORJAR PERFIL DE AVATAR ASYNC
                    </button>
                  </div>
                </div>
              )}

              {isAuthorizedOwner && (
                <div className="bg-neutral-950 border-2 border-cyber-cyan p-6 rounded-2xl text-center space-y-4 shadow-lg shadow-cyber-cyan/15 animate-fadeIn">
                  <div className="w-12 h-12 bg-cyber-yellow/15 border border-cyber-yellow rounded-full mx-auto flex items-center justify-center text-cyber-yellow shadow-[0_0_15px_rgba(255,191,0,0.25)]">
                    <ShieldCheck className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyber-yellow block uppercase tracking-widest">FIRMA DE OPERACIONES VERIFICADA</span>
                    <h3 className="font-orbitron font-black text-sm text-white">PORTAL DE GESTIÓN DE NEGOCIO</h3>
                    <p className="text-[10px] text-neutral-400 font-rajdhani leading-relaxed max-w-xs mx-auto">
                      Operas con permisos administrativos de alto nivel. Accede en vivo a Looker Studio, modifica precios, gestiona pedidos y raids en tiempo real.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentPage('owner')}
                    className="w-full py-3 bg-cyber-yellow hover:bg-yellow-400 text-black font-orbitron font-black text-xs rounded-xl transition-all shadow-md shadow-cyber-yellow/25 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    📊 VER ESTADÍSTICAS Y PANEL DE GESTIÓN
                  </button>
                </div>
              )}
            </div>
          )}
            </>
          )}

        </div>

        {/* Global Bottom Navigation Bar */}
        {exploreNexusShowcase && (
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
              <Gift className={`w-5 h-5 ${currentPage === 'achievements' ? 'text-cyber-cyan' : 'text-cyber-magenta'}`} />
              <span>CUPONES</span>
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
        )}

      </div>
    </div>
  );
}
