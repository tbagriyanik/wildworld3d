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
    arrow: 'Arrow',
    fruit: 'Fruit',
    
    // Tools
    axe: 'Axe',
    pickaxe: 'Pickaxe',
    knife: 'Knife',
    campfire: 'Campfire',
    bow: 'Bow',
    torch: 'Torch',
    water_bottle: 'Water Bottle',
    
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
    
    // Menu
    main_menu: 'Main Menu',
    resume: 'Resume',
    paused: 'PAUSED',
    
    // Item actions
    no_arrows: 'No arrows!',
    need_water: 'Need water source!',
    torch_on: 'Torch lit!',
    torch_off: 'Torch extinguished',
    drank_water: 'Drank water',
    ate_food: 'Ate food',
    
    // Instructions
    clickToStart: 'Click to Start',
    controls: 'WASD - Move | Mouse - Look | Click/E - Interact | C/Tab - Craft | ESC - Menu | F5 - Save',
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
    arrow: 'Ok',
    fruit: 'Meyve',
    
    // Tools
    axe: 'Balta',
    pickaxe: 'Kazma',
    knife: 'Bıçak',
    campfire: 'Kamp Ateşi',
    bow: 'Yay',
    torch: 'Meşale',
    water_bottle: 'Su Matarası',
    
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
    
    // Menu
    main_menu: 'Ana Menü',
    resume: 'Devam',
    paused: 'DURDURULDU',
    
    // Item actions
    no_arrows: 'Ok yok!',
    need_water: 'Su kaynağı gerekli!',
    torch_on: 'Meşale yandı!',
    torch_off: 'Meşale söndü',
    drank_water: 'Su içildi',
    ate_food: 'Yemek yendi',
    
    // Instructions
    clickToStart: 'Başlamak için tıkla',
    controls: 'WASD - Hareket | Mouse - Bak | Tıkla/E - Etkileşim | C/Tab - Üretim | ESC - Menü | F5 - Kaydet',
    mobileControls: 'Bakmak için sürükle | Hareket için joystick | Toplamak için dokun',
  },
};

export function t(key: string, language: Language): string {
  return translations[language][key] || key;
}

export function getTranslations(language: Language) {
  return translations[language];
}
