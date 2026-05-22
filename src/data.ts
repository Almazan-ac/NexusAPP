import { MenuItem, GameModifier, VotingOption, Achievement } from './types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: "godzilla-burger-xl",
    name: "Godzilla Burger XL",
    price: 265,
    cat: "mains",
    img: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800",
    desc: "Un kaiju de sabor. Carne doble angus ahumada, queso cheddar derretido, aros de cebolla crujientes y salsa BBQ secreta.",
    ingredients: "Carne Angus, Cheddar, Tocino, Aros de Cebolla, Salsa BBQ Nexus",
    xpReward: 50
  },
  {
    id: "bowser-burger-fire",
    name: "Bowser Burger (FIRE)",
    price: 280,
    cat: "mains",
    img: "https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=800",
    desc: "Poder de fuego puro. Carne angus rellena de jalapeños, queso pepper jack crocante y salsa habanero-mango.",
    ingredients: "Jalapeños, Ghost Pepper, Pepper Jack, Salsa Mango Habanero",
    xpReward: 60
  },
  {
    id: "king-kong-burger",
    name: "King Kong Burger",
    price: 345,
    cat: "mains",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
    desc: "Torre colosal de carne de tres pisos con tocino glaseado, queso provolone ahumado y aderezo especial de la selva.",
    ingredients: "Triple carne, Triple queso, Provolone, Mapple Bacon",
    xpReward: 80
  },
  {
    id: "pizza-ninja-turtles",
    name: "Pizza Ninja Turtles (Pepperoni Extremo)",
    price: 290,
    cat: "mains",
    img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800",
    desc: "¡Cowabunga! Maza crujiente, queso mozzarella estirable infinito y una sobredosis de pepperoni premium.",
    ingredients: "Doble Pepperoni, Mozzarella Pro, Salsa Italiana Tradicional",
    xpReward: 55
  },
  {
    id: "pocion-mana",
    name: "Poción de Maná",
    price: 90,
    cat: "drinks",
    img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800",
    desc: "Restaura tu energía mental instantáneamente. Bebida gaseosa de Curaçao azul, frutos del bosque y un toque misterioso de menta.",
    ingredients: "Curaçao, Moras, Sprite, Menta, Escarcha de Azúcar Eléctrica",
    xpReward: 20
  },
  {
    id: "pocion-vida",
    name: "Poción de Vida (Health Elixir)",
    price: 90,
    cat: "drinks",
    img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800",
    desc: "Restaura tus puntos de vitalidad. Concentrado de granada, frutos rojos, infusión de jamaica dulce y una pizca de jengibre estimulante.",
    ingredients: "Granada, Jamaica, Jengibre, Frutos Rojos macerados",
    xpReward: 20
  },
  {
    id: "coca-cola-glass",
    name: "Coca-Cola (Glass Edition)",
    price: 45,
    cat: "drinks",
    img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800",
    desc: "Refresco clásico en botella de vidrio helada para un boost retro instantáneo.",
    ingredients: "Refresco de cola helado original",
    xpReward: 10
  },
  {
    id: "pocion-tropical",
    name: "Poción Tropical (Piña Colada Mocktail)",
    price: 115,
    cat: "drinks",
    img: "https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=800",
    desc: "Quest en la isla tropical. Fusión cremosa de piña de la huerta, crema de coco batida y hielo frapeado.",
    ingredients: "Crema de coco premium, Jugo de Piña natural, Cereza marrasquino",
    xpReward: 25
  },
  {
    id: "papas-super-mario",
    name: "Papas Rústicas Super Mario",
    price: 110,
    cat: "snacks",
    img: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?q=80&w=800",
    desc: "Gajos de papa marinados con finas hierbas, salteados con champiñones silvestres y coronados con queso fundido.",
    ingredients: "Papas rústicas, Champiñones, Parmesano rallado, Aceite de trufa",
    xpReward: 20
  },
  {
    id: "nachos-overpowered",
    name: "Nachos Overpowered (OP)",
    price: 185,
    cat: "snacks",
    img: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=800",
    desc: "Totalmente desbalanceados. Tortillas de maíz crujientes bañadas en queso cheddar fundido, jalapeños, frijoles negros y guacamole premium.",
    ingredients: "Nachos crujientes, Cheddar artesanal, Pico de gallo, Jalapeños, Guacamole",
    xpReward: 35
  },
  {
    id: "cheesecake-pikachu",
    name: "Cheesecake Pikachu (Impactrueno)",
    price: 125,
    cat: "desserts",
    img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800",
    desc: "Dulzura de alto voltaje. Suave tarta de queso con base de galleta Lotus y un coulis cítrico de maracuyá electrizante.",
    ingredients: "Queso Crema, Galleta Lotus, Glaseado de Maracuyá Cítrico",
    xpReward: 25
  }
];

