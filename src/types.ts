/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  cat: 'mains' | 'snacks' | 'drinks' | 'desserts';
  img: string;
  desc: string;
  ingredients: string;
  xpReward: number; // XP matching the purchase
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface GameModifier {
  id: string;
  name: string;
  icon: string;
  description: string;
  reward: string;
  rules: string;
  difficulty: 'Fácil' | 'Media' | 'Hardcore';
  themeColor: string;
}

export interface Reservation {
  id: string;
  gamertag: string;
  date: string;
  time: string;
  dinerCount: number;
  modifierId: string;
  qrCodeValue: string;
  isVerified: boolean;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface VotingOption {
  id: string;
  name: string;
  category: 'Proteína' | 'Salsa' | 'Topping Extra' | 'Pan Especial';
  xpAllocated: number;
  image: string;
}

export interface VotingSession {
  id: string;
  title: string;
  description: string;
  endDate: string;
  options: VotingOption[];
  hasVoted?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward?: number;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  isUsed: boolean;
  source: string; // e.g. "Desconexión de Red unlocked"
}

export interface UserProfile {
  gamertag: string;
  xp: number;
  unlockedAchievements: string[];
  claimedCoupons: Coupon[];
  votedIngredients: { [ingredientId: string]: number }; // ingredientId: votes_allocated
  role?: string;
}

export interface RestaurantOrder {
  id: string;
  gamertag: string;
  itemId: string;
  itemName: string;
  price: number;
  xpReward: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export type AppUserRole = 'consumer' | 'retailer' | 'developer';

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export interface RestaurantPage {
  id: string;
  name: string;
  category: string;
  slogan: string;
  description: string;
  bannerUrl: string;
  ownerId: string;
  ownerName: string;
  ownerAge?: number;
  studiedMarketing?: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  menu?: StoreProduct[];
  completedPermitTasks?: Record<string, boolean>;
  completedMktTasks?: Record<string, boolean>;
  permitFolios?: Record<string, string>;
  permitDates?: Record<string, string>;
  permitDeadline?: string;
  suspended?: boolean;
  suspensionReason?: string;
}

export interface RestaurantReview {
  id: string;
  restaurantId: string;
  username: string;
  userRole: AppUserRole;
  rating: number; // 1-5
  opinion: string;
  targetType: 'business' | 'webpage'; // Critique the business idea or the webpage's style/layout
  createdAt: string;
}

export interface DeveloperMessage {
  id: string;
  restaurantId: string; // Linking the chat to the specific restaurant project
  sender: 'owner' | 'developer';
  senderName: string;
  text: string;
  createdAt: string;
}


