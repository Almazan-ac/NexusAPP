import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { RestaurantPage, RestaurantReview } from '../types';
import { Store, Palette, MessageSquare, Laptop, Check, AlertCircle, Sparkles, Star, Globe, Megaphone, ArrowLeft, ArrowRight, Share2, HelpCircle, Home, TrendingUp, FileText, CheckSquare } from 'lucide-react';

interface RestaurantCreatorProps {
  ownerId: string;
  ownerName: string;
  ownerAge?: number;
  studiedMarketing?: boolean;
}

const PRESET_BANNERS = [
  { name: 'Gastro Hamburguesería Gourmet', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600' },
  { name: 'Tacos Premium & Mezcalería', url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600' },
  { name: 'Café de Especialidad Retro', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600' },
  { name: 'Sushi & Ramen Fusion Co.', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600' },
  { name: 'Pizzería Rústica Italiana', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600' }
];

export default function RestaurantCreator({ ownerId, ownerName, ownerAge, studiedMarketing }: RestaurantCreatorProps) {
  const [activeTab, setActiveTab] = useState<'hub' | 'edit' | 'audit' | 'menu-planner' | 'mkt-planner' | 'permits' | 'preview'>('hub');
  
  // Real-time states
  const [restaurant, setRestaurant] = useState<RestaurantPage | null>(null);
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Form & Wizard states
  const [wizardStep, setWizardStep] = useState<number | null>(null);
  const [showConvincerScreen, setShowConvincerScreen] = useState(true);
  const [sandboxCategory, setSandboxCategory] = useState('Neon Ramen & Sushi Corner');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Gastro-Bar');
  const [slogan, setSlogan] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [wizardError, setWizardError] = useState<string | null>(null);

  // Menu Planner States
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [selectedAddon, setSelectedAddon] = useState<string>('');
  const [plannerDishName, setPlannerDishName] = useState<string>('');
  const [plannerDishStory, setPlannerDishStory] = useState<string>('');

  // Marketing Tasks Checklist State
  const [completedMktTasks, setCompletedMktTasks] = useState<Record<string, boolean>>({
    't1': false,
    't2': false,
    't3': false,
    't4': false,
    't5': false,
  });

  // Legal/COEPRIS Checklist State
  const [completedPermitTasks, setCompletedPermitTasks] = useState<Record<string, boolean>>({
    'p1': false,
    'p2': false,
    'p3': false,
    'p4': false,
  });

  const handleGenerateDish = () => {
    if (!selectedBase || !selectedAddon) return;
    
    const baseNames: Record<string, string> = {
      'Pechuga Crispy': 'El Crunch-Quake Pollo de la Red',
      'Carne molida Angus': 'La Smash Siniestra Premium',
      'Porchetta ahumada': 'La Porchetta Ahumada de la Victoria',
      'Queso de Hebra': 'La Costra Alquímica de Mil Cuerdas',
      'Champiñón Portobello': 'El Hongo Zen Fusionado'
    };

    const baseDescriptions: Record<string, string> = {
      'Pechuga Crispy': 'una enorme pechuga marinada en suero de leche de 24 horas arropada con empanizado rústico ultra ruidoso',
      'Carne molida Angus': 'un doble disco de blend Angus premium aplastado con cebollita caramelizada en su propio jugo para máxima densidad',
      'Porchetta ahumada': 'rebanadas gruesas de porchetta artesanal ahumada con leña de mezcal regional que se deshace al tacto',
      'Queso de Hebra': 'un bloque denso de queso de hebra local fundido hasta lograr un broncíneo visual perfecto e hilo infinito',
      'Champiñón Portobello': 'un sombrero carnoso de Portobello asado con adobo de salsa de soya y hierbas aromáticas montado al fuego'
    };

    const addonNames: Record<string, string> = {
      'Salsa de Jamaica al Mezcal': 'con Reducción Clandestina de Mezcal',
      'Aderezo Chipocludo Flamin': 'con Polvo de Cráter Flamin',
      'Chutney de Naranja & Chile Piquín': 'con Destello Agrio Piquín',
      'Costra de Chicharrón de la Sierra': 'con Explosión Crujiente de Rancho',
      'Aioli de Ajo Negro asado': 'con Perfume Cósmico de Ajo Negro'
    };

    const addonDescriptions: Record<string, string> = {
      'Salsa de Jamaica al Mezcal': 'bañado con una salsa espesa de flor de jamaica salvaje infusionada con mezcal de la casa, aportando acidez salvaje y retrogusto herbal.',
      'Aderezo Chipocludo Flamin': 'coronado con hilos de aderezo chipotle dulce y una lluvia ácida de polvo Flamin Hot que genera un impacto cromático y picante brutal en cada bocado.',
      'Chutney de Naranja & Chile Piquín': 'goteado con chutney artesanal de cítricos del estado y brotes enteros de chile piquín del monte, desatando notas agridulces altamente adictivas.',
      'Costra de Chicharrón de la Sierra': 'envuelto en un abrigo crujiente de chicharrón de cerdo frito en manteca y sazonado en sal de grano, óptimo para dar contraste de texturas.',
      'Aioli de Ajo Negro asado': 'untado con un aioli cremoso y espeso de ajo negro maduro y notas ahumadas, entregando un perfil umami ideal para paladares experimentados.'
    };

    const dishName = `${baseNames[selectedBase]} ${addonNames[selectedAddon]}`;
    const dishStory = `Inspirado por el Gastro Hub de Tamaulipas, este platillo destaca por presentar ${baseDescriptions[selectedBase]}, ${addonDescriptions[selectedAddon]} Presentado en empaque bento biodegradable, ideal para fotos y reseñas instantáneas.`;

    setPlannerDishName(dishName);
    setPlannerDishStory(dishStory);
  };

  // Load from Firestore
  useEffect(() => {
    let active = true;
    const rId = `rest_${ownerId}`;
    setLoading(true);

    const unsubRest = onSnapshot(doc(db, 'restaurants', rId), (snapshot) => {
      if (!active) return;
      if (snapshot.exists()) {
        const data = snapshot.data() as RestaurantPage;
        setRestaurant(data);
        setName(data.name || '');
        setCategory(data.category || 'Gastro-Bar');
        setSlogan(data.slogan || '');
        setDescription(data.description || '');
        setStatus(data.status || 'draft');
        setWizardStep(null); // It exists, so we don't need wizard

        const isPreset = PRESET_BANNERS.some(b => b.url === data.bannerUrl);
        if (isPreset) {
          setBannerUrl(data.bannerUrl);
          setCustomBannerUrl('');
        } else {
          setBannerUrl('');
          setCustomBannerUrl(data.bannerUrl);
        }
      } else {
        // Doesn't exist, activate Step-by-Step wizard from scratch
        setRestaurant(null);
        setWizardStep(1);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    const q = query(collection(db, 'reviews'), where('restaurantId', '==', rId));
    const unsubReviews = onSnapshot(q, (snapshot) => {
      if (!active) return;
      const list: RestaurantReview[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as RestaurantReview);
      });
      setReviews(list);
    });

    return () => {
      active = false;
      unsubRest();
      unsubReviews();
    };
  }, [ownerId]);

  const handleSavePage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const targetBanner = customBannerUrl.trim() || bannerUrl;
    const rId = `rest_${ownerId}`;

    const newPage: RestaurantPage = {
      id: rId,
      name: name.trim() || 'Restaurante sin Nombre',
      category: category || 'Gastro-Bar',
      slogan: slogan.trim() || 'Alta innovación culinaria',
      description: description.trim() || 'Sin descripción detallada.',
      bannerUrl: targetBanner,
      ownerId: ownerId || 'unknown_owner',
      ownerName: ownerName || 'COLEGA',
      status: status || 'draft',
      createdAt: restaurant ? restaurant.createdAt : new Date().toISOString()
    };

    if (ownerAge !== undefined && ownerAge !== null) {
      newPage.ownerAge = ownerAge;
    } else {
      newPage.ownerAge = 26;
    }

    if (studiedMarketing !== undefined && studiedMarketing !== null) {
      newPage.studiedMarketing = studiedMarketing;
    } else {
      newPage.studiedMarketing = true;
    }

    try {
      await setDoc(doc(db, 'restaurants', rId), newPage);
      setSaveSuccess(true);
      setWizardStep(null); // Finish wizard when saved first time!
      setActiveTab('hub'); // Redirect to initial hub landing page!
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Error saving restaurant page:", err);
      setSaveError("Hubo un contratiempo al subir tu página culinaria a Firestore: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const getRenderedReviews = (): RestaurantReview[] => {
    if (reviews.length > 0) return reviews;

    // Sweet prefilled marketing reviews to keep it premium
    return [
      {
        id: 'mock-p1',
        restaurantId: `rest_${ownerId}`,
        username: 'Socio de Red',
        userRole: 'consumer',
        rating: 4,
        opinion: `El concepto gastronómico se siente viable y asertivo: la propuesta para la categoría "${category}" encaja directo con el grupo de edad de 22 a 35 años en Cd. Victoria. Me gusta la claridad del slogan.`,
        targetType: 'business',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-p2',
        restaurantId: `rest_${ownerId}`,
        username: 'Crítico de Layout',
        userRole: 'retailer',
        rating: 5,
        opinion: 'La estética de la página web del restaurante es sumamente seria e impactante. El banner de cabecera se integra de manera ideal y el slogan destaca perfectamente al primer vistazo.',
        targetType: 'webpage',
        createdAt: new Date().toISOString()
      }
    ];
  };

  const currentReviews = getRenderedReviews();
  const averageRating = currentReviews.length
    ? (currentReviews.reduce((sum, r) => sum + r.rating, 0) / currentReviews.length).toFixed(1)
    : '5.0';

  // Spinner loader
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
        <p className="text-xs font-mono">SINCRONIZANDO CON BASE DE DATOS FIRESTORE...</p>
      </div>
    );
  }

  // WIZARD RENDER (Create Page from Scratch)
  if (wizardStep !== null) {
    if (showConvincerScreen) {
      return (
        <div className="max-w-4xl mx-auto space-y-8 px-4 py-8 animate-fadeIn text-left">
          {/* Welcome title hero */}
          <div className="bg-slate-950 border border-slate-850 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-4 flex-1">
              <span className="text-[10px] font-mono tracking-widest bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-extrabold px-3 py-1 rounded border border-indigo-500/20 uppercase">
                🚀 Oportunidad de Emprendimiento Culinario
              </span>
              <h2 className="font-sans font-black text-2xl md:text-3xl text-white tracking-tight leading-tight uppercase font-extrabold">
                ¿Por qué construir tu Escaparate Digital en Tamaulipas Gastro Hub?
              </h2>
              <p className="text-xs md:text-sm text-slate-400 font-sans leading-relaxed">
                Antes de gastar en locales e infraestructuras físicas de alto riesgo en Cd. Victoria, los socios culinarios diseñan y evalúan su market-fit de forma digital. Consigue feedback escolar asertivo, alinea tus recetas regionales y formaliza tu marca con herramientas de última gama.
              </p>
            </div>
            
            <div className="hidden md:flex flex-col items-center justify-center p-5 bg-slate-900 border border-slate-800 rounded-2xl w-44 shrink-0 text-center space-y-1 shadow-lg">
              <span className="text-3xl">🎯</span>
              <strong className="text-white font-mono font-black text-sm uppercase">Cd. Victoria</strong>
              <span className="text-[10px] tracking-widest text-slate-500 font-mono font-bold uppercase">Meta de MKT</span>
              <span className="text-xs font-mono text-emerald-450 font-bold mt-1">22-35 años</span>
            </div>
          </div>

          {/* Core Interactive Sandbox Section */}
          <div className="space-y-4">
            <div className="border-b border-slate-900 pb-2">
              <h3 className="text-white font-sans font-black text-sm uppercase tracking-wider flex items-center gap-2 font-bold">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                Prueba un Layout en 1 Clic (Simulador Cohesivo de Temas)
              </h3>
              <p className="text-xs text-slate-400 leading-normal font-sans">
                Selecciona uno de los nichos culinarios prioritarios y previsualiza instantáneamente cómo se calibrará la paleta de colores y la interfaz interactiva de tu futura página de alimentos:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Selector buttons column */}
              <div className="md:col-span-5 grid grid-cols-1 gap-2.5">
                {[
                  { name: 'Concepto Hamburguesas Gourmet', label: '🍔 Bento Burger Format', desc: 'Tonos amarillos y asados con consola de plancha de alta temperatura.' },
                  { name: 'Taquería Creativa & Drinks', label: '🌮 Tacos Gourmet & Clamor', desc: 'Variante moderna con atmósfera nocturna para cautivar comensales.' },
                  { name: 'Café Boutique & Repostería', label: '☕ Café Especialidad Retro', desc: 'Colorido rosa acogedor y sutil con widget de música lofi incluido.' },
                  { name: 'Neon Ramen & Sushi Corner', label: '🍜 Neon Ramen Cyber-Fusion', desc: 'Estilo asiático rojo audaz con reloj sensor para cocción de caldos.' },
                  { name: 'Pizzería con Horno de Leña', label: '🍕 Pizzería Artesanal', desc: 'Gama tradicional esmeralda para resaltar productos y leña regional.' }
                ].map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSandboxCategory(s.name)}
                    className={`p-3 rounded-2xl text-left border transition-all duration-200 text-xs cursor-pointer ${
                      sandboxCategory === s.name
                        ? 'bg-indigo-950/20 border-indigo-500/80 shadow shadow-indigo-950 text-white'
                        : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-350'
                    }`}
                  >
                    <strong className="block font-sans font-bold uppercase">{s.label}</strong>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5 leading-normal">{s.desc}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Theme Showcase Card Column */}
              <div className="md:col-span-7 bg-slate-950 border border-slate-900 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between h-full min-h-[340px] shadow-2xl">
                {(() => {
                  const sMatched = sandboxCategory.toLowerCase();
                  let cardGradient = 'from-slate-900 to-slate-950';
                  let cardAccent = 'text-indigo-400';
                  let cardBadge = 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/50';
                  let cardProductList = [];
                  let cardWidgetText = '';

                  if (sMatched.includes('ramen')) {
                    cardGradient = 'from-red-950/30 to-slate-950';
                    cardAccent = 'text-red-400';
                    cardBadge = 'bg-red-950/40 text-red-400 border border-red-900/40';
                    cardProductList = ['Neon Shoyu Ramen 🍜', 'Avocado Sake Roll 🍣'];
                    cardWidgetText = '🔥 COCINA CALDOS: 98°C lento • Temperatura estancada';
                  } else if (sMatched.includes('burger')) {
                    cardGradient = 'from-amber-950/25 to-slate-950';
                    cardAccent = 'text-amber-400';
                    cardBadge = 'bg-amber-950/40 text-amber-400 border border-amber-900/40';
                    cardProductList = ['Smash Classic Box 🍔', 'Sweet Potato Fries 🍟'];
                    cardWidgetText = '🍳 PLANCHA REC-V4: 260°C • Searing crust activa';
                  } else if (sMatched.includes('tacos')) {
                    cardGradient = 'from-orange-950/25 to-slate-950';
                    cardAccent = 'text-orange-400';
                    cardBadge = 'bg-orange-950/30 text-orange-400 border border-orange-900/40';
                    cardProductList = ['Taco Costra Ribeye 🌮', 'Mezcalita de Jamaica 🍹'];
                    cardWidgetText = '🔥 ASADOR: Carbón de mezquite local encendido';
                  } else if (sMatched.includes('pizza')) {
                    cardGradient = 'from-emerald-950/20 to-slate-950';
                    cardAccent = 'text-emerald-400';
                    cardBadge = 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40';
                    cardProductList = ['Pizza Napolitana Rústica 🍕', 'Tiramisú de la Sierra 🍮'];
                    cardWidgetText = '🧱 HORNO LEÑA: 450°C estable • Sabor tradicional';
                  } else if (sMatched.includes('café') || sMatched.includes('cafe')) {
                    cardGradient = 'from-pink-950/20 to-slate-950';
                    cardAccent = 'text-pink-400';
                    cardBadge = 'bg-pink-950/40 text-pink-400 border border-pink-905/40';
                    cardProductList = ['Flat White Premium ☕', 'Matcha Croissant Box 🥐'];
                    cardWidgetText = '☕ ESPRESSO BAR: Extracción aromática 25s lista';
                  }

                  return (
                    <div className="space-y-4 text-left font-sans">
                      {/* Live demo header */}
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-550 border-b border-slate-900 pb-2">
                        <span>LIVE PREVIEW SIMULADO</span>
                        <span className="text-emerald-400 font-extrabold uppercase">● EN LÍNEA APTO</span>
                      </div>

                      {/* Cover element */}
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${cardGradient} border border-slate-850 space-y-2.5`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-[8.5px] font-mono tracking-widest uppercase font-extrabold px-2.5 py-0.5 rounded ${cardBadge}`}>{sandboxCategory}</span>
                          <span className={`text-xs font-mono font-black ${cardAccent}`}>★ 5.0 (Promedio Votos)</span>
                        </div>
                        <h4 className="font-sans font-black text-slate-200 uppercase text-xs tracking-wider">
                          EL ESCAPARATE DIGITAL DE TU RESTAURANTE
                        </h4>
                        <p className="text-[10px] text-slate-400 italic font-sans leading-relaxed">"Una frase de marketing persuasiva, orientada a universitarios de entre 22 y 35 años."</p>
                      </div>

                      {/* Embedded metrics widget */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-[9.5px] font-mono text-slate-400 flex items-center gap-2">
                        <span className="text-base animate-pulse">⚙️</span>
                        <span>{cardWidgetText}</span>
                      </div>

                      {/* Catalog row */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-slate-500 block font-bold uppercase">Simulador de Menú Bento:</span>
                        <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                          {cardProductList.map((pr, i) => (
                            <div key={i} className="p-2 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center justify-between text-slate-300">
                              <span className="truncate">{pr}</span>
                              <span className={`text-[9.5px] font-mono font-black ${cardAccent}`}>$125</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Disclaimer footer */}
                      <p className="text-[9px] text-slate-500 leading-normal font-sans text-left">
                        ✓ Generación automática de empaques Bento, colores de tema responsive congruentes y sincronización de comentarios MKT.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-sans">
            {[
              { title: '🔒 Resguardo y Borradores Libres', desc: 'Edita tu página en total privacidad. Diseña tu slogan, cambia de presets cromáticos y lánzala al público general usando tu selector con un solo clic.', icon: '📝' },
              { title: '📊 Crítica y Validación MKT Directa', desc: 'Recibe análisis constructivos de tus colegas licenciados en marketing de Cd. Victoria para validar tu ticket promedio, empaques bento y copywriting escolar.', icon: '💬' },
              { title: '🧑‍🔬 Planificador y Alquimia de Recetas', desc: 'Herramientas integradas en tu estación para formular nombres de platillos de alta penetración y su narrativa publicitaria respectiva de manera automática.', icon: '✨' },
              { title: '📈 Checklists de Crecimiento & Sanidad', desc: 'No dejes cabos sueltos. Sigue la guía de cumplimiento para control sanitario (COEPRIS) y el plan de viralización de videos en TikTok e Instagram.', icon: '⚡' }
            ].map((b, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{b.icon}</span>
                  <strong className="text-xs uppercase text-slate-205 font-bold">{b.title}</strong>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Core Call to Action */}
          <div className="text-center p-6 sm:p-8 bg-slate-950 border border-slate-900 rounded-3xl space-y-4 shadow-xl">
            <h4 className="font-sans font-bold text-gray-200 text-sm uppercase">¿Listo para cautivar al mercado meta universitario?</h4>
            <p className="text-[11px] text-slate-400 max-w-lg mx-auto leading-relaxed">
              Nuestro asistente guiado te ayudará a subir tu marca a la red local en 4 simples pasos. ¡Estás a minutos de validar tu nicho!
            </p>
            <button
              onClick={() => {
                setShowConvincerScreen(false);
                setWizardStep(1);
              }}
              className="px-8 py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white font-sans font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg active:scale-97 cursor-pointer hover:shadow-indigo-950/50 inline-flex items-center gap-2 border border-indigo-555/20 text-center w-full sm:w-auto justify-center"
            >
              ✨ ¡Crear mi Borrador de Página Web Ahora! (Asistente 4 Pasos)
              <ArrowRight className="w-4.5 h-4.5 animate-pulse" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6 px-4 py-3">
        {/* Progress header */}
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[9px] font-mono tracking-widest bg-indigo-500/15 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded font-bold uppercase">
              SECCIÓN: ASISTENTE DE INCUBACIÓN
            </span>
            <h2 className="font-sans font-extrabold text-xl text-white">Crea tu Página Web de Alimentos desde Cero</h2>
            <p className="text-xs text-slate-400 leading-normal">
              Diseña un escaparate digital para tu negocio de comida. Destinado a la red local de alumnos de marketing de entre 22 y 35 años.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                  step === wizardStep 
                    ? 'bg-indigo-600 text-white font-mono scale-110' 
                    : step < wizardStep 
                      ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/80 font-mono' 
                      : 'bg-slate-900 text-slate-500 border border-slate-850 font-mono'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard panels */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          
          {wizardStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-900 pb-3">
                <h4 className="font-sans font-bold text-base text-white flex items-center gap-2">
                  <span className="p-1 rounded-md bg-indigo-950 text-indigo-400"><Store className="w-4 h-4" /></span>
                  Paso 1: Branding Base del Negocio
                </h4>
                <p className="text-slate-405 text-xs mt-1">
                  Define las variables iniciales que identificarán comercialmente a tu establecimiento ante los inversores y comensales.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">Nombre de la Marca Gastronómica:</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. ASIA STRAWBERRY SOUFFLÉ, BURGER LAB..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">Nicho de Categoría Alimenticia:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Concepto Hamburguesas Gourmet">Hamburguesería (Bento-box format)</option>
                    <option value="Taquería Creativa & Drinks">Tacos Premium & Clamor Gourmet</option>
                    <option value="Café Boutique & Repostería">Café de Especialidad Retro o Mole</option>
                    <option value="Neon Ramen & Sushi Corner">Fusión Asiática / Ramen & Curries</option>
                    <option value="Pizzería con Horno de Leña">Pizzería Artesanal Italiana</option>
                    <option value="Gastro-Bar Moderno (Benchmark)">Gastro-Bar & Alquimia Gastronómica</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">Eslogan Corporativo / Ganchos:</label>
                  <input
                    type="text"
                    placeholder="E.G. Mordiscos orgánicos con drops de sabor cyberpunk"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 font-sans">
                    Un buen eslogan ayuda a cautivar al público objetivo de estudiantes universitarios y jóvenes profesionales.
                  </p>
                </div>
              </div>

              {wizardError && (
                <div id="wizard-error-step1" className="p-3.5 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{wizardError}</span>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) {
                      setWizardError("Por favor escribe el nombre de tu marca culinaria para poder avanzar.");
                      return;
                    }
                    setWizardError(null);
                    setWizardStep(2);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-950 flex items-center gap-1.5 cursor-pointer"
                >
                  Siguiente paso
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-900 pb-3">
                <h4 className="font-sans font-bold text-base text-white flex items-center gap-2">
                  <span className="p-1 rounded-md bg-indigo-950 text-indigo-400"><Megaphone className="w-4 h-4" /></span>
                  Paso 2: Storytelling del Negocio de Comida
                </h4>
                <p className="text-slate-405 text-xs mt-1">
                  Redacta el propósito comercial y la historia de tus recetas. Esto convencerá a comensales y colegas mercadólogos de evaluarte positivamente.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">Narrativa / Misión del Establecimiento:</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="E.G. Burger Lab nace bajo el empuje de alumnos de mercadotecnia de 26 años. Buscamos erradicar la grasas trans aplicando diseño bento de empaque ecológico, garantizando un unboxing interactivo perfecto para subirse a redes y caldos densos ultra reconfortantes."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                  />
                  <p className="text-[10px] text-slate-500">
                    Tu descripción debe reflejar tus años de estudios de MKT. Destaca tus empaques, simplificación de servicio de mesa o ingredientes asertivos locales para llamar la atención.
                  </p>
                </div>
              </div>

              {wizardError && (
                <div id="wizard-error-step2" className="p-3.5 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{wizardError}</span>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setWizardError(null);
                    setWizardStep(1);
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!description.trim() || description.length < 15) {
                      setWizardError("Por favor escribe una descripción comercial un poco más larga (min 15 caracteres) para cautivar a tu nicho.");
                      return;
                    }
                    setWizardError(null);
                    setWizardStep(3);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-950 flex items-center gap-1.5 cursor-pointer"
                >
                  Siguiente paso
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-900 pb-3">
                <h4 className="font-sans font-bold text-base text-white flex items-center gap-2">
                  <span className="p-1 rounded-md bg-indigo-950 text-indigo-400"><Palette className="w-4 h-4" /></span>
                  Paso 3: Identidad Visual del Sitio
                </h4>
                <p className="text-slate-405 text-xs mt-1">
                  Decide cuál será la imagen descriptiva o foto de portada que encabezará la página del restaurante.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">Elige una Portada de Alta Resolución:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {PRESET_BANNERS.map((preset) => (
                      <div
                        key={preset.name}
                        onClick={() => {
                          setBannerUrl(preset.url);
                          setCustomBannerUrl('');
                        }}
                        className={`cursor-pointer group relative h-20 rounded-xl overflow-hidden border transition-all ${
                          bannerUrl === preset.url && !customBannerUrl
                            ? 'border-indigo-500 scale-[1.01] ring-1 ring-indigo-500/30'
                            : 'border-slate-850 opacity-60 hover:opacity-90'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2 text-center">
                          <span className="text-[10px] font-sans font-extrabold text-white uppercase">{preset.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-900"></div>
                  <span className="flex-shrink mx-3 text-slate-600 text-[9px] font-mono font-bold uppercase tracking-wider">O usa tu propia URL de imagen</span>
                  <div className="flex-grow border-t border-slate-900"></div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-350 font-mono">URL de Imagen Personalizada (Unsplash, Imgur, etc.):</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={customBannerUrl}
                    onChange={(e) => setCustomBannerUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Vista previa en tiempo real de imagen personalizada */}
                {(customBannerUrl.trim() || bannerUrl) && (
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 space-y-2 animate-fadeIn">
                    <span className="text-[10px] font-mono text-indigo-400 block font-bold uppercase">👁️ Vista Previa en Tiempo Real:</span>
                    <div className="relative h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img 
                        src={customBannerUrl.trim() || bannerUrl} 
                        alt="Vista previa de portada" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Safe default fallback image if custom url fails to resolve or load
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600';
                        }}
                      />
                      <div className="absolute bottom-2 left-2 bg-indigo-950/80 px-2 py-0.5 rounded text-[8px] font-mono text-indigo-300 border border-indigo-950">
                        {customBannerUrl.trim() ? "URL PERSONALIZADA" : "IMAGEN DETERMINADA"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWizardStep(4);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-950 flex items-center gap-1.5 cursor-pointer"
                >
                  Finalizar estructura
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-900 pb-3">
                <h4 className="font-sans font-bold text-base text-white flex items-center gap-2">
                  <span className="p-1 rounded-md bg-indigo-950 text-indigo-400"><Check className="w-4 h-4" /></span>
                  Paso 4: Confirmación y Lanzamiento Web
                </h4>
                <p className="text-slate-405 text-xs mt-1">
                  La estructura de tu página está calibrada de forma correcta. Revisa los datos de despliegue antes de publicarlo en el mapa de redes.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Socio Propietario</span>
                    <strong className="text-white uppercase font-sans">{ownerName} (Marketing)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Establecimiento</span>
                    <strong className="text-white uppercase font-sans">{name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Nicho de Mercado</span>
                    <strong className="text-indigo-450 uppercase font-sans bg-indigo-950/40 px-2 py-0.5 rounded text-[11px] font-medium inline-block">{category}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Slogan de Venta</span>
                    <strong className="text-amber-500 font-serif italic">{slogan || 'Sin Slogan'}</strong>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">Misión Comercial de Alimentos</span>
                  <p className="text-slate-400 text-xs leading-relaxed max-h-24 overflow-y-auto">
                    {description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 font-mono block">¿Qué estado de visibilidad prefieres?</label>
                <div className="flex gap-3">
                  <div 
                    onClick={() => setStatus('draft')}
                    className={`flex-1 p-3.5 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                      status === 'draft' ? 'border-amber-600 bg-amber-950/10' : 'border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <input type="radio" checked={status === 'draft'} readOnly className="mt-1" />
                    <div>
                      <strong className="text-xs text-white block">Maqueta en Borrador (Draft)</strong>
                      <span className="text-[10px] text-slate-500 leading-normal block">Invisible para los consumidores críticos. Solo almacena el avance.</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setStatus('published')}
                    className={`flex-1 p-3.5 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                      status === 'published' ? 'border-emerald-600 bg-emerald-950/10' : 'border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <input type="radio" checked={status === 'published'} readOnly className="mt-1" />
                    <div>
                      <strong className="text-xs text-indigo-400 block">Lanzamiento en Vivo (Published)</strong>
                      <span className="text-[10px] text-slate-500 leading-normal block">Publica tu página en el explorador global para que reciba críticas de inmediato.</span>
                    </div>
                  </div>
                </div>
              </div>

              {saveError && (
                <div id="save-error-step4" className="p-3.5 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSaveError(null);
                    setWizardStep(3);
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Regresar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSavePage()}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-900/35 flex items-center gap-2 animate-bounce cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>{saving ? 'Levantando Servidores...' : 'Lanzar mi Página desde Cero 🎉'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STANDARD SPLIT CANVAS (If Page is Already Created)
  const businessReviews = currentReviews.filter((r) => r.targetType === 'business');
  const webpageReviews = currentReviews.filter((r) => r.targetType === 'webpage');

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Intro info tag in serious Slate UI */}
      <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="space-y-1.5 text-center lg:text-left">
          <span className="text-[9px] font-mono tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-800/80 px-2.5 py-0.5 rounded font-bold">ESTACIÓN CREATIVA MKT</span>
          <h2 className="font-sans font-extrabold text-lg text-white pb-0.5 font-bold">Controlador de Escaparate Comercial</h2>
          <p className="text-xs text-slate-400 leading-normal max-w-xl">
            Socio-Creador activo: <strong className="text-white uppercase">{ownerName}</strong> {ownerAge ? `(${ownerAge} años)` : ''} {studiedMarketing ? '• Licenciatura en Mercadotecnia' : ''}. Controla el diseño del layout del restaurante y monitorea lo que opina tu mercado meta.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('hub')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hub'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                : 'bg-slate-900 border-slate-805 text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            Panel Inicial
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                : 'bg-slate-900 border-slate-805 text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            Modificar Datos
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                : 'bg-slate-900 border-slate-805 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            👁️ Vista Previa de Mi Página (Borrador)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white border-slate-700 shadow shadow-indigo-900'
                : 'bg-slate-900 border-slate-805 text-slate-405 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Auditoría ({currentReviews.length})
          </button>
        </div>
      </div>

      {activeTab === 'hub' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Welcome Dashboard Hub */}
          <div className="bg-gradient-to-r from-indigo-950/20 via-slate-950 to-slate-950 border border-slate-850 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="space-y-2">
              <h3 className="text-white font-sans font-extrabold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                ¡Bienvenido a tu Centro de Mando, {ownerName}!
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-sans">
                Desde esta plataforma inicial puedes administrar tu borrador o negocio en la red de Tamaulipas, afinar tus recetas con nuestro planificador interactivo y asegurar tu cumplimiento de trámites.
              </p>
            </div>
          </div>

          {/* Core options grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Status Card */}
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase">ESCAPARATE DIGITAL ACTIVO</span>
                  <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${
                    status === 'published' 
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' 
                      : 'bg-amber-950/40 text-amber-500 border-amber-900/50'
                  }`}>
                    {status === 'published' ? '● LANZADO EN VIVO' : '○ EN BORRADOR / DRAFT'}
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-850">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700">
                    <img 
                      src={customBannerUrl.trim() || bannerUrl} 
                      alt="Banner thumbnail" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <h4 className="text-white font-bold font-sans text-sm truncate uppercase">{name || 'Sin Nombre Definido'}</h4>
                    <p className="text-[11px] text-indigo-400 font-mono tracking-wide">{category}</p>
                    <p className="text-[10px] text-slate-500 italic truncate font-sans">{slogan || 'Sin Slogan cargado'}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Los comensales e inversores de Cd. Victoria ingresan a la sección global para auditar tu propuesta de valor, precios, branding de empaque y viabilidad mercadológica. ¿Quieres mejorar tus datos actuales?
                </p>
              </div>

              <div className="pt-4 border-t border-slate-900/80 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => setActiveTab('edit')}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-950 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Palette className="w-4 h-4" />
                  Editar Escaparate
                </button>
              </div>
            </div>

            {/* Red Feedback / Reviews Audit Card */}
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase font-mono">AUDITORÍA Y CALIFICACIÓN</span>
                  <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-mono font-bold text-amber-500">{averageRating}/5.0</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block font-mono">Últimas Evaluaciones en Red:</span>
                  {currentReviews.slice(0, 2).map((rev) => (
                    <div key={rev.id} className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1 text-[11px] leading-relaxed">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <strong className="text-slate-350 uppercase">{rev.username} ({rev.userRole === 'retailer' ? 'MKT' : 'CLIENTE'})</strong>
                        <span className="text-amber-550 flex items-center gap-0.5 font-bold">★ {rev.rating}</span>
                      </div>
                      <p className="text-slate-400 line-clamp-2 font-sans">{rev.opinion}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900/80">
                <button
                  onClick={() => setActiveTab('audit')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ver Todas las Opiniones ({currentReviews.length})
                </button>
              </div>
            </div>
          </div>

          {/* Section: Extra Options that can help them */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-900 pb-2">
              <h3 className="text-white font-sans font-extrabold text-base flex items-center gap-2 uppercase tracking-wide">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Módulos de Ayuda y Planificación Comercial
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Herramientas interactivas diseñadas específicamente para afinar tu plan comercial antes del lanzamiento.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Option A: Culinary Recipe Idea Planner */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-950/50 text-indigo-400 border border-indigo-900"><Sparkles className="w-4.5 h-4.5" /></span>
                    <strong className="text-xs text-white font-sans uppercase">PLANIFICADOR DE RECETAS DE IMPACTO (22-35y)</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Combina ingredientes regionales de Tamaulipas y tendencias de comida rápida bento para estructurar de forma automática nombres culinarios atractivos y su storytelling comercial.
                  </p>

                  <div className="space-y-2.5 pt-1.5 text-xs text-slate-350">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Base del Platillo:</span>
                      <select
                        value={selectedBase}
                        onChange={(e) => setSelectedBase(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-[11px] text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">-- Elige un ingrediente base --</option>
                        <option value="Pechuga Crispy">🐔 Pechuga de Pollo Crispy Crunch</option>
                        <option value="Carne molida Angus">🥩 Smash Angus premium de la Casa</option>
                        <option value="Porchetta ahumada">🐷 Porchetta ahumada con Mezcal regional</option>
                        <option value="Queso de Hebra">🧀 Costra de Queso de Hebra artesanal</option>
                        <option value="Champiñón Portobello">🍄 Sombrero de Champiñón Portobello asado</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Aderezo o Salsa Signature:</span>
                      <select
                        value={selectedAddon}
                        onChange={(e) => setSelectedAddon(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-[11px] text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">-- Elige un aderezo premium --</option>
                        <option value="Salsa de Jamaica al Mezcal">🌺 Reducción de Jamaica al Mezcal</option>
                        <option value="Aderezo Chipocludo Flamin">🔥 Aderezo Chipocludo con Polvo Flamin Hot</option>
                        <option value="Chutney de Naranja & Chile Piquín">🍊 Chutney cítrico con Chile Piquín silvestre</option>
                        <option value="Costra de Chicharrón de la Sierra">🥓 Costra crujiente de Chicharrón norteño</option>
                        <option value="Aioli de Ajo Negro asado">🧄 Aioli cremoso de Ajo Negro asado</option>
                      </select>
                    </div>
                  </div>

                  {plannerDishName && (
                    <div className="p-3 bg-indigo-950/20 border border-indigo-900 rounded-xl space-y-1.5 animate-fadeIn">
                      <span className="text-[9px] font-mono text-indigo-400 font-bold block uppercase bg-indigo-950/50 px-1.5 py-0.5 rounded w-max">RECETA SUGERIDA</span>
                      <h5 className="text-white text-xs font-sans font-black uppercase tracking-tight">{plannerDishName}</h5>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">{plannerDishStory}</p>
                      
                      <button
                        onClick={() => {
                          const text = `Platillo: ${plannerDishName}\n\nDescripción del concepto: ${plannerDishStory}`;
                          navigator.clipboard.writeText(text);
                          alert("📋 ¡Idea de receta e historia copiada! Ya la puedes emplear en tu descripción comercial.");
                        }}
                        className="text-[9px] font-mono text-slate-300 font-bold hover:text-white uppercase underline block pt-1 cursor-pointer"
                      >
                        [Copiar receta]
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleGenerateDish}
                    disabled={!selectedBase || !selectedAddon}
                    className="w-full py-2 bg-indigo-600 disabled:bg-slate-900 hover:bg-indigo-700 disabled:text-slate-650 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    🚀 Diseñar Platillo Promocional
                  </button>
                </div>
              </div>

              {/* Option B: Marketing Campaign Growth Checklist */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-950/50 text-indigo-400 border border-indigo-900"><TrendingUp className="w-4.5 h-4.5" /></span>
                    <strong className="text-xs text-white font-sans uppercase">PLAN DE VIRALIZACIÓN & LANZAMIENTO MKT</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Estrategia asertiva para captar la atención de alumnos de marketing de entre 22 y 35 años. Marca el cumplimiento de estas misiones de crecimiento:
                  </p>

                  <div className="space-y-2 pt-1 font-sans">
                    {[
                      { id: 't1', label: 'Estructurar un video de TikTok mostrando la apertura o unboxing de tu caja bento.' },
                      { id: 't2', label: 'Desplegar un código de descuento (-15% MKT Victoria) para capturar estudiantes.' },
                      { id: 't3', label: 'Establecer una alianza colaborativa con influencers universitarios de Tamaulipas.' },
                      { id: 't4', label: 'Organizar un reto de consumo rápido en el campus para ganar snacks gratis.' },
                      { id: 't5', label: 'Imprimir códigos QR en las mesas enlazando directo a estas maquetas web.' }
                    ].map((task) => (
                      <div 
                        key={task.id} 
                        onClick={() => {
                          setCompletedMktTasks(prev => ({ ...prev, [task.id]: !prev[task.id] }));
                        }}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                          completedMktTasks[task.id] 
                            ? 'bg-indigo-950/20 border-indigo-900/50 text-slate-300' 
                            : 'bg-slate-900/40 border-transparent hover:border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 mt-0.5 rounded border flex items-center justify-center ${
                          completedMktTasks[task.id] 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'border-slate-700'
                        }`}>
                          {completedMktTasks[task.id] && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                        </div>
                        <span className="text-[10px] leading-normal">{task.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Growth stats progress */}
                  <div className="space-y-1 pt-1 font-mono">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                      <span>PLAN CONCLUIDO</span>
                      <span className="text-indigo-400">
                        {Math.round((Object.values(completedMktTasks).filter(Boolean).length / 5) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-300" 
                        style={{ width: `${(Object.values(completedMktTasks).filter(Boolean).length / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <p className="text-[9px] text-slate-500 leading-relaxed font-sans mt-auto">
                  💡 Cumplir con estos pasos ayuda a posicionar la marca con mayor rapidez.
                </p>
              </div>

              {/* Option C: Legal Tamaulipas Compliance Guide */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-950/50 text-indigo-400 border border-indigo-900"><FileText className="w-4.5 h-4.5" /></span>
                    <strong className="text-xs text-white font-sans uppercase">CHECKLIST DE TRÁMITES REALES (CD. VICTORIA)</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Tener los permisos en regla previene clausuras de COEPRIS y proyecta excelencia. Asegura tu cumplimiento local:
                  </p>

                  <div className="space-y-2 pt-1 font-sans">
                    {[
                      { id: 'p1', title: 'Registro COEPRIS Victoria', desc: 'Trámite oficial de control contra riesgos sanitarios e higiene en cocina.' },
                      { id: 'p2', title: 'Aviso de Apertura SAT', desc: 'Inscripción fiscal bajo el régimen de incorporación de alimentos.' },
                      { id: 'p3', title: 'Licencia Municipal de Funcionamiento', desc: 'Autorización de uso de suelo comercial expedida por el Ayuntamiento.' },
                      { id: 'p4', title: 'Registro de Marca IMPI', desc: 'Seguridad legal del nombre de tu marca para evitar cobias.' }
                    ].map((step) => (
                      <div 
                        key={step.id}
                        onClick={() => {
                          setCompletedPermitTasks(prev => ({ ...prev, [step.id]: !prev[step.id] }));
                        }}
                        className={`p-2 rounded-lg border cursor-pointer transition-all ${
                          completedPermitTasks[step.id]
                            ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-350'
                            : 'bg-slate-900/40 border-transparent hover:border-slate-800 text-slate-455'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            completedPermitTasks[step.id]
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-700'
                          }`}>
                            {completedPermitTasks[step.id] && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                          </div>
                          <strong className="text-[10px] text-white block">{step.title}</strong>
                        </div>
                        <p className="text-[9px] text-slate-500 pl-6 pt-0.5 leading-normal">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900/85 text-[10px] text-slate-405 flex justify-between items-center bg-slate-900/20 p-2 rounded-xl font-mono">
                  <span>Trámites Completados:</span>
                  <span className="font-bold text-emerald-400">
                    {Object.values(completedPermitTasks).filter(Boolean).length} / 4
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Left */}
          <form onSubmit={handleSavePage} className="lg:col-span-5 bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-5 shadow-xl">
            <h3 className="font-sans text-xs font-bold text-white tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3 uppercase">
              <Palette className="w-4 h-4 text-indigo-400" /> Identidad Visual e Información
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Nombre de la Marca Alimenticia:</label>
              <input
                type="text"
                required
                placeholder="E.G. NEON RAMEN STUDIO..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 uppercase font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Nicho de Grupo de Edad:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Concepto Hamburguesas Gourmet">Hamburguesería (Bento-box format)</option>
                <option value="Taquería Creativa & Drinks">Tacos Premium & Clamor Gourmet</option>
                <option value="Café Boutique & Repostería">Café de Especialidad Retro o Mole</option>
                <option value="Neon Ramen & Sushi Corner">Fusión Asiática / Ramen & Curries</option>
                <option value="Pizzería con Horno de Leña">Pizzería Artesanal Italiana</option>
                <option value="Gastro-Bar Moderno (Benchmark)">Gastro-Bar & Alquimia Gastronómica</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Eslogan de Impacto (Marketing):</label>
              <input
                type="text"
                placeholder="E.G. Caldo espeso para curar el cansancio nocturno..."
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Propuesta de Valor Comercial:</label>
              <textarea
                rows={3}
                required
                placeholder="Explica qué ofreces, empaques, servicio..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-600 font-sans resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Selecciona Portada de Fondo:</label>
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap py-1 scrollbars-thin select-none">
                {PRESET_BANNERS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setBannerUrl(preset.url);
                      setCustomBannerUrl('');
                    }}
                    className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-full transition-all flex-shrink-0 font-mono ${
                      bannerUrl === preset.url && !customBannerUrl
                        ? 'bg-indigo-600 border border-indigo-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-850'
                    }`}
                  >
                    {preset.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase">O escribe una URL de imagen:</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={customBannerUrl}
                onChange={(e) => setCustomBannerUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-650 font-mono"
              />
            </div>

            {/* Vista previa en tiempo real en panel lateral */}
            {(customBannerUrl.trim() || bannerUrl) && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 space-y-1.5 animate-fadeIn">
                <span className="text-[9px] font-mono text-indigo-400 block font-bold uppercase">👁️ Vista Previa de Portada:</span>
                <div className="relative h-28 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img 
                    src={customBannerUrl.trim() || bannerUrl} 
                    alt="Vista previa de portada" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600';
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Estado de Visibilidad Red Local:</label>
              <div className="grid grid-cols-2 gap-3 pb-1">
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    status === 'draft'
                      ? 'bg-slate-900 text-amber-500 border-amber-600 shadow'
                      : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
                  }`}
                >
                  Maqueta Borrador
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    status === 'published'
                      ? 'bg-indigo-950/20 text-indigo-400 border-indigo-500 shadow'
                      : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
                  }`}
                >
                  Lanzado en Vivo
                </button>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Página web guardada con éxito en los servidores Firestore.</span>
              </div>
            )}

            {saveError && (
              <div id="standard-save-error" className="p-3 bg-red-950/25 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{saveError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-indigo-950"
            >
              {saving ? 'Guardando Maqueta...' : 'Sincronizar y Actualizar Portal'}
            </button>
          </form>

          {/* Live Preview Right - serious, polished styling to convey real look */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-850 flex justify-between items-center text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><Laptop className="w-4 h-4 text-slate-500" /> vista previa responsiva del restaurante</span>
              <span className={`text-[10px] font-bold uppercase rounded h-5 inline-flex items-center px-2.5 ${status === 'published' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
                {status === 'published' ? '● live en red' : '○ draft / borrador'}
              </span>
            </div>

            <div>
              {/* Cover head */}
              <div className="h-44 w-full relative overflow-hidden">
                <img 
                  src={customBannerUrl.trim() || bannerUrl} 
                  alt="Restaurant cover preview" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-60" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="text-[9px] font-mono font-black tracking-wider text-indigo-400 bg-indigo-950/90 border border-indigo-900/50 px-2 py-0.5 rounded uppercase">
                    {category}
                  </span>
                </div>
              </div>

              {/* Detail body */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <h2 className="font-sans font-black text-2xl text-white uppercase tracking-tight">{name || 'Sin Nombre Todavía'}</h2>
                  <p className="text-sm font-semibold italic text-indigo-400 font-mono tracking-wider">{slogan || 'El slogan de marketing aparecerá de manera elegante aquí'}</p>
                </div>

                <div className="pt-3 border-t border-slate-900 text-xs text-slate-300 leading-relaxed font-sans block">
                  <h4 className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-black mb-1.5">Propuesta Comercial y Concepto de Alimentos:</h4>
                  {description || 'Aquí se mostrará tu pitch comercial detallando por qué tu comida, precios o empaques ecológicos bento asombrarán al segmento de jóvenes de la región.'}
                </div>

                <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>Creador: <strong className="text-slate-300 uppercase">{ownerName}</strong></span>
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <strong>{averageRating} / 5.0</strong>
                    <span>({currentReviews.length} auditorías)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'audit' && (
        /* AUDITS/REVIEWS LIST TAB */
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl max-w-4xl mx-auto shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-900 pb-4">
            <div>
              <h3 className="font-sans font-bold text-base text-white uppercase flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" /> Opiniones y Auditorías de Socios
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Comentarios en vivo sobre la viabilidad de tu comida, empaque o diagramación web de la página.
              </p>
            </div>
            
            <div className="bg-slate-900 border border-slate-805 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-amber-500 flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-500" /> CALIFICACIÓN DE LA RED: {averageRating} / 5.0
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Business concept Audits */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-mono tracking-widest text-[#94a3b8] font-bold uppercase pb-1 border-b border-slate-900 flex items-center justify-between">
                <span>Estrategia de Alimentos ({businessReviews.length})</span>
                <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1.5 rounded uppercase font-semibold">Concepto Comercial</span>
              </h4>

              {businessReviews.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-900 rounded-xl text-xs text-slate-500">
                  Sin auditorías conceptuales de platillos todavía.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {businessReviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-slate-905/60 border border-slate-900 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-350 uppercase">{rev.username} ({rev.userRole === 'retailer' ? 'MKT' : 'CLIENTE'})</span>
                        <div className="flex items-center gap-0.5 text-amber-500 pl-2">
                          <Star className="w-3.5 h-3.5 fill-amber-500" /> <strong>{rev.rating}</strong>
                        </div>
                      </div>
                      <p className="text-slate-400 leading-relaxed font-sans">{rev.opinion}</p>
                      <span className="text-[9px] text-slate-650 font-mono block pl-0.5 pt-1">
                        Auditoría: {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (() => {
        const normalized = (category || '').toLowerCase();
        let themeBg = 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950';
        let themeCardBg = 'bg-slate-950/90 border-slate-850 backdrop-blur-md';
        let themeAccent = 'bg-indigo-600 hover:bg-indigo-700 text-white';
        let themeBadge = 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/60';
        let themeBorder = 'border-slate-800';
        let themeText = 'text-indigo-405';
        let themeTitle = 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400';
        let titleSuffix = ' 🍱🍻';
        let widgetNode = null;

        if (normalized.includes('ramen') || normalized.includes('asia') || normalized.includes('sushi') || normalized.includes('fusion') || normalized.includes('fusión')) {
          themeBg = 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/40 via-slate-950 to-slate-950';
          themeCardBg = 'bg-slate-950/90 border-red-950/40 backdrop-blur-md';
          themeAccent = 'bg-red-650 hover:bg-red-700 text-white';
          themeBadge = 'bg-red-950/40 text-red-405 border border-red-900/60';
          themeBorder = 'border-red-900/40';
          themeText = 'text-red-400';
          themeTitle = 'bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-amber-300 to-orange-500';
          titleSuffix = ' 🌸🏯';
          widgetNode = (
            <div className="p-4 bg-red-950/10 border border-red-950/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-red-400">
                <span>🔴 ESTADO DEL CALDO EN VIVO</span>
                <span>TEMP: 98°C</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Sopa base en ebullición lenta con jengibre aromático y cebollines frescos en tiempo real.</p>
            </div>
          );
        } else if (normalized.includes('burger') || normalized.includes('hamburguesa') || normalized.includes('alitas')) {
          themeBg = 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-slate-950 to-slate-950';
          themeCardBg = 'bg-slate-950/95 border-amber-900/30 backdrop-blur-md';
          themeAccent = 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black';
          themeBadge = 'bg-amber-950/40 text-amber-400 border border-amber-900/60';
          themeBorder = 'border-amber-950/50';
          themeText = 'text-amber-400';
          themeTitle = 'bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400';
          titleSuffix = ' 🍔🍟';
          widgetNode = (
            <div className="p-4 bg-amber-950/10 border border-amber-950/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                <span>🔥 PLANCHA INDUSTRIAL ACTIVA</span>
                <span>TEMP: 260°C</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Costra dorada "Sizzling Smash Crunch" activa con doble queso fundido.</p>
            </div>
          );
        } else if (normalized.includes('pizza') || normalized.includes('pizzería') || normalized.includes('pizzeria')) {
          themeBg = 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950';
          themeCardBg = 'bg-slate-950/95 border-emerald-900/30 backdrop-blur-md';
          themeAccent = 'bg-emerald-600 hover:bg-emerald-700 text-white';
          themeBadge = 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60';
          themeBorder = 'border-emerald-900/40';
          themeText = 'text-emerald-400';
          themeTitle = 'bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-green-300 to-amber-300';
          titleSuffix = ' 🍕🌿';
          widgetNode = (
            <div className="p-4 bg-emerald-950/10 border border-emerald-950/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>🧱 HORNO DE LEÑA TRADICIONAL</span>
                <span>ESTADO: LISTO</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Horneo tradicional a alta temperatura con leño de encino aromático de Tamaulipas.</p>
            </div>
          );
        } else if (normalized.includes('café') || normalized.includes('cafe') || normalized.includes('cafetería') || normalized.includes('crepas') || normalized.includes('repostería')) {
          themeBg = 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-950/20 via-slate-950 to-slate-950';
          themeCardBg = 'bg-slate-950/95 border-pink-950/30 backdrop-blur-md';
          themeAccent = 'bg-pink-600 hover:bg-pink-700 text-white';
          themeBadge = 'bg-pink-950/40 text-pink-400 border border-pink-900/60';
          themeBorder = 'border-pink-950/40';
          themeText = 'text-pink-400';
          themeTitle = 'bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400';
          titleSuffix = ' ☕🍪';
          widgetNode = (
            <div className="p-4 bg-pink-950/10 border border-pink-950/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-pink-400">
                <span>🎵 DIAL RADIO COZY LO-FI</span>
                <span>VOLUMEN: 25%</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Música ambiental equilibrada con aroma a tostado profundo y canela.</p>
            </div>
          );
        } else {
          widgetNode = (
            <div className="p-4 bg-indigo-950/10 border border-indigo-950/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-400">
                <span>📈 PROPUESTA ACADÉMICA VALIDADA</span>
                <span>ESTADO: ÓPTIMO</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Concepto calibrado para el nicho de audiencia seleccionado.</p>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-fadeIn text-left">
            {/* Top banner indicator with Action Toggle */}
            <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-[9px] font-mono tracking-widest text-indigo-450 block font-bold uppercase bg-indigo-950/60 border border-indigo-900 w-max px-2 py-0.5 rounded">
                  ESTACIÓN DE PREVISUALIZACIÓN DE BORRADOR
                </span>
                <h3 className="font-sans font-extrabold text-base text-gray-100 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  Estado de tu Escaparate Digital: <strong className={status === 'published' ? 'text-emerald-400 font-extrabold' : 'text-amber-500 font-extrabold'}>{status === 'published' ? 'LANZADO EN VIVO 🚀' : 'MOCK BORRADOR / DRAFT 📝'}</strong>
                </h3>
                <p className="text-xs text-slate-400 leading-normal font-sans">
                  Así se renderiza visualmente tu escaparate digital cuando comensales y otros estudiantes de marketing de Cd. Victoria ingresan desde sus perfiles.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {status === 'draft' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      setStatus('published');
                      const rId = `rest_${ownerId}`;
                      try {
                        await setDoc(doc(db, 'restaurants', rId), {
                          id: rId,
                          name: name.trim() || 'Restaurante sin Nombre',
                          category: category || 'Gastro-Bar',
                          slogan: slogan.trim() || 'Alta innovación culinaria',
                          description: description.trim() || 'Sin descripción.',
                          bannerUrl: customBannerUrl.trim() || bannerUrl,
                          ownerId: ownerId || 'unknown_owner',
                          ownerName: ownerName || 'COLEGA',
                          status: 'published',
                          createdAt: restaurant ? restaurant.createdAt : new Date().toISOString(),
                          ownerAge: ownerAge || 26,
                          studiedMarketing: studiedMarketing !== false
                        });
                        alert("🚀 ¡Felicidades! Tu página ha sido lanzada EN VIVO en la plataforma de Cd. Victoria.");
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-black tracking-wide rounded-xl shadow-lg hover:shadow-indigo-950/50 active:scale-95 transition-all text-center uppercase cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                  >
                    🚀 Lanzar Página en Vivo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      setStatus('draft');
                      const rId = `rest_${ownerId}`;
                      try {
                        await setDoc(doc(db, 'restaurants', rId), {
                          id: rId,
                          name: name.trim() || 'Restaurante sin Nombre',
                          category: category || 'Gastro-Bar',
                          slogan: slogan.trim() || 'Alta innovación culinaria',
                          description: description.trim() || 'Sin descripción.',
                          bannerUrl: customBannerUrl.trim() || bannerUrl,
                          ownerId: ownerId || 'unknown_owner',
                          ownerName: ownerName || 'COLEGA',
                          status: 'draft',
                          createdAt: restaurant ? restaurant.createdAt : new Date().toISOString(),
                          ownerAge: ownerAge || 26,
                          studiedMarketing: studiedMarketing !== false
                        });
                        alert("↩ Tu página ha sido resguardada en estado BORRADOR. Ya no es visible en el escaparate general de clientes.");
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-5 py-2.5 bg-slate-900 border border-amber-600/60 hover:border-amber-500 text-amber-500 font-sans font-black tracking-wide rounded-xl shadow-md active:scale-95 transition-all text-center uppercase cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                  >
                    ↩ Retirar a Borrador
                  </button>
                )}
              </div>
            </div>

            {/* Simulated Live Web Page in Client Perspective with Theme */}
            <div className={`space-y-8 animate-fadeIn pb-12 transition-all duration-300 rounded-3xl p-4 border border-slate-900 ${themeBg}`}>
              {/* Header Hero card with high-resolution banner background */}
              <div className={`relative h-64 md:h-72 rounded-2xl overflow-hidden border ${themeBorder} shadow-2xl flex items-end p-6 md:p-10 transition-transform`}>
                <img 
                  src={customBannerUrl.trim() || bannerUrl} 
                  alt={name} 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-50 hover:scale-102 transition-transform duration-500" 
                  onError={(e) => {
                    // Safe Unsplash default image
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                
                <div className="relative z-10 space-y-3 max-w-3xl text-left">
                  <span className={`text-[9px] font-mono font-black px-3.5 py-1 rounded-full uppercase tracking-widest ${themeBadge}`}>
                    {category}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-sans font-black tracking-tight uppercase leading-none text-white drop-shadow-md">
                    <span className={themeTitle}>{name || 'Sin Nombre Todavía'}</span>
                    <span className="text-2xl md:text-3xl">{titleSuffix}</span>
                  </h1>
                  <p className="text-xs md:text-sm text-yellow-400 font-mono font-bold uppercase tracking-widest italic drop-shadow">
                    "{slogan || 'El slogan de marketing asertivo adornará este escaparate'}"
                  </p>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Menu display simulating client order process */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <div className={`border p-6 rounded-3xl shadow-xl space-y-6 ${themeCardBg} ${themeBorder}`}>
                    <div className="border-b border-slate-900 pb-3">
                      <h2 className="font-sans font-extrabold text-base text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                        🍱 Catálogo de Menú y Bento Boxes
                      </h2>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        Los comensales pueden comprar tus alimentos adquiriendo XP en tiempo real de forma asertiva.
                      </p>
                    </div>

                    {/* Active live metrics status block */}
                    {widgetNode}

                    {/* Product mapping */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: 'Combo Bento Signature 🍱', desc: 'Ración bento con proteína signature de la casa, papas fritas rústicas y aderezo especial.', price: 125, icon: '🍱' },
                        { name: 'Bailout Tonic Fusion 🥤', desc: 'Sabor refrescante cítrico local de Tamaulipas mezclado con pulpa natural silvestre.', price: 45, icon: '🥤' },
                        { name: 'Cheesecake Bento Cup 🥞', desc: 'Postre gourmet en empaque bento con trozos de galleta artesanal y mermelada.', price: 75, icon: '🥞' },
                        { name: 'Spicy Smash Burger Box 🍔', desc: 'Doble smash premium con salsa signature y vegetales orgánicos en caja bento.', price: 155, icon: '🍔' }
                      ].map((p, ix) => (
                        <div key={ix} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-850 flex flex-col justify-between space-y-4 hover:border-slate-800 transition-all shadow-md">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="text-2xl bg-slate-950 p-1.5 rounded-xl border border-slate-800">{p.icon}</span>
                              <span className={`text-xs font-mono font-extrabold ${themeText}`}>${p.price} MXN</span>
                            </div>
                            <div>
                              <strong className="text-white font-black text-xs uppercase block">{p.name}</strong>
                              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans">{p.desc}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[9px] font-mono font-bold text-emerald-400 pt-1.5 border-t border-slate-950">
                            <span>+15 XP DE GUSTO</span>
                            <span className={`px-2.5 py-1 rounded-lg uppercase cursor-pointer ${themeBadge}`}>Comprar 🛒</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* MKT Purpose Panel */}
                    <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-2 text-xs leading-relaxed font-sans text-left">
                      <strong className="text-white block font-bold text-[11px] uppercase tracking-wide">
                        📝 Narrativa de Marca e Historia Culinaria:
                      </strong>
                      <p className="text-slate-400">
                        {description || 'Aquí se describe minuciosamente por qué tu marca fue ideada con este enfoque de mercadotecnia de alimentos.'}
                      </p>
                      <div className="flex flex-wrap gap-3.5 pt-2 border-t border-slate-950 text-[10px] text-slate-505 font-mono uppercase">
                        <span>Líder Creador: {ownerName}</span>
                        <span>•</span>
                        <span>Red: Tamaulipas Gastro-Hub</span>
                        <span>•</span>
                        <span>Visibilidad: {status === 'published' ? 'Pública' : 'Borrador'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Reviews feed on the right */}
                <div className="lg:col-span-5 space-y-6 text-left">
                  <div className={`border p-6 rounded-3xl space-y-5 shadow-xl ${themeCardBg} ${themeBorder}`}>
                    <div>
                      <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-black tracking-wider uppercase ${themeBadge}`}>
                        BITÁCORA DE CONTROL
                      </span>
                      <h3 className="font-sans font-black text-sm text-white pt-1 uppercase">Opiniones de la Red Académica</h3>
                      <p className="text-xs text-slate-400 leading-normal font-sans">
                        Controla y monitorea lo que opina tu mercado meta sobre el naming, la propuesta bento y el copywriting.
                      </p>
                    </div>

                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                      {currentReviews.map((rev) => (
                        <div key={rev.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-900 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-[11.5px]">
                            <span className="font-bold text-slate-200 uppercase">{rev.username} ({rev.userRole === 'retailer' ? 'MKT' : 'CLIENTE'})</span>
                            <span className="text-amber-500 font-bold flex items-center gap-0.5 font-mono">⭐ {rev.rating}</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed font-sans">{rev.opinion}</p>
                          <span className="text-[9px] text-slate-600 font-mono block">
                            Auditoría: {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-950/50 border border-slate-900 rounded-2xl text-[10px] text-slate-500 font-mono uppercase text-center leading-normal">
                      🛡️ El feed se actualiza automáticamente con dictámenes de otros alumnos.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
