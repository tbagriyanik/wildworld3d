import { Animal } from './types';

const DETECTION_RANGE = 15;
const ATTACK_RANGE = 3;
const BEHAVIOR_CHANGE_INTERVAL = 3000;

export const createAnimal = (
  type: Animal['type'],
  position: { x: number; z: number }
): Animal => {
  const configs = {
    deer: {
      health: 50,
      speed: 0.08,
      drops: [
        { itemId: 'meat', quantity: 2 },
        { itemId: 'leather', quantity: 1 },
      ],
    },
    rabbit: {
      health: 20,
      speed: 0.12,
      drops: [{ itemId: 'meat', quantity: 1 }],
    },
    wolf: {
      health: 80,
      speed: 0.06,
      drops: [
        { itemId: 'meat', quantity: 1 },
        { itemId: 'leather', quantity: 2 },
      ],
    },
  };

  const config = configs[type];

  return {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    position: { x: position.x, y: 0, z: position.z },
    rotation: Math.random() * Math.PI * 2,
    health: config.health,
    maxHealth: config.health,
    speed: config.speed,
    behavior: 'idle',
    lastBehaviorChange: Date.now(),
    drops: config.drops,
  };
};

export const updateAnimalAI = (
  animal: Animal,
  playerPosition: { x: number; z: number },
  deltaTime: number
): Partial<Animal> => {
  if (animal.behavior === 'dead') return {};

  const now = Date.now();
  const distanceToPlayer = Math.sqrt(
    Math.pow(animal.position.x - playerPosition.x, 2) +
      Math.pow(animal.position.z - playerPosition.z, 2)
  );

  let updates: Partial<Animal> = {};

  // Behavior decision based on animal type and player distance
  if (animal.type === 'wolf') {
    // Wolves attack when player is close
    if (distanceToPlayer < ATTACK_RANGE) {
      updates.behavior = 'attacking';
    } else if (distanceToPlayer < DETECTION_RANGE) {
      updates.behavior = 'attacking';
      // Move towards player
      const dx = playerPosition.x - animal.position.x;
      const dz = playerPosition.z - animal.position.z;
      const angle = Math.atan2(dx, dz);
      updates.rotation = angle;
      updates.position = {
        x: animal.position.x + Math.sin(angle) * animal.speed * deltaTime,
        y: 0,
        z: animal.position.z + Math.cos(angle) * animal.speed * deltaTime,
      };
    } else if (now - animal.lastBehaviorChange > BEHAVIOR_CHANGE_INTERVAL) {
      updates = handleIdleOrWander(animal, now);
    }
  } else {
    // Deer and rabbits flee from player
    if (distanceToPlayer < DETECTION_RANGE) {
      updates.behavior = 'fleeing';
      // Move away from player
      const dx = animal.position.x - playerPosition.x;
      const dz = animal.position.z - playerPosition.z;
      const angle = Math.atan2(dx, dz);
      updates.rotation = angle;
      
      const fleeSpeed = animal.speed * 1.5;
      updates.position = {
        x: animal.position.x + Math.sin(angle) * fleeSpeed * deltaTime,
        y: 0,
        z: animal.position.z + Math.cos(angle) * fleeSpeed * deltaTime,
      };
    } else if (now - animal.lastBehaviorChange > BEHAVIOR_CHANGE_INTERVAL) {
      updates = handleIdleOrWander(animal, now);
    }
  }

  // Continue wandering if already wandering
  if (animal.behavior === 'wandering' && animal.targetPosition && !updates.behavior) {
    const dx = animal.targetPosition.x - animal.position.x;
    const dz = animal.targetPosition.z - animal.position.z;
    const distanceToTarget = Math.sqrt(dx * dx + dz * dz);

    if (distanceToTarget < 1) {
      updates.behavior = 'idle';
      updates.targetPosition = undefined;
    } else {
      const angle = Math.atan2(dx, dz);
      updates.rotation = angle;
      updates.position = {
        x: animal.position.x + Math.sin(angle) * animal.speed * deltaTime,
        y: 0,
        z: animal.position.z + Math.cos(angle) * animal.speed * deltaTime,
      };
    }
  }

  // Keep animals in bounds
  if (updates.position) {
    const bounds = 45;
    updates.position.x = Math.max(-bounds, Math.min(bounds, updates.position.x));
    updates.position.z = Math.max(-bounds, Math.min(bounds, updates.position.z));
  }

  return updates;
};

const handleIdleOrWander = (animal: Animal, now: number): Partial<Animal> => {
  const shouldWander = Math.random() > 0.5;

  if (shouldWander) {
    const wanderDistance = 5 + Math.random() * 10;
    const wanderAngle = Math.random() * Math.PI * 2;
    return {
      behavior: 'wandering',
      targetPosition: {
        x: animal.position.x + Math.sin(wanderAngle) * wanderDistance,
        z: animal.position.z + Math.cos(wanderAngle) * wanderDistance,
      },
      lastBehaviorChange: now,
    };
  }

  return {
    behavior: 'idle',
    lastBehaviorChange: now,
  };
};

export const damageAnimal = (animal: Animal, damage: number): Partial<Animal> => {
  const newHealth = Math.max(0, animal.health - damage);
  
  if (newHealth <= 0) {
    return {
      health: 0,
      behavior: 'dead',
    };
  }

  return {
    health: newHealth,
    behavior: 'fleeing',
    lastBehaviorChange: Date.now(),
  };
};
