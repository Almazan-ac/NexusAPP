import React, { useState } from 'react';
import { MenuItem } from '../types';
import { INITIAL_MENU_ITEMS } from '../data';
import { Pocket, ShieldAlert, Sparkles, ShoppingBag, Info, X } from 'lucide-react';

interface MenuCatalogProps {
  onAddToCart: (item: MenuItem) => void;
  activeGamertag: string | null;
  menuItems: MenuItem[];
}

export default function MenuCatalog({ onAddToCart, activeGamertag, menuItems }: MenuCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mains' | 'snacks' | 'drinks' | 'desserts'>('all');
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.cat === selectedCategory);

  const getBorderColorClass = (cat: string) => {
    switch(cat) {
      case 'mains': return 'border-cyber-cyan shadow-cyber-cyan/30';
      case 'snacks': return 'border-cyber-green shadow-cyber-green/30';
      case 'drinks': return 'border-cyber-magenta shadow-cyber-magenta/30';
      case 'desserts': return 'border-cyber-yellow shadow-cyber-yellow/30';
      default: return 'border-neutral-800';
    }
  };

  const getPriceColorClass = (cat: string) => {
    switch(cat) {
      case 'mains': return 'text-cyber-cyan';
      case 'snacks': return 'text-cyber-green';
      case 'drinks': return 'text-cyber-magenta';
      case 'desserts': return 'text-cyber-yellow';
      default: return 'text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories Bar */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none px-1">
        {(['all', 'mains', 'snacks', 'drinks', 'desserts'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full border text-xs font-orbitron font-bold uppercase tracking-wider transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-cyber-cyan text-black border-cyber-cyan shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                : 'bg-neutral-950/80 text-cyber-cyan/70 border-cyber-cyan/40 hover:border-cyber-cyan hover:text-cyber-cyan'
            }`}
          >
            {cat === 'all' ? 'Ver Todo' : cat === 'mains' ? 'Platos Fuertes' : cat === 'snacks' ? 'Snacks' : cat === 'drinks' ? 'Pociones' : 'Postres'}
          </button>
        ))}
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setDetailItem(item)}
            className={`cursor-pointer group bg-neutral-950 border-3 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] shadow-md ${getBorderColorClass(item.cat)}`}
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={item.img}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded border border-cyber-green/40 text-cyber-green font-mono text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> +{item.xpReward} XP
              </div>
            </div>
            <div className="p-4 text-center">
              <h3 className="font-orbitron text-sm font-bold min-h-[40px] flex items-center justify-center line-clamp-2 leading-snug group-hover:text-cyber-cyan transition-colors">
                {item.name}
              </h3>
              <div className="mt-2.5">
                <span className="bg-neutral-900 border border-neutral-800 text-white font-mono px-3.5 py-1.5 rounded-lg font-bold text-xs inline-block">
                  $ {item.price} MXN
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Overlay Modal */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/90 z-[3000] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className={`w-full max-w-xl bg-neutral-950 border-3 rounded-2xl overflow-hidden shadow-2xl ${getBorderColorClass(detailItem.cat)}`}>
            <div className="relative h-72">
              <img
                src={detailItem.img}
                alt={detailItem.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-4 right-4 bg-black/80 p-2.5 rounded-full text-white border border-neutral-700 hover:border-cyber-magenta transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/90 px-3 py-1.5 rounded-md border border-cyber-green/40 text-cyber-green font-mono text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> RECOMPENSA: +{detailItem.xpReward} XP
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800">
                  Nivel {detailItem.cat === 'mains' ? 'Elite' : 'Común'} - {detailItem.cat.toUpperCase()}
                </span>
                <h2 className={`font-orbitron font-extrabold text-xl mt-3 ${getPriceColorClass(detailItem.cat)}`}>
                  {detailItem.name}
                </h2>
              </div>

              <div className="bg-neutral-900/40 p-4 rounded-xl border-l-4 border-cyber-magenta/80">
                <h4 className="font-orbitron text-xs text-cyber-magenta uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> Composición del Item (Ingredientes)
                </h4>
                <p className="font-rajdhani text-sm text-neutral-300">
                  {detailItem.ingredients}
                </p>
              </div>

              <p className="font-sans text-neutral-300 text-sm leading-relaxed">
                {detailItem.desc}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-neutral-900">
                <div className="text-center sm:text-left">
                  <span className="text-neutral-500 font-mono text-xs block mb-1">Costo de Transacción</span>
                  <span className="font-orbitron text-2xl font-black text-white">$ {detailItem.price} <span className="text-xs font-medium">MXN</span></span>
                </div>

                <div className="w-full sm:w-auto flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      onAddToCart(detailItem);
                      setDetailItem(null);
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-cyber-green text-black font-orbitron font-black text-sm rounded-full shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.6)] transform hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> COMPRAR Y ENVIAR A COCINA
                  </button>
                  {!activeGamertag && (
                    <span className="text-[10px] text-cyber-yellow font-rajdhani text-center flex items-center gap-1 justify-center">
                      <ShieldAlert className="w-3 h-3" /> Inicia sesión para guardar tu XP recolectada
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
