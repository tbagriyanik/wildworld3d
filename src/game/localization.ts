import { Language } from './types';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // UI
    health: 'Health',
    hunger: 'Hunger',
    thirst: 'Thirst',
    temperature: 'Temperature',
    inventory: 'Inventory',
    crafting: 'Crafting',
    craft: 'Craft',
    close: 'Close',
    
    // Resources
    wood: 'Wood',
    stone: 'Stone',
    apple: 'Apple',
    berry: 'Berry',
    meat: 'Meat',
    leather: 'Leather',
    
    // Tools
    axe: 'Axe',
    pickaxe: 'Pickaxe',
    knife: 'Knife',
    campfire: 'Campfire',
    
    // Actions
    gather: 'Gather',
    eat: 'Eat',
    drink: 'Drink',
    use: 'Use',
    
    // Compass
    north: 'N',
    south: 'S',
    east: 'E',
    west: 'W',
    
    // Time
    dawn: 'Dawn',
    day: 'Day',
    dusk: 'Dusk',
    night: 'Night',
    
    // Weather
    clear: 'Clear',
    rain: 'Rain',
    snow: 'Snow',
    
    // Animals
    deer: 'Deer',
    rabbit: 'Rabbit',
    wolf: 'Wolf',
    hunted: 'Hunted',
    
    // Save/Load
    continue_game: 'Continue',
    new_game: 'New Game',
    game_saved: 'Game Saved!',
    
    // Instructions
    clickToStart: 'Click to Start',
    controls: 'WASD - Move | Mouse - Look | Click - Hunt/Gather | E - Crafting | F5 - Save',
    mobileControls: 'Drag to look | Joystick to move | Tap to gather',
  },
  tr: {
    // UI
    health: 'Sağlık',
    hunger: 'Açlık',
    thirst: 'Susuzluk',
    temperature: 'Sıcaklık',
    inventory: 'Envanter',
    crafting: 'Üretim',
    craft: 'Üret',
    close: 'Kapat',
    
    // Resources
    wood: 'Odun',
    stone: 'Taş',
    apple: 'Elma',
    berry: 'Çilek',
    meat: 'Et',
    leather: 'Deri',
    
    // Tools
    axe: 'Balta',
    pickaxe: 'Kazma',
    knife: 'Bıçak',
    campfire: 'Kamp Ateşi',
    
    // Actions
    gather: 'Topla',
    eat: 'Ye',
    drink: 'İç',
    use: 'Kullan',
    
    // Compass
    north: 'K',
    south: 'G',
    east: 'D',
    west: 'B',
    
    // Time
    dawn: 'Şafak',
    day: 'Gündüz',
    dusk: 'Akşam',
    night: 'Gece',
    
    // Weather
    clear: 'Açık',
    rain: 'Yağmur',
    snow: 'Kar',
    
    // Animals
    deer: 'Geyik',
    rabbit: 'Tavşan',
    wolf: 'Kurt',
    hunted: 'Avlandı',
    
    // Save/Load
    continue_game: 'Devam Et',
    new_game: 'Yeni Oyun',
    game_saved: 'Oyun Kaydedildi!',
    
    // Instructions
    clickToStart: 'Başlamak için tıkla',
    controls: 'WASD - Hareket | Mouse - Bak | Tıkla - Avla/Topla | E - Üretim | F5 - Kaydet',
    mobileControls: 'Bakmak için sürükle | Hareket için joystick | Toplamak için dokun',
  },
};

export function t(key: string, language: Language): string {
  return translations[language][key] || key;
}

export function getTranslations(language: Language) {
  return translations[language];
}
