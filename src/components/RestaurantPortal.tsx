import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { RestaurantPage, RestaurantReview, AppUserRole } from '../types';
import { Star, MessageSquare, Compass, Eye, ShieldAlert, Check, Plus, Calendar, Palette, ChevronRight, Award, Info, Sparkles, ArrowLeft, ShoppingBag, Receipt, DollarSign, Wallet, Clock, Users, ArrowRight } from 'lucide-react';

interface RestaurantPortalProps {
  userRole: AppUserRole;
  username: string;
  onExploreNexus: () => void;
  onSelectRestaurantForChat: (id: string, name: string) => void;
}

const NEXUS_PROJECT: RestaurantPage = {
  id: 'nexus_showcase',
  name: 'Nexus Gastro-Bar',
  category: 'Gastro-Bar (Benchmark Showcase)',
  slogan: 'El templo definitivo de misiones y drops culinarios en Tamaulipas',
  description: 'Este es el benchmark de alta gama desarrollado en la plataforma. Posee un menú gamificado con drops de XP, reservas integradas con modificadores de juego, logros que otorgan cupones de descuento reales y la urna de Alquimia para la votación de ingredientes de la semana.',
  bannerUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=600',
  ownerId: 'platform_nexus',
  ownerName: 'Nexus Dev Team',
  status: 'published',
  createdAt: '2026-06-01T00:00:00.000Z'
};

const MOCK_CLASSMATE_RESTAURANTS: RestaurantPage[] = [
  {
    id: 'rest_mkt_carla',
    name: 'Neon Ramen Studio',
    category: 'Sushi & Cocina Asia',
    slogan: 'Ramen cyberpunk de alta velocidad y aderezos moleculares',
    description: 'Propuesta gastronómica de Carla Solís (25 años, egresada de Mercadotecnia). Concepto enfocado en estética industrial japonesa retro con luces de neón y caldos súper espesos diseñados para el exigente público joven de Cd. Victoria.',
    bannerUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600',
    ownerId: 'owner_carla_mkt',
    ownerName: 'Carla Solís',
    ownerAge: 25,
    studiedMarketing: true,
    status: 'published',
    createdAt: '2026-06-01T10:00:00.000Z'
  },
  {
    id: 'rest_mkt_javier',
    name: 'Bento Burger Club',
    category: 'Cervecería / Alitas',
    slogan: 'Hamburguesas apiladas servidas en empaques minimalistas eco-friendly',
    description: 'Empuje de Javier Gómez (29 años, egresado de MKT). El concepto busca erradicar la sobrecarga de platos utilizando bandejas organizadoras de cartón reciclable bento, simplificando el servicio de mesas e impactando en redes sociales con un unboxing gourmet irresistible.',
    bannerUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600',
    ownerId: 'owner_javier_mkt',
    ownerName: 'Javier Gómez',
    ownerAge: 29,
    studiedMarketing: true,
    status: 'published',
    createdAt: '2026-06-01T12:00:00.000Z'
  }
];

// Helper to provide realistic food options based on restaurant category
export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export const getProductsForCategory = (category: string): StoreProduct[] => {
  const normalized = (category || '').toLowerCase();
  
  if (normalized.includes('ramen') || normalized.includes('asia') || normalized.includes('sushi') || normalized.includes('oriental') || normalized.includes('cocina asia')) {
    return [
      {
        id: 'p-ram-1',
        name: 'Cyberpunk Ramen Shoyu 🍜',
        description: 'Fideos artesanales bento servidos en caldo concentrated de cerdo shoyu de 12 horas, huevo ajitama macerado, chashu y nori grabado con láser.',
        price: 135,
        icon: '🍜'
      },
      {
        id: 'p-ram-2',
        name: 'Glow Boba Matcha 🧋',
        description: 'Té de matcha orgánico espumoso con perlas de tapioca fluorescentes, ideal para alumbrar tus aventuras nocturnas.',
        price: 65,
        icon: '🧋'
      },
      {
        id: 'p-ram-3',
        name: 'Molecular Gyoza Box 🥟',
        description: 'Empaque bento con 5 gyozas crujientes rellenas de cerdo con esferificaciones de salsa ponzu cítrica que explotan en boca.',
        price: 95,
        icon: '🥟'
      },
      {
        id: 'p-ram-4',
        name: 'Sashimi Wave Bento 🍣',
        description: 'Cortes seleccionados de salmón fresco sobre cama de arroz con sésamo negro de Tamaulipas y aderezo wasabi-soya.',
        price: 155,
        icon: '🍣'
      }
    ];
  }
  
  if (normalized.includes('burger') || normalized.includes('hamburguesa') || normalized.includes('alitas') || normalized.includes('cervecería') || normalized.includes('cerveceria') || normalized.includes('snack')) {
    return [
      {
        id: 'p-burg-1',
        name: 'Eco-Bento Double Burger 🍔',
        description: 'Dos carnes angus de 120g aplastadas con queso cheddar real, pepinillos y aderezo ahumado bento servida en empaque biodegradable.',
        price: 165,
        icon: '🍔'
      },
      {
        id: 'p-burg-2',
        name: 'Upstacked Crispy Wings 🍗',
        description: 'Alitas premium fritas bañadas en aderezo de mango habanero o chipotle dulce artesanal en caja bento organizada.',
        price: 110,
        icon: '🍗'
      },
      {
        id: 'p-burg-3',
        name: 'Bento Waffle Fries 🍟',
        description: 'Papas cortadas en rejilla sazonadas con paprika y sal de mar de la costa, servidas con dip cremoso de chile piquín.',
        price: 55,
        icon: '🍟'
      },
      {
        id: 'p-burg-4',
        name: 'Choco Smores Bento Pack 🧁',
        description: 'Tres sándwiches de galleta graham con malvaviscos asados a la leña y chocolate regional de Tamaulipas.',
        price: 75,
        icon: '🧁'
      }
    ];
  }
  
  if (normalized.includes('pizza') || normalized.includes('pizzería') || normalized.includes('pizzeria') || normalized.includes('italiana')) {
    return [
      {
        id: 'p-piz-1',
        name: 'Bento Pizza Personal Margarita 🍕',
        description: 'Monoporción horneada a la piedra con mozzarella de hebra tamaulipeco, salsa pomodoro italiana de la casa y albahaca fresca del huerto.',
        price: 125,
        icon: '🍕'
      },
      {
        id: 'p-piz-2',
        name: 'Pizza Carbonara Norteña 🍕',
        description: 'Salsa blanca ahumada artesanal, trozos crujientes de tocino regional y costra de queso asadero sobre masa horneada.',
        price: 145,
        icon: '🍕'
      },
      {
        id: 'p-piz-3',
        name: 'Bastones de Ajo & Hierbas 🥖',
        description: 'Palitroques de masa madre con mantequilla de ajo asado, finas hierbas y dipping de salsa marinara.',
        price: 65,
        icon: '🥖'
      },
      {
        id: 'p-piz-4',
        name: 'Soda San Pellegrino de Tuna 🥤',
        description: 'Refrescante combinación de agua carbonatada con jarabe concentrado de tuna silvestre elaborado en la región.',
        price: 50,
        icon: '🥤'
      }
    ];
  }
  
  if (normalized.includes('café') || normalized.includes('cafe') || normalized.includes('cafetería') || normalized.includes('cafeteria') || normalized.includes('postres') || normalized.includes('crepas')) {
    return [
      {
        id: 'p-caf-1',
        name: 'Affogato de la Sierra ☕',
        description: 'Helado de vainilla ahogada con un shot doble de espresso de granos orgánicos tostados de la sierra tamaulipeca.',
        price: 70,
        icon: '☕'
      },
      {
        id: 'p-caf-2',
        name: 'Bento Waffle Crunch Box 🧇',
        description: 'Waffle belga cuadrado en caja bento decorada con fresas, crema batida, trozos de nuez pecana y chocolate líquido.',
        price: 85,
        icon: '🧇'
      },
      {
        id: 'p-caf-3',
        name: 'Matcha Cold Foam Latte 🥛',
        description: 'Espuma fría sedosa sabor matcha dulce vertida sobre leche helada con un toque de vainilla, servido en vaso bento.',
        price: 75,
        icon: '🥛'
      },
      {
        id: 'p-caf-4',
        name: 'Crepa Cajeta Coronada 🥞',
        description: 'Crepa delgada y crujiente doblada estilo bento, rellena de cajeta quemada regional y láminas de plátano.',
        price: 80,
        icon: '🥞'
      }
    ];
  }

  // Default products for any other category
  return [
    {
      id: 'p-def-1',
      name: 'Bento Combo Especial de la Casa 🍱',
      description: 'Nuestra propuesta bento insignia con una combinación balanceada del plato fuerte del chef, guarnición crujiente y aderezo artesanal de la región.',
      price: 120,
      icon: '🍱'
    },
    {
      id: 'p-def-2',
      name: 'Snack Box Victoria de Red 🍿',
      description: 'Una caja bento compartida llena de brochetas fritas, aros de cebolla crujientes y papas sazonadas con nuestro dip secreto.',
      price: 75,
      icon: '🍿'
    },
    {
      id: 'p-def-3',
      name: 'Agua Cítrica del Día 🥤',
      description: 'Infusión helada de limón real, hojas de menta silvestre y un toque ligero de endulzante natural.',
      price: 40,
      icon: '🥤'
    },
    {
      id: 'p-def-4',
      name: 'Bento Postre Tradicional 🍰',
      description: 'Una rebanada de pay de limón helado servida con galleta molida dulce y ralladura de cítricos fresca.',
      price: 60,
      icon: '🍰'
    }
  ];
};

