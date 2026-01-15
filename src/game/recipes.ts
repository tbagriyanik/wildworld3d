import { CraftingRecipe } from './types';

export const craftingRecipes: CraftingRecipe[] = [
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

export const resourceItems = {
  wood: {
    id: 'wood',
    name: 'Wood',
    nameKey: 'wood',
    icon: '🪵',
    type: 'resource' as const,
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    nameKey: 'stone',
    icon: '🪨',
    type: 'resource' as const,
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    nameKey: 'apple',
    icon: '🍎',
    type: 'consumable' as const,
  },
  berry: {
    id: 'berry',
    name: 'Berry',
    nameKey: 'berry',
    icon: '🫐',
    type: 'consumable' as const,
  },
  meat: {
    id: 'meat',
    name: 'Meat',
    nameKey: 'meat',
    icon: '🥩',
    type: 'consumable' as const,
  },
  leather: {
    id: 'leather',
    name: 'Leather',
    nameKey: 'leather',
    icon: '🟫',
    type: 'resource' as const,
  },
};
