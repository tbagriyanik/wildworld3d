import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, InventoryItem, PlayerStats, Animal } from './types';

const SAVE_KEY = 'wild-lands-save';

interface SaveData {
  player: PlayerStats;
  inventory: InventoryItem[];
  hotbar: (InventoryItem | null)[];
  selectedSlot: number;
  dayTime: number;
  weather: GameState['weather'];
  language: GameState['language'];
  playerPosition?: { x: number; y: number; z: number };
  playerRotationY?: number;
}

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
  
  // Animal actions
  setAnimals: (animals: Animal[]) => void;
  updateAnimal: (id: string, updates: Partial<Animal>) => void;
  removeAnimal: (id: string) => void;
  addAnimal: (animal: Animal) => void;
  
  // Save/Load
  playerPosition: { x: number; y: number; z: number };
  setPlayerPosition: (pos: { x: number; y: number; z: number }) => void;
  saveGame: () => void;
  loadGame: () => boolean;
  hasSavedGame: () => boolean;
  deleteSave: () => void;
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
  animals: [],
  playerPosition: { x: 0, y: 2, z: 0 },
  
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
  
  setAnimals: (animals) => set({ animals }),
  
  updateAnimal: (id, updates) =>
    set((state) => ({
      animals: state.animals.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
    
  removeAnimal: (id) =>
    set((state) => ({
      animals: state.animals.filter((a) => a.id !== id),
    })),
    
  addAnimal: (animal) =>
    set((state) => ({
      animals: [...state.animals, animal],
    })),
    
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  
  saveGame: () => {
    const state = get();
    const saveData: SaveData = {
      player: state.player,
      inventory: state.inventory,
      hotbar: state.hotbar,
      selectedSlot: state.selectedSlot,
      dayTime: state.dayTime,
      weather: state.weather,
      language: state.language,
      playerPosition: state.playerPosition,
      playerRotationY: state.playerRotation,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('Game saved!');
  },
  
  loadGame: () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return false;
      
      const saveData: SaveData = JSON.parse(saved);
      set({
        player: saveData.player,
        inventory: saveData.inventory,
        hotbar: saveData.hotbar,
        selectedSlot: saveData.selectedSlot,
        dayTime: saveData.dayTime,
        weather: saveData.weather,
        language: saveData.language,
        playerPosition: saveData.playerPosition || { x: 0, y: 2, z: 0 },
        playerRotation: saveData.playerRotationY || 0,
      });
      console.log('Game loaded!');
      return true;
    } catch (e) {
      console.error('Failed to load game:', e);
      return false;
    }
  },
  
  hasSavedGame: () => {
    return localStorage.getItem(SAVE_KEY) !== null;
  },
  
  deleteSave: () => {
    localStorage.removeItem(SAVE_KEY);
  },
}));
