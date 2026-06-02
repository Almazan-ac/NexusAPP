import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { DeveloperMessage } from '../types';
import { Send, Terminal, Settings, UserCheck, Bot, CheckCircle, MessageSquare } from 'lucide-react';

interface DeveloperChatProps {
  restaurantId: string;
  restaurantName: string;
  activeUsername: string;
}

export default function DeveloperChat({ restaurantId, restaurantName, activeUsername }: DeveloperChatProps) {
  const [messages, setMessages] = useState<DeveloperMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Prefill initial system guidance messages about web integration if the database is blank
  const prefilledSuggestions: Omit<DeveloperMessage, 'id'>[] = [
    {
      restaurantId,
      sender: 'developer',
      senderName: 'Soporte Técnico Especializado',
      text: `👋 ¡Hola ${activeUsername}! Te damos la bienvenida al canal de soporte técnico para el desarrollo de tu sitio. Hemos detectado tu marca "${restaurantName}". ¿En qué podemos ayudarte con la diagramación o publicación de tu página hoy?`,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      restaurantId,
      sender: 'developer',
      senderName: 'Arquitecta Sofía (Senior UX/UI)',
      text: `💡 Como emprendedor de mercadotecnia, cuentas con plantillas modulares prediseñadas. ¿Te gustaría que hablemos sobre cómo optimizar la conversión de tus slogans o estructurar la propuesta para captar el target de 22 a 35 años?`,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  useEffect(() => {
    // Read messages for this restaurant in real-time from Firestore
    const q = query(
      collection(db, 'developerMessages'),
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Seed the initial messages under firestore
        for (const item of prefilledSuggestions) {
          try {
            await addDoc(collection(db, 'developerMessages'), item);
          } catch (e) {
            console.error("Error seeding support messages:", e);
          }
        }
      } else {
        const msgsList: DeveloperMessage[] = [];
        snapshot.forEach((doc) => {
          msgsList.push({ id: doc.id, ...doc.data() } as DeveloperMessage);
        });
        setMessages(msgsList);
      }
    }, (err) => {
      console.warn("Couldn't sync developer messages, fallback:", err);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');

    const newMsg: Omit<DeveloperMessage, 'id'> = {
      restaurantId,
      sender: 'owner',
      senderName: activeUsername,
      text: userMsg,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'developerMessages'), newMsg);
      
      setIsTyping(true);
      setTimeout(async () => {
        const responseText = getSimulatedDeveloperResponse(userMsg, restaurantName);
        const robotMsg: Omit<DeveloperMessage, 'id'> = {
          restaurantId,
          sender: 'developer',
          senderName: 'Arq. Web Sofia (Senior UX/UI)',
          text: responseText,
          createdAt: new Date().toISOString()
        };
        try {
          await addDoc(collection(db, 'developerMessages'), robotMsg);
        } catch (e) {
          console.error(e);
        }
        setIsTyping(false);
      }, 1500);

    } catch (err) {
      console.error("Error writing developer message to Firestore:", err);
      alert("Hubo un contratiempo al transmitir tu mensaje.");
    }
  };

  const getSimulatedDeveloperResponse = (msg: string, restName: string): string => {
    const text = msg.toLowerCase();
    if (text.includes('hola') || text.includes('buenas')) {
      return `¡Hola de nuevo! Estuvimos auditando la propuesta técnica para "${restName}". ¿Deseas perfeccionar la combinación tipográfica o estructurar las secciones de contacto e historia de la marca?`;
    }
    if (text.includes('diseño') || text.includes('imagen') || text.includes('color') || text.includes('estilo')) {
      return `Comprendido. Al tratarse de un concepto gastronómico para el nicho comercial de jóvenes, aconsejamos emplear espaciados generosos y contrastes asertivos sin sobrecargar visualmente el contenido.`;
    }
    if (text.includes('menú') || text.includes('menu') || text.includes('precio') || text.includes('comida')) {
      return `¡Excelente enfoque mercadológico! Para agilizar los pedidos, puedes sugerir opciones modulares de combo o bento-boxes visibles al principio de la página. ¿Quieres que preparemos este módulo?`;
    }
    if (text.includes('nexus') || text.includes('gastro') || text.includes('bar')) {
      return `Así es, el proyecto "Nexus Gastro-Bar" de la comunidad sirve de benchmark técnico prémium. Tiene características de gamificación, canje de cupones por XP y voto ingrediente que podemos heredar para tu layout en el futuro.`;
    }
    if (text.includes('reseña') || text.includes('opinion') || text.includes('critica') || text.includes('comentario')) {
      return `Los diagnósticos de tus visitantes son invaluables. Te recomendamos revisar el panel de opiniones periódicamente para ajustar rápido la propuesta comercial y seguir optimizando la conversión.`;
    }
    return `Enterado del apunte. Lo añadimos de inmediato a las prioridades del sprint de soporte para "${restName}". Ofrecemos estilo sobrio, óptima conversión tipográfica y conexión de bases de datos segura. ¿Deseas iterar algún módulo del editor en este momento?`;
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[550px] shadow-2xl relative max-w-4xl mx-auto px-1 mt-3.5">
      {/* Header of support channel - serious styling */}
      <div className="bg-slate-900 p-4 border-b border-slate-850 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-950/40 rounded-full border border-indigo-800 flex items-center justify-center text-indigo-400 relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950 animate-ping"></span>
          </div>
          <div>
            <span className="text-[8px] font-mono tracking-widest text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-md block max-w-max uppercase font-bold">
              CANAL DE ASESORÍA UX/UI
            </span>
            <h4 className="font-sans font-extrabold text-sm text-white">Soporte Técnico de Despliegue</h4>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <CheckCircle className="w-4 h-4 text-indigo-400" />
          <span>Sincronizado: {restaurantName}</span>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs scrollbars-thin" ref={scrollRef}>
        {messages.map((msg) => {
          const isMe = msg.sender === 'owner';
          return (
            <div
              key={msg.id || msg.createdAt}
              className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <span className={`text-[9px] font-mono mb-1 ${isMe ? 'text-indigo-400' : 'text-slate-400 font-bold'}`}>
                {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              <div
                className={`p-3 rounded-xl leading-relaxed ${
                  isMe
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-950/20'
                    : 'bg-slate-900 border border-slate-850 text-slate-300 rounded-tl-none font-medium'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 mr-auto text-[10px] text-slate-400 font-mono bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-900">
            <Bot className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Soporte de Desarrollo está redactando una sugerencia...</span>
          </div>
        )}
      </div>

      {/* Suggestions shortcuts */}
      <div className="px-4 py-2 border-t border-slate-900 flex gap-2 overflow-x-auto whitespace-nowrap bg-slate-950 select-none scrollbar-thin">
        <button
          onClick={() => setInputText('¿Cómo podemos agregar más fotos ilustrativas en mi menú?')}
          className="text-[10px] bg-slate-905 hover:bg-slate-900 hover:border-indigo-500/40 border border-slate-850 text-slate-350 font-sans px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium"
        >
          🖼️ Fotos de Platillos
        </button>
        <button
          onClick={() => setInputText('¿Cómo podemos canjear XP por Cupones en el widget de Reservas?')}
          className="text-[10px] bg-slate-905 hover:bg-slate-900 hover:border-indigo-500/40 border border-slate-850 text-slate-350 font-sans px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium"
        >
          🎁 Canjes e Incentivos XP
        </button>
        <button
          onClick={() => setInputText('¿Qué colores recomiendan para una hamburguesería de jóvenes de 22 a 35 años?')}
          className="text-[10px] bg-slate-905 hover:bg-slate-900 hover:border-indigo-500/40 border border-slate-850 text-slate-350 font-sans px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium"
        >
          🎨 Combinación de Colores MKT
        </button>
      </div>

      {/* Input box */}
      <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-850 flex gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Escribe una pregunta sobre diseño or publicación web para tu restaurante...`}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500 cursor-text font-sans font-medium"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl hover:shadow-[0_0_15px_rgba(79,70,229,0.3)] font-sans font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:shadow-none cursor-pointer"
        >
          <span>ENVIAR</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
