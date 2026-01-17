export interface PlayerStats {
  health: number;
  hunger: number;
  thirst: number;
  temperature: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  nameKey: string;
  quantity: number;
  icon: string;
  type: 'resource' | 'tool' | 'consumable';
  durability?: number;
  maxDurability?: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  nameKey: string;
  ingredients: { itemId: string; quantity: number }[];
  result: Omit<InventoryItem, 'quantity'>;
  resultQuantity: number;
}

export interface WorldObject {
  id: string;
  type: 'tree' | 'rock' | 'water' | 'bush' | 'animal';
  position: { x: number; y: number; z: number };
  gatherable: boolean;
  resource?: string;
  health?: number;
}

export interface Animal {
  id: string;
  type: 'deer' | 'rabbit' | 'wolf';
  position: { x: number; y: number; z: number };
  rotation: number;
  health: number;
  maxHealth: number;
  speed: number;
  behavior: 'idle' | 'wandering' | 'fleeing' | 'attacking' | 'dead';
  targetPosition?: { x: number; z: number };
  lastBehaviorChange: number;
  drops: { itemId: string; quantity: number }[];
  mesh?: any;
}

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export type Weather = 'clear' | 'rain' | 'snow';
export type Language = 'en' | 'tr';

export interface GameState {
  player: PlayerStats;
  inventory: InventoryItem[];
  hotbar: (InventoryItem | null)[];
  selectedSlot: number;
  timeOfDay: TimeOfDay;
  dayTime: number;
  weather: Weather;
  language: Language;
  isPaused: boolean;
  isCraftingOpen: boolean;
  animals: Animal[];
}
