import { create } from 'zustand';
import { GameState, InventoryItem, PlayerStats } from './types';

interface GameStore extends GameState {
  // Player actions
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;
  
  // Inventory actions
  addItem: (item: Omit<InventoryItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  getItemCount: (itemId: string) => number;
  
  // Hotbar actions
  setHotbarSlot: (slot: number, item: InventoryItem | null) => void;
  selectSlot: (slot: number) => void;
  
  // Time and weather
  setTimeOfDay: (time: number) => void;
  setWeather: (weather: GameState['weather']) => void;
  
  // UI state
  toggleCrafting: () => void;
  setPaused: (paused: boolean) => void;
  setLanguage: (language: GameState['language']) => void;
  
  // Player rotation for compass
  playerRotation: number;
  setPlayerRotation: (rotation: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: {
    health: 100,
    hunger: 100,
    thirst: 100,
    temperature: 50,
  },
  inventory: [],
  hotbar: Array(8).fill(null),
  selectedSlot: 0,
  timeOfDay: 'day',
  dayTime: 0.5,
  weather: 'clear',
  language: 'en',
  isPaused: false,
  isCraftingOpen: false,
  playerRotation: 0,
  
  updatePlayerStats: (stats) =>
    set((state) => ({
      player: { ...state.player, ...stats },
    })),
    
  damagePlayer: (amount) =>
    set((state) => ({
      player: {
        ...state.player,
        health: Math.max(0, state.player.health - amount),
      },
    })),
    
  healPlayer: (amount) =>
    set((state) => ({
      player: {
        ...state.player,
        health: Math.min(100, state.player.health + amount),
      },
    })),
    
  addItem: (item, quantity = 1) =>
    set((state) => {
      const existingIndex = state.inventory.findIndex((i) => i.id === item.id);
      if (existingIndex >= 0) {
        const newInventory = [...state.inventory];
        newInventory[existingIndex] = {
          ...newInventory[existingIndex],
          quantity: newInventory[existingIndex].quantity + quantity,
        };
        return { inventory: newInventory };
      }
      return {
        inventory: [...state.inventory, { ...item, quantity }],
      };
    }),
    
  removeItem: (itemId, quantity = 1) =>
    set((state) => {
      const existingIndex = state.inventory.findIndex((i) => i.id === itemId);
      if (existingIndex < 0) return state;
      
      const newInventory = [...state.inventory];
      const item = newInventory[existingIndex];
      
      if (item.quantity <= quantity) {
        newInventory.splice(existingIndex, 1);
      } else {
        newInventory[existingIndex] = {
          ...item,
          quantity: item.quantity - quantity,
        };
      }
      
      return { inventory: newInventory };
    }),
    
  getItemCount: (itemId) => {
    const item = get().inventory.find((i) => i.id === itemId);
    return item?.quantity || 0;
  },
  
  setHotbarSlot: (slot, item) =>
    set((state) => {
      const newHotbar = [...state.hotbar];
      newHotbar[slot] = item;
      return { hotbar: newHotbar };
    }),
    
  selectSlot: (slot) => set({ selectedSlot: slot }),
  
  setTimeOfDay: (time) => {
    let timeOfDay: GameState['timeOfDay'] = 'day';
    if (time < 0.2 || time > 0.85) timeOfDay = 'night';
    else if (time < 0.3) timeOfDay = 'dawn';
    else if (time > 0.75) timeOfDay = 'dusk';
    
    set({ dayTime: time, timeOfDay });
  },
  
  setWeather: (weather) => set({ weather }),
  
  toggleCrafting: () =>
    set((state) => ({ isCraftingOpen: !state.isCraftingOpen })),
    
  setPaused: (paused) => set({ isPaused: paused }),
  
  setLanguage: (language) => set({ language }),
  
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
}));