export const GAME_MODIFIERS: GameModifier[] = [
  {
    id: "desconexion-red",
    name: "Desconexión de Red",
    icon: "WifiOff",
    description: "Desconéctate del mundo virtual para conectarte con tus compañeros de raid.",
    rules: "Todos los jugadores de la mesa deben colocar sus teléfonos móviles boca abajo en la caja especial al inicio de la cena. El teléfono no se toca durante toda la velada. Si lo logran, el mesero validará su mesa.",
    reward: "¡Postre Gratis! (Un Cheesecake Pikachu de Cortesía para la mesa)",
    difficulty: "Hardcore",
    themeColor: "cyber-magenta"
  },
  {
    id: "trivia-geek",
    name: "Cuestionario del Tabernero (Trivia)",
    icon: "FileQuestion",
    description: "Demuestra tus conocimientos de gaming, anime, comics y cultura pop.",
    rules: "El mesero actuará como NPC de Trivia. Les hará 3 preguntas de nivel aleatorio. Necesitan responder al menos 2 correctamente de forma grupal sin consultar internet.",
    reward: "15% de descuento en la cuenta final de bebidas",
    difficulty: "Media",
    themeColor: "cyber-cyan"
  },
  {
    id: "boss-battle",
    name: "Bowser's Spicy Boss Battle",
    icon: "Flame",
    description: "Enfréntate al reto picante definitivo de la taberna.",
    rules: "Al menos dos miembros de la mesa deben consumir la 'Bowser Burger' con la salsa especial Habanero Nitro y terminarla por completo en menos de 15 minutos sin tomar agua/pociones.",
    reward: "Un badge de Campeón en su perfil + Botella de cerveza artesanal o frapeada gratis para cada retador exitoso",
    difficulty: "Hardcore",
    themeColor: "cyber-green"
  },
  {
    id: "speed-drinking",
    name: "Potion Speed-Run",
    icon: "GlassWater",
    description: "Bebe tu poción de escudo al estilo RPG veloz.",
    rules: "A la de tres, toma tu 'Poción de Maná' de un solo trago continuo. El mesero tomará el temporizador.",
    reward: "Gana 100 XP extras de manera inmediata para tu cuenta de Player",
    difficulty: "Fácil",
    themeColor: "cyber-yellow"
  }
];

export const INITIAL_VOTING_OPTIONS: VotingOption[] = [
  {
    id: "v-angus",
    name: "Carne Premium Angus al Carbón con Mezcal",
    category: "Proteína",
    xpAllocated: 4320,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400"
  },
  {
    id: "v-camaron",
    name: "Camarones Rebozados en Panko y Cerveza Negra",
    category: "Proteína",
    xpAllocated: 2150,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400"
  },
  {
    id: "v-jack",
    name: "Queso Monterrey Jack Ahumado Flameado",
    category: "Topping Extra",
    xpAllocated: 3410,
    image: "/src/assets/images/queso_monterrey_1779419378966.png"
  },
  {
    id: "v-doritos",
    name: "Costra de Doritos Spicy Flamin' Hot Crujientes",
    category: "Topping Extra",
    xpAllocated: 5890,
    image: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?q=80&w=400"
  },
  {
    id: "v-mayo-wasabi",
    name: "Alioli de Wasabi y Limón Kaffir",
    category: "Salsa",
    xpAllocated: 1800,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400"
  },
  {
    id: "v-bbq-miso",
    name: "Salsa Jack Daniel's Infusionada con Miso Dulce",
    category: "Salsa",
    xpAllocated: 3120,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=400"
  },
  {
    id: "v-brioche-negro",
    name: "Brioche Negro Artesanal con Ajonjolí Dorado",
    category: "Pan Especial",
    xpAllocated: 2500,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400"
  },
  {
    id: "v-pretzel",
    name: "Pan Estilo Pretzel con Sal de Mar en Grano",
    category: "Pan Especial",
    xpAllocated: 1420,
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=400"
  }
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "unidos_venceremos",
    title: "Primer Voto Alquímico",
    description: "Aporta tus primeros puntos de XP para la creación colectiva de la hamburguesa de la comunidad.",
    icon: "Award"
  },
  {
    id: "desconexion_total",
    title: "Monje Digital (OFFLINE)",
    description: "Completa con éxito el mod 'Desconexión de Red' en una reserva validada por el mesero.",
    icon: "Cpu"
  },
  {
    id: "trivia_master",
    title: "Archimago del Trono",
    description: "Responde correctamente la trivia de cultura friki delante del mesero.",
    icon: "Glasses"
  },
  {
    id: "bowser_slayer",
    title: "Cazador de Dragones",
    description: "Finaliza con éxito la 'Bowser Burger' picante sin dudar.",
    icon: "Flame"
  },
  {
    id: "comprador_recurrente",
    title: "Ballena del Servidor",
    description: "Su acumulación total de pedidos de comida y pócimas supera los $500 MXN.",
    icon: "Coins"
  }
];