export interface PageTheme {
  primaryBg: string; 
  primaryCardBg: string; 
  accentColor: string; 
  accentHover: string; 
  accentText: string; 
  borderColor: string; 
  badgeStyle: string; 
  glowShadow: string;
  fontTitle: string;
  decoratedTitleSuffix: string;
  themeWidget: React.ReactNode;
}

export const getThemeForCategory = (category: string, restName: string): PageTheme => {
  const norm = (category || '').toLowerCase();
  
  if (norm.includes('ramen') || norm.includes('asia') || norm.includes('sushi') || norm.includes('oriental') || norm.includes('cocina asia')) {
    return {
      primaryBg: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950 to-slate-950',
      primaryCardBg: 'bg-slate-950/90 border-red-950/40 backdrop-blur-md',
      accentColor: 'bg-red-650 hover:bg-red-700 text-white',
      accentHover: 'hover:bg-red-600',
      accentText: 'text-red-400',
      borderColor: 'border-red-900/40 focus:border-red-500',
      badgeStyle: 'bg-red-950/40 text-red-400 border border-red-900/60',
      glowShadow: 'shadow-[0_0_30px_rgba(239,68,68,0.07)]',
      fontTitle: 'font-sans font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-amber-300 to-orange-500',
      decoratedTitleSuffix: ' 🌸🏯',
      themeWidget: (
        <div className="p-4 bg-red-950/10 border border-red-950/50 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-red-400">
            <span className="flex items-center gap-1.5 animate-pulse">🔴 ESTADO DEL CALDO EN VIVO</span>
            <span>TEMP: 98°C</span>
          </div>
          <div className="text-[11px] text-slate-300 leading-normal space-y-1">
            <div className="flex justify-between border-b border-red-950/20 pb-1">
              <span>Fideos Estilo Hakata:</span>
              <span className="font-bold text-red-300">ACTIVO • Firmes</span>
            </div>
            <div className="flex justify-between">
              <span>Aroma en Aire:</span>
              <span className="font-bold text-red-300">Shoyu, Jengibre & Sésamo</span>
            </div>
          </div>
          {/* Decorative style icon */}
          <div className="text-[9px] text-red-500/50 text-center font-mono animate-flicker">
            🌸 ｡･ﾟﾟ･　🏮 KYOTO SPIRIT 🏮　･ﾟﾟ･｡ 🌸
          </div>
        </div>
      )
    };
  }
  
  if (norm.includes('burger') || norm.includes('hamburguesa') || norm.includes('alitas') || norm.includes('cervecería') || norm.includes('cerveceria') || norm.includes('snack')) {
    return {
      primaryBg: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/10 via-slate-950 to-slate-950',
      primaryCardBg: 'bg-slate-950/90 border-amber-900/30 backdrop-blur-md',
      accentColor: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
      accentHover: 'hover:bg-amber-400',
      accentText: 'text-amber-400',
      borderColor: 'border-amber-950/65 focus:border-amber-500',
      badgeStyle: 'bg-amber-950/40 text-amber-400 border border-amber-900/60',
      glowShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.07)]',
      fontTitle: 'font-sans font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400',
      decoratedTitleSuffix: ' 🍔🍟',
      themeWidget: (
        <div className="p-4 bg-amber-950/10 border border-amber-950/50 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
            <span className="flex items-center gap-1.5 animate-pulse">🔥 ESTADO DE LA PARRILLA</span>
            <span>TEMP: 260°C</span>
          </div>
          <div className="text-[11px] text-slate-300 leading-normal space-y-1">
            <div className="flex justify-between border-b border-amber-950/20 pb-1">
              <span>Nivel Crujiente de Tocino:</span>
              <span className="font-bold text-amber-300">MÁXIMO (GOLDEN CRUNCH)</span>
            </div>
            <div className="flex justify-between">
              <span>Escala Picante Chipotle:</span>
              <span className="font-bold text-amber-300">8.5/10 (Grado Universitario)</span>
            </div>
          </div>
          <div className="text-[10px] text-amber-500/40 text-center font-mono">
            ⚡ INDUSTRIAL GRATE • AUTHENTIC JUICE ⚡
          </div>
        </div>
      )
    };
  }

  if (norm.includes('pizza') || norm.includes('pizzería') || norm.includes('pizzeria') || norm.includes('italiana')) {
    return {
      primaryBg: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950',
      primaryCardBg: 'bg-slate-950/90 border-emerald-900/30 backdrop-blur-md',
      accentColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accentHover: 'hover:bg-emerald-500',
      accentText: 'text-emerald-400',
      borderColor: 'border-emerald-900/40 focus:border-emerald-500',
      badgeStyle: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60',
      glowShadow: 'shadow-[0_0_30px_rgba(16,185,129,0.07)]',
      fontTitle: 'font-sans font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-green-300 to-amber-300',
      decoratedTitleSuffix: ' 🍕🌿',
      themeWidget: (
        <div className="p-4 bg-emerald-950/10 border border-emerald-950/50 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
            <span className="flex items-center gap-1.5 animate-pulse">🧱 HORNO DE PIEDRA RECTOR</span>
            <span>ESTADO: LISTO</span>
          </div>
          <div className="text-[11px] text-slate-300 leading-normal space-y-1">
            <div className="flex justify-between border-b border-emerald-950/30 pb-1">
              <span>Leña Utilizada:</span>
              <span className="font-bold text-emerald-300">Encino regional de Tamaulipas</span>
            </div>
            <div className="flex justify-between">
              <span>Costra Rellena de Queso:</span>
              <span className="font-bold text-emerald-300">DISPONIBLE (+Asadero)</span>
            </div>
          </div>
          <div className="text-[9px] text-emerald-500/50 text-center font-mono">
            🇮🇹 TRATTORIA TAMAULIPECA 🌿
          </div>
        </div>
      )
    };
  }

  if (norm.includes('café') || norm.includes('cafe') || norm.includes('cafetería') || norm.includes('cafeteria') || norm.includes('postres') || norm.includes('crepas')) {
    return {
      primaryBg: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-950/20 via-slate-950 to-slate-950',
      primaryCardBg: 'bg-slate-950/90 border-pink-950/40 backdrop-blur-md',
      accentColor: 'bg-pink-600 hover:bg-pink-700 text-white',
      accentHover: 'hover:bg-pink-500',
      accentText: 'text-pink-400',
      borderColor: 'border-pink-905/40 focus:border-pink-500',
      badgeStyle: 'bg-pink-950/40 text-pink-400 border border-pink-900/60',
      glowShadow: 'shadow-[0_0_30px_rgba(236,72,153,0.07)]',
      fontTitle: 'font-sans font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400',
      decoratedTitleSuffix: ' ☕🍪',
      themeWidget: (
        <div className="p-4 bg-pink-950/10 border border-pink-950/50 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-pink-400">
            <span className="flex items-center gap-1.5">🎵 EN REPRODUCCIÓN (LO-FI)</span>
            <span>VOL: 25%</span>
          </div>
          <div className="text-[11px] text-slate-300 leading-normal space-y-1">
            <div className="flex justify-between border-b border-pink-950/20 pb-1">
              <span>Canal de Radio:</span>
              <span className="font-bold text-pink-300">Estudio / Café Nocturno ☕</span>
            </div>
            <div className="flex justify-between">
              <span>Grado de Aroma en Aire:</span>
              <span className="font-bold text-pink-300">Canela Dulce & Malta</span>
            </div>
          </div>
          <div className="text-[10px] text-pink-500/40 text-center font-mono">
            ☕ COZY NOOK TO STUDY & SIP 📖
          </div>
        </div>
      )
    };
  }

  // Default elegant corporate brand theme
  return {
    primaryBg: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-slate-950 to-slate-950',
    primaryCardBg: 'bg-slate-950/90 border-slate-850 backdrop-blur-md',
    accentColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    accentHover: 'hover:bg-indigo-500',
    accentText: 'text-indigo-400',
    borderColor: 'border-slate-800 focus:border-indigo-500',
    badgeStyle: 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/60',
    glowShadow: 'shadow-[0_0_30px_rgba(99,102,241,0.05)]',
    fontTitle: 'font-sans font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400',
    decoratedTitleSuffix: ' 🚀🍽️',
    themeWidget: (
      <div className="p-4 bg-indigo-950/10 border border-indigo-950/50 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-indigo-400">
          <span className="flex items-center gap-1.5">📈 RENDIMIENTO DE CAMPAÑA</span>
          <span>SÚPER EFICIENTE</span>
        </div>
        <div className="text-[11px] text-slate-300 leading-normal space-y-1">
          <div className="flex justify-between border-b border-indigo-950/20 pb-1">
            <span>Market-Fit Score:</span>
            <span className="font-bold text-indigo-300">97.8% (Destacado)</span>
          </div>
          <div className="flex justify-between">
            <span>Conversión Local:</span>
            <span className="font-bold text-indigo-300">Alta Viabilidad</span>
          </div>
        </div>
        <div className="text-[9px] text-indigo-505 text-center font-mono uppercase">
          🚀 Marca validada en red académica Victoria
        </div>
      </div>
    )
  };
};

