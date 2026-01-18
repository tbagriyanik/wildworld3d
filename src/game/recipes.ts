import { CraftingRecipe, InventoryItem } from './types';

export const craftingRecipes: CraftingRecipe[] = [
  {
    id: 'bow',
    name: 'Bow',
    nameKey: 'bow',
    ingredients: [
      { itemId: 'wood', quantity: 4 },
      { itemId: 'leather', quantity: 2 },
    ],
    result: {
      id: 'bow',
      name: 'Bow',
      nameKey: 'bow',
      icon: '🏹',
      type: 'tool',
      durability: 50,
      maxDurability: 50,
    },
    resultQuantity: 1,
  },
  {
    id: 'arrow',
    name: 'Arrow',
    nameKey: 'arrow',
    ingredients: [
      { itemId: 'wood', quantity: 1 },
      { itemId: 'stone', quantity: 1 },
    ],
    result: {
      id: 'arrow',
      name: 'Arrow',
      nameKey: 'arrow',
      icon: '➵',
      type: 'resource',
    },
    resultQuantity: 5,
  },
  {
    id: 'torch',
    name: 'Torch',
    nameKey: 'torch',
    ingredients: [
      { itemId: 'wood', quantity: 2 },
    ],
    result: {
      id: 'torch',
      name: 'Torch',
      nameKey: 'torch',
      icon: '🔦',
      type: 'tool',
      durability: 100,
      maxDurability: 100,
    },
    resultQuantity: 1,
  },
  {
    id: 'water_bottle',
    name: 'Water Bottle',
    nameKey: 'water_bottle',
    ingredients: [
      { itemId: 'leather', quantity: 3 },
    ],
    result: {
      id: 'water_bottle',
      name: 'Water Bottle',
      nameKey: 'water_bottle',
      icon: '🫗',
      type: 'consumable',
      durability: 3,
      maxDurability: 3,
    },
    resultQuantity: 1,
  },
  {
    id: 'axe',
    name: 'Axe',
    nameKey: 'axe',
    ingredients: [
      { itemId: 'wood', quantity: 3 },
      { itemId: 'stone', quantity: 2 },
    ],
    result: {
      id: 'axe',
      name: 'Axe',
      nameKey: 'axe',
      icon: '🪓',
      type: 'tool',
      durability: 50,
      maxDurability: 50,
    },
    resultQuantity: 1,
  },
  {
    id: 'pickaxe',
    name: 'Pickaxe',
    nameKey: 'pickaxe',
    ingredients: [
      { itemId: 'wood', quantity: 3 },
      { itemId: 'stone', quantity: 3 },
    ],
    result: {
      id: 'pickaxe',
      name: 'Pickaxe',
      nameKey: 'pickaxe',
      icon: '⛏️',
      type: 'tool',
      durability: 50,
      maxDurability: 50,
    },
    resultQuantity: 1,
  },
  {
    id: 'knife',
    name: 'Knife',
    nameKey: 'knife',
    ingredients: [
      { itemId: 'wood', quantity: 1 },
      { itemId: 'stone', quantity: 2 },
    ],
    result: {
      id: 'knife',
      name: 'Knife',
      nameKey: 'knife',
      icon: '🔪',
      type: 'tool',
      durability: 30,
      maxDurability: 30,
    },
    resultQuantity: 1,
  },
  {
    id: 'campfire',
    name: 'Campfire',
    nameKey: 'campfire',
    ingredients: [
      { itemId: 'wood', quantity: 5 },
      { itemId: 'stone', quantity: 3 },
    ],
    result: {
      id: 'campfire',
      name: 'Campfire',
      nameKey: 'campfire',
      icon: '🔥',
      type: 'tool',
      durability: 100,
      maxDurability: 100,
    },
    resultQuantity: 1,
  },
];

export const resourceItems: Record<string, Omit<InventoryItem, 'quantity'>> = {
  wood: {
    id: 'wood',
    name: 'Wood',
    nameKey: 'wood',
    icon: '🪵',
    type: 'resource',
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    nameKey: 'stone',
    icon: '🪨',
    type: 'resource',
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    nameKey: 'apple',
    icon: '🍎',
    type: 'consumable',
  },
  berry: {
    id: 'berry',
    name: 'Berry',
    nameKey: 'berry',
    icon: '🫐',
    type: 'consumable',
  },
  meat: {
    id: 'meat',
    name: 'Meat',
    nameKey: 'meat',
    icon: '🥩',
    type: 'consumable',
  },
  leather: {
    id: 'leather',
    name: 'Leather',
    nameKey: 'leather',
    icon: '🟫',
    type: 'resource',
  },
  arrow: {
    id: 'arrow',
    name: 'Arrow',
    nameKey: 'arrow',
    icon: '➵',
    type: 'resource',
  },
  water_bottle: {
    id: 'water_bottle',
    name: 'Water Bottle',
    nameKey: 'water_bottle',
    icon: '🫗',
    type: 'consumable',
  },
};

// Fixed hotbar items (slots 1-5)
export const fixedHotbarItems: (Omit<InventoryItem, 'quantity'> | null)[] = [
  { id: 'bow', name: 'Bow', nameKey: 'bow', icon: '🏹', type: 'tool' },           // Slot 1
  { id: 'torch', name: 'Torch', nameKey: 'torch', icon: '🔦', type: 'tool' },     // Slot 2
  { id: 'water_bottle', name: 'Water Bottle', nameKey: 'water_bottle', icon: '🫗', type: 'consumable' }, // Slot 3
  { id: 'fruit', name: 'Fruit', nameKey: 'fruit', icon: '🍎', type: 'consumable' }, // Slot 4
  { id: 'meat', name: 'Meat', nameKey: 'meat', icon: '🥩', type: 'consumable' },  // Slot 5
  null, // Slot 6 - empty
  null, // Slot 7 - empty  
  null, // Slot 8 - empty
];