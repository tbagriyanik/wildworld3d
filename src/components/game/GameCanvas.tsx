import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/game/gameState';
import { resourceItems } from '@/game/recipes';
import { Animal } from '@/game/types';
import { createAnimal, updateAnimalAI, damageAnimal } from '@/game/animalAI';

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerRef = useRef<{ position: THREE.Vector3; rotation: THREE.Euler }>({
    position: new THREE.Vector3(0, 2, 0),
    rotation: new THREE.Euler(0, 0, 0),
  });
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef({ x: 0, y: 0, locked: false });
  const clockRef = useRef(new THREE.Clock());
  const worldObjectsRef = useRef<THREE.Object3D[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animalMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const saveIntervalRef = useRef<number | null>(null);
  
  const { 
    addItem, 
    setPlayerRotation, 
    setTimeOfDay, 
    weather,
    updatePlayerStats,
    damagePlayer,
    animals,
    setAnimals,
    updateAnimal,
    removeAnimal,
    addAnimal,
    saveGame,
    setPlayerPosition,
    playerPosition,
    playerRotation: savedPlayerRotation,
  } = useGameStore();

  const createTerrain = useCallback((scene: THREE.Scene) => {
    // Ground with grass texture simulation
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x5a8f3e,
    });
    
    // Add some height variation
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setZ(i, Math.sin(x * 0.05) * Math.cos(y * 0.05) * 1 + Math.random() * 0.3);
    }
    groundGeometry.computeVertexNormals();
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    return ground;
  }, []);

  const createTree = useCallback((scene: THREE.Scene, x: number, z: number) => {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.35, 2.5, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    group.add(trunk);
    
    // Foliage - multiple cones for fuller look
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
    
    const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 8), foliageMaterial);
    cone1.position.y = 4;
    cone1.castShadow = true;
    group.add(cone1);
    
    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 8), foliageMaterial);
    cone2.position.y = 5.5;
    cone2.castShadow = true;
    group.add(cone2);
    
    const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 8), foliageMaterial);
    cone3.position.y = 6.8;
    cone3.castShadow = true;
    group.add(cone3);
    
    group.position.set(x, 0, z);
    group.userData = { type: 'tree', gatherable: true, resource: 'wood', resourceKey: 'wood', icon: '🪵' };
    
    scene.add(group);
    worldObjectsRef.current.push(group);
    
    return group;
  }, []);

  const createRock = useCallback((scene: THREE.Scene, x: number, z: number) => {
    const geometry = new THREE.DodecahedronGeometry(0.7, 0);
    const material = new THREE.MeshLambertMaterial({ color: 0x6b6b6b });
    const rock = new THREE.Mesh(geometry, material);
    
    rock.position.set(x, 0.35, z);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    rock.scale.set(1 + Math.random() * 0.4, 0.7 + Math.random() * 0.3, 1 + Math.random() * 0.4);
    rock.castShadow = true;
    rock.userData = { type: 'rock', gatherable: true, resource: 'stone', resourceKey: 'stone', icon: '🪨' };
    
    scene.add(rock);
    worldObjectsRef.current.push(rock);
    
    return rock;
  }, []);

  const createBush = useCallback((scene: THREE.Scene, x: number, z: number) => {
    const group = new THREE.Group();
    const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x3d7a35 });
    
    // Multiple spheres for bush effect
    for (let i = 0; i < 3; i++) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.4 + Math.random() * 0.2, 8, 8),
        bushMaterial
      );
      sphere.position.set(
        (Math.random() - 0.5) * 0.4,
        0.3 + Math.random() * 0.2,
        (Math.random() - 0.5) * 0.4
      );
      sphere.castShadow = true;
      group.add(sphere);
    }
    
    const isBerry = Math.random() > 0.5;
    group.position.set(x, 0, z);
    group.userData = { 
      type: 'bush', 
      gatherable: true, 
      resource: isBerry ? 'berry' : 'apple',
      resourceKey: isBerry ? 'berry' : 'apple',
      icon: isBerry ? '🫐' : '🍎'
    };
    
    scene.add(group);
    worldObjectsRef.current.push(group);
    
    return group;
  }, []);

  const createWater = useCallback((scene: THREE.Scene, x: number, z: number) => {
    const geometry = new THREE.CircleGeometry(6, 32);
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x4a90a4, 
      transparent: true, 
      opacity: 0.8 
    });
    const water = new THREE.Mesh(geometry, material);
    
    water.position.set(x, 0.05, z);
    water.rotation.x = -Math.PI / 2;
    water.userData = { type: 'water', gatherable: false };
    
    scene.add(water);
    
    return water;
  }, []);

  const createAnimalMesh = useCallback((scene: THREE.Scene, animal: Animal) => {
    const group = new THREE.Group();
    
    const colors = {
      deer: 0x8B4513,
      rabbit: 0xA0826D,
      wolf: 0x4A4A4A,
    };
    
    const sizes = {
      deer: { body: 0.8, height: 1.2 },
      rabbit: { body: 0.25, height: 0.3 },
      wolf: { body: 0.6, height: 0.8 },
    };
    
    const config = sizes[animal.type];
    const color = colors[animal.type];
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(config.body * 0.5, config.body, 8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    body.position.y = config.height;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(config.body * 0.4, 8, 8);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(config.body * 0.8, config.height * 1.1, 0);
    head.castShadow = true;
    group.add(head);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(config.body * 0.1, config.body * 0.1, config.height * 0.8, 6);
    const positions = [
      [-config.body * 0.3, 0, config.body * 0.3],
      [-config.body * 0.3, 0, -config.body * 0.3],
      [config.body * 0.3, 0, config.body * 0.3],
      [config.body * 0.3, 0, -config.body * 0.3],
    ];
    
    positions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeometry, bodyMaterial);
      leg.position.set(x, config.height * 0.4, z);
      leg.castShadow = true;
      group.add(leg);
    });
    
    group.position.set(animal.position.x, 0, animal.position.z);
    group.rotation.y = animal.rotation;
    group.userData = { type: 'animal', animalId: animal.id, animalType: animal.type };
    
    scene.add(group);
    animalMeshesRef.current.set(animal.id, group);
    worldObjectsRef.current.push(group);
    
    return group;
  }, []);

  const createWeatherParticles = useCallback((scene: THREE.Scene, type: 'rain' | 'snow') => {
    if (particlesRef.current) {
      scene.remove(particlesRef.current);
    }
    
    const particleCount = type === 'rain' ? 5000 : 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = Math.random() * 50;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: type === 'rain' ? 0x6699cc : 0xffffff,
      size: type === 'rain' ? 0.1 : 0.3,
      transparent: true,
      opacity: 0.6,
    });
    
    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    scene.add(particles);
    
    return particles;
  }, []);

  const updateWeatherParticles = useCallback(() => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position;
    const weatherType = weather === 'snow' ? 'snow' : 'rain';
    const fallSpeed = weatherType === 'rain' ? 0.5 : 0.1;
    
    for (let i = 0; i < positions.count; i++) {
      let y = positions.getY(i);
      y -= fallSpeed;
      
      if (y < 0) {
        y = 50;
        positions.setX(i, (Math.random() - 0.5) * 100);
        positions.setZ(i, (Math.random() - 0.5) * 100);
      }
      
      positions.setY(i, y);
      
      if (weatherType === 'snow') {
        positions.setX(i, positions.getX(i) + (Math.random() - 0.5) * 0.1);
      }
    }
    
    positions.needsUpdate = true;
  }, [weather]);

  const handleGather = useCallback(() => {
    if (!cameraRef.current || !sceneRef.current) return;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current);
    
    const intersects = raycaster.intersectObjects(worldObjectsRef.current, true);
    
    if (intersects.length > 0) {
      let object = intersects[0].object;
      
      while (object.parent && !object.userData.type) {
        object = object.parent as THREE.Object3D;
      }
      
      // Handle animal hunting
      if (object.userData.type === 'animal') {
        const animalId = object.userData.animalId;
        const animalData = useGameStore.getState().animals.find(a => a.id === animalId);
        
        if (animalData && animalData.behavior !== 'dead') {
          const updates = damageAnimal(animalData, 25);
          updateAnimal(animalId, updates);
          
          if (updates.behavior === 'dead') {
            // Give drops
            animalData.drops.forEach(drop => {
              const resource = resourceItems[drop.itemId as keyof typeof resourceItems];
              if (resource) {
                addItem(resource, drop.quantity);
              }
            });
            
            // Dispatch hunt event
            window.dispatchEvent(new CustomEvent('gather', {
              detail: {
                resourceKey: animalData.type,
                icon: animalData.type === 'deer' ? '🦌' : animalData.type === 'rabbit' ? '🐰' : '🐺',
                quantity: 1
              }
            }));
            
            // Remove mesh after delay
            setTimeout(() => {
              const mesh = animalMeshesRef.current.get(animalId);
              if (mesh && sceneRef.current) {
                sceneRef.current.remove(mesh);
                animalMeshesRef.current.delete(animalId);
                const idx = worldObjectsRef.current.indexOf(mesh);
                if (idx > -1) worldObjectsRef.current.splice(idx, 1);
              }
              removeAnimal(animalId);
              
              // Respawn new animal
              setTimeout(() => {
                const types: Animal['type'][] = ['deer', 'rabbit', 'wolf'];
                const newType = types[Math.floor(Math.random() * types.length)];
                const newAnimal = createAnimal(newType, {
                  x: (Math.random() - 0.5) * 80,
                  z: (Math.random() - 0.5) * 80,
                });
                addAnimal(newAnimal);
              }, 15000);
            }, 2000);
          }
        }
        return;
      }
      
      if (object.userData.gatherable && object.userData.resource) {
        const resourceId = object.userData.resource as keyof typeof resourceItems;
        const resource = resourceItems[resourceId];
        
        if (resource) {
          const quantity = Math.floor(Math.random() * 2) + 1;
          addItem(resource, quantity);
          
          window.dispatchEvent(new CustomEvent('gather', {
            detail: {
              resourceKey: object.userData.resourceKey,
              icon: object.userData.icon,
              quantity
            }
          }));
          
          const shrinkInterval = setInterval(() => {
            object.scale.multiplyScalar(0.85);
            if (object.scale.x < 0.1) {
              clearInterval(shrinkInterval);
              sceneRef.current?.remove(object);
              const index = worldObjectsRef.current.indexOf(object);
              if (index > -1) {
                worldObjectsRef.current.splice(index, 1);
              }
              
              setTimeout(() => {
                if (sceneRef.current) {
                  const newX = (Math.random() - 0.5) * 80;
                  const newZ = (Math.random() - 0.5) * 80;
                  
                  if (object.userData.type === 'tree') {
                    createTree(sceneRef.current, newX, newZ);
                  } else if (object.userData.type === 'rock') {
                    createRock(sceneRef.current, newX, newZ);
                  } else if (object.userData.type === 'bush') {
                    createBush(sceneRef.current, newX, newZ);
                  }
                }
              }, 20000);
            }
          }, 50);
        }
      }
    }
  }, [addItem, createTree, createRock, createBush, updateAnimal, removeAnimal, addAnimal]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 150);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.copy(playerRef.current.position);
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    // Hemisphere light for better ambient
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x5a8f3e, 0.4);
    scene.add(hemiLight);
    
    // Create world
    createTerrain(scene);
    
    // Add trees in clusters
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 120;
      const z = (Math.random() - 0.5) * 120;
      if (Math.abs(x) > 8 || Math.abs(z) > 8) {
        createTree(scene, x, z);
      }
    }
    
    // Add rocks
    for (let i = 0; i < 35; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      if (Math.abs(x) > 5 || Math.abs(z) > 5) {
        createRock(scene, x, z);
      }
    }
    
    // Add bushes
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      if (Math.abs(x) > 5 || Math.abs(z) > 5) {
        createBush(scene, x, z);
      }
    }
    
    // Add water sources
    createWater(scene, 25, 25);
    createWater(scene, -35, -20);
    createWater(scene, 40, -30);
    
    // Spawn initial animals
    const initialAnimals: Animal[] = [];
    const animalTypes: Animal['type'][] = ['deer', 'rabbit', 'wolf'];
    for (let i = 0; i < 8; i++) {
      const type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      if (Math.abs(x) > 10 || Math.abs(z) > 10) {
        const animal = createAnimal(type, { x, z });
        initialAnimals.push(animal);
        createAnimalMesh(scene, animal);
      }
    }
    setAnimals(initialAnimals);
    
    // Controls
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      
      if (e.key.toLowerCase() === 'e') {
        useGameStore.getState().toggleCrafting();
      }
      
      // Save game on F5
      if (e.key === 'F5') {
        e.preventDefault();
        const state = useGameStore.getState();
        state.setPlayerPosition({
          x: playerRef.current.position.x,
          y: playerRef.current.position.y,
          z: playerRef.current.position.z,
        });
        state.saveGame();
        window.dispatchEvent(new CustomEvent('gameSaved'));
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRef.current.locked) {
        const sensitivity = 0.002;
        playerRef.current.rotation.y -= e.movementX * sensitivity;
        playerRef.current.rotation.x -= e.movementY * sensitivity;
        playerRef.current.rotation.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, playerRef.current.rotation.x)
        );
        setPlayerRotation(playerRef.current.rotation.y);
      }
    };
    
    const handleClick = () => {
      if (!mouseRef.current.locked) {
        renderer.domElement.requestPointerLock();
      } else {
        handleGather();
      }
    };
    
    const handlePointerLockChange = () => {
      mouseRef.current.locked = document.pointerLockElement === renderer.domElement;
    };
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    const handleNumberKey = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 8) {
        useGameStore.getState().selectSlot(num - 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleNumberKey);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    
    // Handle load game event
    const handleLoadGame = () => {
      const state = useGameStore.getState();
      playerRef.current.position.set(
        state.playerPosition.x,
        state.playerPosition.y,
        state.playerPosition.z
      );
      playerRef.current.rotation.y = state.playerRotation;
    };
    
    // Handle new game event
    const handleNewGame = () => {
      playerRef.current.position.set(0, 2, 0);
      playerRef.current.rotation.set(0, 0, 0);
    };
    
    window.addEventListener('loadGame', handleLoadGame);
    window.addEventListener('newGame', handleNewGame);
    
    // Auto-save every 60 seconds
    saveIntervalRef.current = window.setInterval(() => {
      const state = useGameStore.getState();
      state.setPlayerPosition({
        x: playerRef.current.position.x,
        y: playerRef.current.position.y,
        z: playerRef.current.position.z,
      });
      state.saveGame();
    }, 60000);
    
    // Game loop
    let dayTime = 0.5;
    let statsTimer = 0;
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const delta = clockRef.current.getDelta();
      
      // Player movement
      const speed = 8;
      const direction = new THREE.Vector3();
      
      if (keysRef.current.has('w')) direction.z -= 1;
      if (keysRef.current.has('s')) direction.z += 1;
      if (keysRef.current.has('a')) direction.x -= 1;
      if (keysRef.current.has('d')) direction.x += 1;
      
      if (direction.length() > 0) {
        direction.normalize();
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRef.current.rotation.y);
        playerRef.current.position.add(direction.multiplyScalar(speed * delta));
        playerRef.current.position.y = 2;
        playerRef.current.position.x = Math.max(-90, Math.min(90, playerRef.current.position.x));
        playerRef.current.position.z = Math.max(-90, Math.min(90, playerRef.current.position.z));
      }
      
      // Update camera
      camera.position.copy(playerRef.current.position);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = playerRef.current.rotation.y;
      camera.rotation.x = playerRef.current.rotation.x;
      
      // Update animals AI
      const currentAnimals = useGameStore.getState().animals;
      const playerPos = { x: playerRef.current.position.x, z: playerRef.current.position.z };
      
      currentAnimals.forEach(animal => {
        if (animal.behavior === 'dead') return;
        
        const updates = updateAnimalAI(animal, playerPos, delta * 60);
        if (Object.keys(updates).length > 0) {
          useGameStore.getState().updateAnimal(animal.id, updates);
        }
        
        // Update mesh position
        const mesh = animalMeshesRef.current.get(animal.id);
        if (mesh && updates.position) {
          mesh.position.set(updates.position.x, 0, updates.position.z);
        }
        if (mesh && updates.rotation !== undefined) {
          mesh.rotation.y = updates.rotation;
        }
        
        // Wolf attacks player
        if (animal.type === 'wolf' && animal.behavior === 'attacking') {
          const dist = Math.sqrt(
            Math.pow(animal.position.x - playerPos.x, 2) +
            Math.pow(animal.position.z - playerPos.z, 2)
          );
          if (dist < 2) {
            useGameStore.getState().damagePlayer(0.1);
          }
        }
      });
      
      // Day/night cycle
      dayTime += delta * 0.008;
      if (dayTime > 1) dayTime = 0;
      setTimeOfDay(dayTime);
      
      // Update sky color based on time
      const sunAngle = dayTime * Math.PI * 2;
      directionalLight.position.x = Math.cos(sunAngle) * 100;
      directionalLight.position.y = Math.sin(sunAngle) * 100 + 20;
      
      if (dayTime < 0.2 || dayTime > 0.85) {
        // Night
        scene.background = new THREE.Color(0x1a1a2e);
        scene.fog = new THREE.Fog(0x1a1a2e, 30, 80);
        directionalLight.intensity = 0.2;
        ambientLight.intensity = 0.15;
      } else if (dayTime < 0.3 || dayTime > 0.75) {
        // Dawn/Dusk - beautiful sunset colors
        const t = dayTime < 0.3 ? (dayTime - 0.2) / 0.1 : (0.85 - dayTime) / 0.1;
        const sunsetColor = new THREE.Color().setHSL(0.08, 0.8, 0.5 + t * 0.2);
        scene.background = sunsetColor;
        scene.fog = new THREE.Fog(sunsetColor, 40, 100);
        directionalLight.intensity = 0.6;
        ambientLight.intensity = 0.4;
        directionalLight.color = new THREE.Color(0xffd4a0);
      } else {
        // Day
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 50, 150);
        directionalLight.intensity = 1;
        ambientLight.intensity = 0.6;
        directionalLight.color = new THREE.Color(0xffffff);
      }
      
      // Weather particles
      const currentWeather = useGameStore.getState().weather;
      if (currentWeather !== 'clear') {
        if (!particlesRef.current) {
          createWeatherParticles(scene, currentWeather === 'snow' ? 'snow' : 'rain');
        }
        updateWeatherParticles();
      } else if (particlesRef.current) {
        scene.remove(particlesRef.current);
        particlesRef.current = null;
      }
      
      // Update player stats
      statsTimer += delta;
      if (statsTimer > 3) {
        statsTimer = 0;
        const state = useGameStore.getState();
        updatePlayerStats({
          hunger: Math.max(0, state.player.hunger - 0.3),
          thirst: Math.max(0, state.player.thirst - 0.5),
          temperature: currentWeather === 'snow' 
            ? Math.max(0, state.player.temperature - 0.8)
            : currentWeather === 'rain'
            ? Math.max(20, state.player.temperature - 0.3)
            : Math.min(50, state.player.temperature + 0.1),
        });
        
        if (state.player.hunger < 10 || state.player.thirst < 10) {
          updatePlayerStats({
            health: Math.max(0, state.player.health - 0.5),
          });
        }
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleNumberKey);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('loadGame', handleLoadGame);
      window.removeEventListener('newGame', handleNewGame);
      
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [createTerrain, createTree, createRock, createBush, createWater, handleGather, setPlayerRotation, setTimeOfDay, createWeatherParticles, updateWeatherParticles, updatePlayerStats, createAnimalMesh, setAnimals]);

  useEffect(() => {
    if (!sceneRef.current) return;
    
    if (weather !== 'clear') {
      createWeatherParticles(sceneRef.current, weather === 'snow' ? 'snow' : 'rain');
    } else if (particlesRef.current && sceneRef.current) {
      sceneRef.current.remove(particlesRef.current);
      particlesRef.current = null;
    }
  }, [weather, createWeatherParticles]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0"
      style={{ cursor: mouseRef.current.locked ? 'none' : 'pointer' }}
    />
  );
}