export default function RestaurantPortal({ userRole, username, onExploreNexus, onSelectRestaurantForChat }: RestaurantPortalProps) {
  const [restaurants, setRestaurants] = useState<RestaurantPage[]>([]);
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [selectedRest, setSelectedRest] = useState<RestaurantPage | null>(null);

  // Expanded user interaction navigation & buying states
  const [isInsidePage, setIsInsidePage] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');
  const [paymentOption, setPaymentOption] = useState<string>('mkt_card');
  const [orderReceipt, setOrderReceipt] = useState<any | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

  // Review Form States
  const [formRating, setFormRating] = useState<number>(5);
  const [formOpinion, setFormOpinion] = useState<string>('');
  const [formTargetType, setFormTargetType] = useState<'business' | 'webpage'>('business');
  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Handle live buy execution
  const handleBuyProduct = async (product: StoreProduct) => {
    if (!selectedRest) return;
    setIsPlacingOrder(true);
    
    const orderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      gamertag: username || 'CONS_RED_LOCAL',
      itemId: product.id,
      itemName: product.name,
      price: product.price,
      xpReward: 15, // standard bonus for community interaction
      status: 'pending',
      restaurantId: selectedRest.id,
      restaurantName: selectedRest.name,
      customNotes: purchaseNotes.trim() || 'Despachado con empaque bento estándar',
      paymentMethod: paymentOption,
      createdAt: new Date().toISOString()
    };

    try {
      const isPublic = selectedRest.status === 'published';
      if (isPublic) {
        await addDoc(collection(db, 'orders'), newOrder);
      } else {
        console.log("Simulación de venta: el restaurante está en borrador. No se guardará en Firestore.");
      }
      
      // Build printed coupon/ticket receipt
      setOrderReceipt({
        id: orderId,
        product: product,
        notes: purchaseNotes.trim() || 'Sin notas especiales',
        payment: paymentOption === 'mkt_card' ? 'Tarjeta Estudiante MKT 💳' : paymentOption === 'coppel_qr' ? 'QR Coppel Estudis 📲' : 'Moneda Escolar 🪙',
        date: isPublic ? new Date().toLocaleTimeString() : `${new Date().toLocaleTimeString()} (SIMULADO)`,
        deliveryEst: isPublic 
          ? '12-18 minutos (Entrega bento en campus)' 
          : '🍔 MODO SIMULACIÓN: No se guardó debido a estado BORRADOR'
      });
      setSelectedProduct(null);
      setPurchaseNotes('');
    } catch (err) {
      console.error("Error creating community order:", err);
      alert("Error al despachar el pedido. Revisa tu conexión.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Sync real-time restaurants and reviews
  useEffect(() => {
    // 1. Restaurants listener
    const unsubRest = onSnapshot(collection(db, 'restaurants'), (snapshot) => {
      const list: RestaurantPage[] = [];
      snapshot.forEach(d => {
        list.push(d.data() as RestaurantPage);
      });
      setRestaurants(list);
    });

    // 2. Reviews listener
    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const list: RestaurantReview[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as RestaurantReview);
      });
      setReviews(list);
    });

    return () => {
      unsubRest();
      unsubReviews();
    };
  }, []);

  // Merge Firestore restaurants and Mock database for classmate engagement
  const getAllPublishedRestaurants = (): RestaurantPage[] => {
    // We only put the custom created restaurants here. Nexus goes in its own highlighted spotlight!
    const publishedDb = restaurants.filter(r => r.status === 'published' && r.id !== NEXUS_PROJECT.id);
    return [...publishedDb, ...MOCK_CLASSMATE_RESTAURANTS];
  };

  const classmateListings = getAllPublishedRestaurants();

  // Handle post review
  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRest || !formOpinion.trim()) return;

    setSubmitting(true);
    setSuccessMsg(false);

    const newReview: Omit<RestaurantReview, 'id'> = {
      restaurantId: selectedRest.id,
      username: username || 'Consumidor Anónimo',
      userRole: userRole,
      rating: formRating,
      opinion: formOpinion.trim(),
      targetType: formTargetType,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'reviews'), newReview);
      setFormOpinion('');
      setFormRating(5);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error("Error writing review:", err);
      alert("Error al enviar la reseña. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRestReviews = (rId: string) => {
    const dbReviews = reviews.filter(rev => rev.restaurantId === rId);
    if (dbReviews.length > 0) return dbReviews;

    if (rId === NEXUS_PROJECT.id) {
      return [
        {
          id: 'n-r1',
          restaurantId: NEXUS_PROJECT.id,
          username: 'Sofía Aguilar',
          userRole: 'consumer' as AppUserRole,
          rating: 5,
          opinion: 'El sistema "Table Raid" con modificadores de dificultad es brutal. Aumenta la diversión al máximo y le da un valor agregado tremendo al local físico.',
          targetType: 'business' as const,
          createdAt: '2026-06-01T15:00:00Z'
        },
        {
          id: 'n-r2',
          restaurantId: NEXUS_PROJECT.id,
          username: 'MKT_Expert_Victoria',
          userRole: 'retailer' as AppUserRole,
          rating: 5,
          opinion: 'La estética dark de alta gama combinada con tipografías sans geometricas como Space Grotesk crea una atmósfera premium que ningún restaurante de la zona tiene. Es un benchmark para nosotros de MKT.',
          targetType: 'webpage' as const,
          createdAt: '2026-06-01T16:00:00Z'
        }
      ];
    }

    if (rId === 'rest_mkt_carla') {
      return [
        {
          id: 'c-r1',
          restaurantId: 'rest_mkt_carla',
          username: 'Daniel Rocha',
          userRole: 'consumer' as AppUserRole,
          rating: 4,
          opinion: 'Me encanta el diseño de las luces de neón en la cabecera. Es súper estético para fotos de Instagram, ideal para chavos de nuestra carrera.',
          targetType: 'webpage' as const,
          createdAt: '2026-06-01T18:00:00Z'
        },
        {
          id: 'c-r2',
          restaurantId: 'rest_mkt_carla',
          username: 'Prof_Mendoza_MKT',
          userRole: 'retailer' as AppUserRole,
          rating: 5,
          opinion: 'El caldo denso apunta directo al nicho nocturno universitario. Es una idea estupenda para canalizar la fatiga y brindar confort con un diseño de empaque impecable.',
          targetType: 'business' as const,
          createdAt: '2026-06-01T19:00:00Z'
        }
      ];
    }

    if (rId === 'rest_mkt_javier') {
      return [
        {
          id: 'j-r1',
          restaurantId: 'rest_mkt_javier',
          username: 'Regina Valdez',
          userRole: 'consumer' as AppUserRole,
          rating: 4,
          opinion: 'Ir a comer y que te den todo organizado en una cajita compacta y biodegradable simplifica todo, no se ensucia nada y el branding se ve espectacular.',
          targetType: 'business' as const,
          createdAt: '2026-06-01T20:00:00Z'
        },
        {
          id: 'j-r2',
          restaurantId: 'rest_mkt_javier',
          username: 'UX_Inspector',
          userRole: 'retailer' as AppUserRole,
          rating: 5,
          opinion: 'El diseño web minimalista y limpio refuerza muy bien la esencia de empaques limpios. Sin elementos innecesarios. Es una gran lección visual.',
          targetType: 'webpage' as const,
          createdAt: '2026-06-01T21:00:00Z'
        }
      ];
    }

    return [
      {
        id: 'g-r1',
        restaurantId: rId,
        username: 'Socio de Red',
        userRole: 'consumer' as AppUserRole,
        rating: 4,
        opinion: 'Me gusta bastante la propuesta. Se nota la dedicación mercadológica en el slogan y la alineación del concepto de alimentos.',
        targetType: 'business' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'g-r2',
        restaurantId: rId,
        username: 'Crítico de Layout',
        userRole: 'retailer' as AppUserRole,
        rating: 4,
        opinion: 'La página tiene un estilo nítido y la portada encaja bien. Invita a comprar rápido con botones de acción grandes.',
        targetType: 'webpage' as const,
        createdAt: new Date().toISOString()
      }
    ];
  };

  const activeReviews = selectedRest ? getRestReviews(selectedRest.id) : [];
  const averageRating = (activeReviews.length > 0)
    ? (activeReviews.reduce((acc, r) => acc + r.rating, 0) / activeReviews.length).toFixed(1)
    : '5.0';

  if (isInsidePage && selectedRest) {
    const products = getProductsForCategory(selectedRest.category);
    const currentTheme = getThemeForCategory(selectedRest.category, selectedRest.name);

    return (
      <div className={`max-w-7xl mx-auto px-4 mt-6 space-y-8 animate-fadeIn pb-16 transition-all duration-300 rounded-3xl p-2 md:p-4 ${currentTheme.primaryBg}`}>
        {/* TOP BAR / NAVIGATION WITH RETURN BUTTON */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border p-4 rounded-2xl shadow-2xl transition-all ${currentTheme.primaryCardBg} ${currentTheme.borderColor}`}>
          <button
            onClick={() => {
              setIsInsidePage(false);
              setOrderReceipt(null);
            }}
            className={`px-4 py-2.5 bg-slate-900 border font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] ${currentTheme.accentText} ${currentTheme.borderColor} hover:border-amber-500/40`}
          >
            <ArrowLeft className="w-4 h-4" />
            Salir de la Página / Regresar al Hub ↩
          </button>
          
          <div className="text-[11px] font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            Canal Abierto de: <strong className="text-white font-sans font-extrabold">{selectedRest.name}</strong>
          </div>
        </div>

        {/* HERO HEADER SECTION WITH CUSTOM IMAGE URL & CORRECTION SYSTEM */}
        <div className={`relative h-64 rounded-3xl overflow-hidden border shadow-2xl flex items-end p-6 md:p-8 ${currentTheme.borderColor} ${currentTheme.glowShadow}`}>
          <img 
            src={selectedRest.bannerUrl} 
            alt={selectedRest.name} 
            className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Custom Unsplash food fallback in case user provided blockable or invalid url
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"></div>
          
          <div className="relative z-10 space-y-2.5 max-w-3xl">
            <span className={`text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase tracking-widest ${currentTheme.badgeStyle}`}>
              {selectedRest.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-sans font-black tracking-tight uppercase leading-none text-white drop-shadow-md">
              <span className={currentTheme.fontTitle}>{selectedRest.name}</span>
              <span className="text-2xl">{currentTheme.decoratedTitleSuffix}</span>
            </h1>
            <p className="text-xs md:text-sm text-yellow-400 font-mono font-bold uppercase tracking-widest italic drop-shadow">
              "{selectedRest.slogan || "Diseño e Identidad del Negocio Local"}"
            </p>
          </div>
        </div>

        {/* INTERACTIVE COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT AREA: SHOP WINDOW & PRODUCTS CATALOG OR INVOICE */}
          <div className="lg:col-span-7 space-y-6">
            
            {orderReceipt ? (
              /* THERMAL TICKET RECEIPT WINDOW */
              <div className={`border p-6 rounded-3xl shadow-2xl space-y-5 animate-scaleUp ${currentTheme.primaryCardBg} ${currentTheme.borderColor}`}>
                <div className="flex items-center gap-3 text-emerald-400">
                  <div className="p-2.5 rounded-full bg-emerald-950 border border-emerald-800">
                    <Check className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-base uppercase tracking-tight text-white">¡PEDIDO CONFIRMADO Y EN VIABILIDAD!</h3>
                    <p className="text-[10px] font-mono text-emerald-400">PAGO DE MEMBRESÍA VIRTUAL PROCESADO CON ÉXITO</p>
                  </div>
                </div>

                <div className="bg-white text-slate-900 font-mono text-xs p-6 rounded-xl space-y-4 border border-slate-300 shadow-inner max-w-md mx-auto">
                  <div className="text-center border-b border-dashed border-slate-400 pb-3">
                    <h4 className="font-bold text-sm tracking-widest uppercase">{selectedRest.name}</h4>
                    <p className="text-[10px] text-slate-500 uppercase">{selectedRest.category}</p>
                    <p className="text-[9px] text-slate-400 mt-1">Cd. Victoria, Tamaulipas</p>
                  </div>

                  <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
                    <div className="flex justify-between">
                      <span>ORDEN ID:</span>
                      <span className="font-bold">{orderReceipt.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FECHA / HORA:</span>
                      <span>{orderReceipt.date}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>CLIENTE / MARKETER:</span>
                      <span className="font-bold uppercase truncate max-w-[120px]">{username}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-b border-dashed border-slate-400 pb-3">
                    <div className="flex justify-between">
                      <span className="font-bold uppercase">{orderReceipt.product.name}</span>
                      <span className="font-bold">${orderReceipt.product.price}.00 MXN</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans italic leading-tight pl-2">
                      Detalle: {orderReceipt.product.description}
                    </p>
                    <p className="text-[10px] text-indigo-700 bg-indigo-50 p-1 px-1.5 rounded font-sans leading-tight">
                      📝 Nota para preparación: {orderReceipt.notes}
                    </p>
                  </div>

                  <div className="space-y-1 border-b border-dashed border-slate-400 pb-3">
                    <div className="flex justify-between font-bold">
                      <span>SUBTOTAL:</span>
                      <span>${orderReceipt.product.price}.00 MXN</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>IVA (16% EXENTO MKT):</span>
                      <span>$0.00 MXN</span>
                    </div>
                    <div className="flex justify-between text-indigo-600 text-sm font-black border-t border-slate-200 pt-1.5">
                      <span>TOTAL DEBITADO:</span>
                      <span>${orderReceipt.product.price}.00 MXN</span>
                    </div>
                  </div>

                  <div className="text-center font-bold text-[10px] space-y-1 pt-1 text-slate-600">
                    <p>MÉTODO: {orderReceipt.payment}</p>
                    <p className="text-indigo-600">★ LOGRO ADQUIRIDO: +15 XP REALES ★</p>
                    <p className="text-[9px] text-slate-350 mt-2 font-bold">||||| | ||| || |||| || ||| || ||</p>
                    <p className="text-[8px] text-slate-400">Gracias por apoyar las marcas académicas</p>
                  </div>
                </div>

                <div className="flex justify-center border-t border-slate-900/40 pt-4">
                  <button
                    onClick={() => setOrderReceipt(null)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Seguir Explorando el Menú 🍱
                  </button>
                </div>
              </div>
            ) : (
              /* DYNAMIC PRODUCTS CATALOG */
              <div className={`border p-5 md:p-6 rounded-3xl shadow-xl space-y-6 animate-fadeIn ${currentTheme.primaryCardBg} ${currentTheme.borderColor} ${currentTheme.glowShadow}`}>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h2 className="font-sans font-black text-lg text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                      <ShoppingBag className={`w-5 h-5 ${currentTheme.accentText}`} /> Catálogo de Productos y Botines de la Casa
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Como jurado de mercado u comensal de Cd. Victoria, puedes adquirir las siguientes propuestas de la marca para probar su viabilidad u obtener cupones de descuento.
                    </p>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-md animate-pulse ${currentTheme.badgeStyle}`}>
                    VIP DE COLEGAS
                  </span>
                </div>

                {/* THEMATIC INTERACTIVE SIMULATION WIDGET */}
                <div className="transition-all duration-300">
                  {currentTheme.themeWidget}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 hover:border-slate-700 hover:bg-slate-900/90 transition-all flex flex-col justify-between space-y-3 shadow-md hover:shadow-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-3xl bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">{p.icon}</span>
                          <span className={`text-[11px] font-mono font-extrabold ${currentTheme.accentText}`}>${p.price} MXN</span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-xs uppercase tracking-tight">{p.name}</h4>
                          <p className="text-[11px] text-slate-405 leading-normal mt-1 block">
                            {p.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-900/90 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">+15 XP de Apoyo</span>
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setOrderReceipt(null);
                          }}
                          className={`px-4 py-1.5 hover:scale-105 active:scale-95 text-white font-sans font-bold text-[10px] tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-md ${currentTheme.accentColor} ${currentTheme.accentHover}`}
                        >
                          Comprar 🛒
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Incubator Outline details footer */}
                <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2 text-xs leading-relaxed">
                  <h4 className="font-bold text-slate-200 font-sans flex items-center gap-1.5 uppercase tracking-wider">
                    <Info className={`w-4 h-4 ${currentTheme.accentText}`} /> Eslogan y Concepto Estratégico de {selectedRest.ownerName}
                  </h4>
                  <p className="text-slate-400">
                    {selectedRest.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 border-t border-slate-900/60 text-[10px] font-mono text-slate-500">
                    <div>
                      Creador: <span className="text-slate-300 font-bold uppercase">{selectedRest.ownerName || 'Marketer'}</span>
                    </div>
                    <div>•</div>
                    <div>Edad: <span className="text-slate-305 font-bold">{selectedRest.ownerAge || 25} Años</span></div>
                    <div>•</div>
                    <div>Estudios MKT: <span className={`font-bold ${selectedRest.studiedMarketing ? 'text-emerald-450' : 'text-slate-400'}`}>{selectedRest.studiedMarketing ? 'SÍ (RECOMENDADO)' : 'NO'}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT AREA: REAL-TIME CRITIQUES & ANALYSIS FEEDBACK CONSOLE */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`border p-5 md:p-6 rounded-3xl space-y-5 shadow-xl ${currentTheme.primaryCardBg} ${currentTheme.borderColor} ${currentTheme.glowShadow}`}>
              <div>
                <span className={`text-[9px] font-mono tracking-wider px-2.5 h-6 inline-flex items-center rounded uppercase font-bold ${currentTheme.badgeStyle}`}>
                  CONSOLA AUDITORA DE COLEGAS
                </span>
                <h3 className="font-sans font-black text-sm text-white pt-1.5 uppercase tracking-wide">Evaluaciones de Viabilidad</h3>
                <p className="text-xs text-slate-400">Deber como colega marketer: opina de la imagen corporativa o de la propuesta comercial de la marca.</p>
              </div>

              {/* Form to submit review inside page */}
              <form onSubmit={handlePostReview} className="border-t border-slate-900/65 pt-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase">¿Qué auditarás?</label>
                    <select
                      value={formTargetType}
                      onChange={(e) => setFormTargetType(e.target.value as 'business' | 'webpage')}
                      className={`w-full bg-slate-900/90 border rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans cursor-pointer ${currentTheme.borderColor}`}
                    >
                      <option value="business">Estrategia Comercial</option>
                      <option value="webpage">Diseño / Layout Web</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase font-mono">Calificar:</label>
                    <div className={`flex gap-1 items-center bg-slate-900/90 border rounded-xl px-2 py-1 justify-center h-[34px] ${currentTheme.borderColor}`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className="transition-colors hover:scale-110"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              star <= formRating ? 'text-amber-500 fill-amber-500' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase font-mono">Tu Dictamen:</label>
                  <textarea
                    rows={2}
                    required
                    placeholder={
                      formTargetType === 'business'
                        ? 'Opina sobre precios, slogan o enfoque de grupo de edad...'
                        : 'Opina sobre colores, usabilidad o maquetación bento...'
                    }
                    value={formOpinion}
                    onChange={(e) => setFormOpinion(e.target.value)}
                    className={`w-full bg-slate-900/90 border rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-sans ${currentTheme.borderColor}`}
                  />
                </div>

                {successMsg && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-mono rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 animate-bounce" />
                    <span>¡Auditoría agregada a la bitácora!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-2.5 text-white font-sans font-bold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer ${currentTheme.accentColor} ${currentTheme.accentHover}`}
                >
                  {submitting ? 'Guardando...' : 'Publicar Dictamen'}
                </button>
              </form>

              {/* Reviews logs list showing on the brand view page */}
              <div className="border-t border-slate-930 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span>Opiniones ({activeReviews.length})</span>
                  <span className="text-amber-500 flex items-center gap-1 font-bold">
                    ★ {averageRating} / 5.0
                  </span>
                </div>

                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                  {activeReviews.map((rev) => (
                    <div key={rev.id} className="p-3 bg-slate-900/30 rounded-xl border border-slate-900/80 space-y-1.5 text-[11px] animate-fadeIn">
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-200 uppercase">{rev.username}</span>
                          <span className={`text-[8px] font-mono px-1 rounded uppercase font-semibold ${
                            rev.targetType === 'business' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' : 'bg-slate-850 text-slate-300'
                          }`}>
                            {rev.targetType === 'business' ? 'Concepto' : 'Diseño'}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          <strong>{rev.rating}</strong>
                        </div>
                      </div>
                      <p className="text-slate-400 leading-relaxed font-sans">{rev.opinion}</p>
                    </div>
                  ))}
                  {activeReviews.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-500 font-mono italic">
                      Sin dictámenes aún de este negocio escolar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE PURCHASE CHECKOUT DRAWER OVERLAY */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn backdrop-blur-sm">
            <div className={`border p-6 rounded-3xl w-full max-w-md shadow-2xl relative space-y-5 animate-scaleUp ${currentTheme.primaryCardBg} ${currentTheme.borderColor}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Hoja de Adquisición</h3>
                  <p className={`text-[10px] font-mono uppercase tracking-widest mt-0.5 ${currentTheme.accentText}`}>Cd. Victoria Red Culinaria</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Item overview */}
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-850 flex gap-4 items-center">
                <span className="text-3xl bg-slate-950 p-2.5 rounded-xl border border-slate-800">{selectedProduct.icon}</span>
                <div className="overflow-hidden">
                  <h4 className="text-white font-extrabold text-xs uppercase truncate">{selectedProduct.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">{selectedProduct.description}</p>
                  <strong className={`font-mono text-xs block mt-1 ${currentTheme.accentText}`}>${selectedProduct.price} MXN</strong>
                </div>
              </div>

              {/* Chef Notes / Custom instructions */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase">📝 Instrucciones o Modificación de Receta:</label>
                <input
                  type="text"
                  placeholder="Ej. Sin cebolla, extra aderezo, empaquetar para llevar..."
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 font-sans ${currentTheme.borderColor}`}
                />
              </div>

              {/* Payment selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase font-mono">💳 Método de Pago Escolar / Virtual:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('mkt_card')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentOption === 'mkt_card'
                        ? 'bg-amber-950/20 text-amber-400 border-amber-500/80 ring-1 ring-amber-500/20'
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-305'
                    }`}
                  >
                    <span>💳 Tarjeta MKT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('coppel_qr')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentOption === 'coppel_qr'
                        ? 'bg-amber-955/20 text-amber-450 border-amber-500/80 ring-1 ring-amber-500/20'
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-305'
                    }`}
                  >
                    <span>📲 QR Coppel</span>
                  </button>
                </div>
              </div>

              {/* Total review */}
              <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-900 text-slate-300">
                <span>TOTAL A DEBITAR:</span>
                <span className={`text-sm font-black font-mono ${currentTheme.accentText}`}>${selectedProduct.price}.00 MXN</span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="py-2.5 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-400 font-sans font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-850 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleBuyProduct(selectedProduct)}
                  disabled={isPlacingOrder}
                  className={`py-2.5 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 ${currentTheme.accentColor} ${currentTheme.accentHover}`}
                >
                  ⚙️ {isPlacingOrder ? 'Emitiendo...' : 'Confirmar Compra 🛒'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto px-4 mt-6">
      
      {/* LEFT COLUMN: Restaurants Showcase & Classmate listings */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Spotlighting Nexus: The ultimate benchmark, ONLY section maintaining Neo colors */}
        <div className="relative overflow-hidden bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="absolute top-0 right-0 py-1 px-3 text-[9px] font-mono font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black uppercase tracking-widest rounded-bl-xl">
            🔥 EL PROYECTO MÁS POPULAR
          </div>
          
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-slate-800">
              <img src={NEXUS_PROJECT.bannerUrl} alt="Nexus Gastro" className="w-full h-full object-cover opacity-80" />
              {/* Cyan overlay to reinforce custom showcase */}
              <div className="absolute inset-0 bg-cyan-950/20"></div>
            </div>
            
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-sans font-extrabold text-lg text-white tracking-tight">{NEXUS_PROJECT.name}</h3>
                <span className="font-mono text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  Showcase Referente
                </span>
              </div>
              
              <p className="text-[11px] text-fuchsia-400 font-mono font-semibold uppercase tracking-wider">{NEXUS_PROJECT.slogan}</p>
              <p className="text-xs text-slate-400 leading-normal line-clamp-3">
                {NEXUS_PROJECT.description}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-900/80 flex flex-wrap gap-4 items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">
              Desarrollador: <strong className="text-slate-300">NEXUS DEV TEAM</strong>
            </span>
            
            <button
              id="operate-nexus-showcase-btn"
              onClick={() => {
                setSelectedRest(NEXUS_PROJECT);
                onExploreNexus();
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-sans font-bold text-xs tracking-wide rounded-xl shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all text-center uppercase"
            >
              Operar Showcase Nexus 🚀
            </button>
          </div>
        </div>

        {/* Separator / Title of class project page list in clean serious typography */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-2">
          <div>
            <h2 className="font-sans font-black text-lg text-slate-200 tracking-tight flex items-center gap-2 uppercase">
              <Compass className="w-5 h-5 text-indigo-400" /> Propuestas de la Comunidad de Negocios
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empresas gastronómicas diseñadas por estudiantes de mercadotecnia (22-35 años) para Cd. Victoria.
            </p>
          </div>
          <span className="bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold px-3 py-1 rounded bg-slate-900 text-slate-400 self-start sm:self-center uppercase">
            {classmateListings.length} PROPUESTAS ACTIVAS
          </span>
        </div>

        {/* List of user/classmate restaurants in high executive serious style */}
        <div className="space-y-4">
          {classmateListings.map((item) => {
            const reviewsCount = getRestReviews(item.id).length;
            const isSelected = selectedRest?.id === item.id;
            
            return (
              <div
                key={item.id}
                onClick={() => setSelectedRest(item)}
                className={`cursor-pointer bg-slate-950 border rounded-2xl overflow-hidden transition-all duration-300 block relative hover:border-slate-700 ${
                  isSelected 
                    ? 'border-indigo-500 ring-1 ring-indigo-500/30' 
                    : 'border-slate-850'
                }`}
              >
                <div className="h-28 w-full overflow-hidden relative">
                  <img src={item.bannerUrl} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                  
                  <div className="absolute top-3 left-4">
                    <span className="font-mono text-[9px] bg-slate-900/90 font-bold border border-slate-800 px-2 py-0.5 rounded text-slate-300 tracking-wider uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2 -mt-2 relative z-10">
                  <div>
                    <h3 className="font-sans font-bold text-base text-white">{item.name}</h3>
                    <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">{item.slogan || 'Concepto Creativo de Negocio'}</p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                    {item.description}
                  </p>

                  <div className="pt-3 border-t border-slate-900/60 flex flex-wrap gap-3 items-center justify-between text-[10px] font-mono text-slate-500">
                    <div className="flex gap-2.5 items-center">
                      <span>Creador: <strong className="text-slate-300 uppercase">{item.ownerName}</strong></span>
                      {item.studiedMarketing && (
                        <span className="bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded text-[8px] uppercase">Estudiante MKT</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <strong>{(getRestReviews(item.id).reduce((sum, r) => sum + r.rating, 0) / Math.max(1, reviewsCount)).toFixed(1)}</strong>
                      <span>({reviewsCount} opiniones)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Critique system & business concept feedback console */}
      <div className="lg:col-span-5 space-y-6">
        {selectedRest ? (
          <div className="bg-slate-950 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5 shadow-xl animate-fadeIn relative">
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-wider bg-slate-900 text-slate-400 px-2.5 h-5 inline-flex items-center rounded uppercase border border-slate-800 font-bold">
                DIAGNÓSTICO GASTRONÓMICO
              </span>
              <h2 className="font-sans font-extrabold text-lg text-white pt-1">{selectedRest.name}</h2>
              <span className="text-xs text-indigo-400 block font-medium uppercase font-mono">{selectedRest.slogan}</span>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-850">
              <span className="text-[9px] font-mono text-slate-500 block uppercase mb-1 font-bold">Concepto en Incubadora</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedRest.description}
              </p>
            </div>

            {/* BIG ACTION BUTTON TO IMMERSE ENTER DIGITAL STOREFRONT / BRAND WEB PAGE */}
            <button
              id="enter-classmate-page-btn"
              onClick={() => {
                setIsInsidePage(true);
                setOrderReceipt(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-3 bg-gradient-to-r from-indigo-505 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-550 text-white font-sans font-black text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/30 active:scale-95 border border-indigo-500/30 animate-pulse"
            >
              <Compass className="w-4 h-4" />
              Entrar al Negocio Digital 🚀
            </button>

            {selectedRest.id !== NEXUS_PROJECT.id && userRole === 'retailer' && (
              <button
                onClick={() => onSelectRestaurantForChat(selectedRest.id, selectedRest.name)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-300 font-mono text-[10px] tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                💬 Solicitar sesión técnica sobre "{selectedRest.name}"
              </button>
            )}

            {/* Critique Posting engine - serious styling */}
            <form onSubmit={handlePostReview} className="border-t border-slate-900 pt-4 space-y-4">
              <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-400" /> Emitir Auditoría de Mercado u Opinión
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 block font-bold">¿Qué auditarás?</label>
                  <select
                    value={formTargetType}
                    onChange={(e) => setFormTargetType(e.target.value as 'business' | 'webpage')}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                  >
                    <option value="business">Estrategia Comercial de Alimentos</option>
                    <option value="webpage">Maqueta Web / Layout de Página</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 block font-bold">Asignar Estrellas:</label>
                  <div className="flex gap-1 items-center bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="transition-colors hover:scale-110"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= formRating ? 'text-amber-500 fill-amber-500' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 block font-bold">Tu criterio como {userRole === 'retailer' ? 'Colega Mercadólogo' : 'Consumidor Público'}:</label>
                <textarea
                  rows={2}
                  required
                  placeholder={
                    formTargetType === 'business'
                      ? 'Opina sobre la viabilidad de la comida, precios, slogan o enfoque de grupo de edad...'
                      : 'Opina sobre los colores, usabilidad, legibilidad tipográfica u orden de los menús...'
                  }
                  value={formOpinion}
                  onChange={(e) => setFormOpinion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                />
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-mono rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>¡Crítica guardada! visible para el dueño del negocio.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-indigo-900/30 cursor-pointer"
              >
                {submitting ? 'Guardando en DB...' : 'Registrar Auditoría en Bitácora'}
              </button>
            </form>

            {/* Critique Log List */}
            <div className="border-t border-slate-900/90 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>Opiniones y Auditorías ({activeReviews.length})</span>
                <span className="text-amber-500 flex items-center gap-1 font-bold">
                  ★ {averageRating} / 5.0
                </span>
              </div>

              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                {activeReviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 space-y-1 text-[11px]">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-200 uppercase">{rev.username}</span>
                        <span className={`text-[8px] font-mono px-1 rounded uppercase font-semibold ${
                          rev.targetType === 'business' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' : 'bg-slate-850 text-slate-300'
                        }`}>
                          {rev.targetType === 'business' ? 'Concepto' : 'Diseño Web'}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <strong>{rev.rating}</strong>
                      </div>
                    </div>
                    <p className="text-slate-450 leading-relaxed font-sans">{rev.opinion}</p>
                    <span className="text-[9px] text-slate-600 block pl-1 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-slate-900 p-8 rounded-2xl text-center flex flex-col justify-center items-center py-16 h-full min-h-[350px]">
            <Compass className="w-12 h-12 text-slate-700 animate-spin mb-4" />
            <h4 className="font-sans text-sm font-extrabold text-slate-400 uppercase tracking-wider">Esperando Selección</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mt-2 mx-auto">
              Haz clic sobre cualquiera de las propuestas de negocios culinarios de la izquierda para ver su estrategia y opinar de su viabilidad comercial.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
