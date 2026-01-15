import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/game/gameState';
import { resourceItems } from '@/game/recipes';

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
  
  const { 
    addItem, 
    setPlayerRotation, 
    setTimeOfDay, 
    weather,
    updatePlayerStats,
    player
  } = useGameStore();

  const createTerrain = useCallback((scene: THREE.Scene) => {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4a7c59,
    });
    
    // Add some height variation
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setZ(i, Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2 + Math.random() * 0.5);
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
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    group.add(trunk);
    
    // Foliage
    const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 4.5;
    foliage.castShadow = true;
    group.add(foliage);
    
    group.position.set(x, 0, z);
    group.userData = { type: 'tree', gatherable: true, resource: 'wood' };
    
    scene.add(group);
    worldObjectsRef.current.push(group);
    
    return group;
  }, []);

  const createRock = useCallback((scene: THREE.Scene, x: number, z: number) => {
    const geometry = new THREE.DodecahedronGeometry(0.8, 0);
    const material = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const rock = new THREE.Mesh(geometry, material);
    
    rock.position.set(x, 0.4, z);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    rock.scale.set(1 + Math.random() * 0.5, 0.8 + Math.random() * 0.4, 1 + Math.random() * 0.5);
    rock.castShadow = true;
    rock.userData = { type: 'rock', gatherable: true, resource: 'stone' };
    
    scene.add(rock);
    worldObjectsRef.current.push(rock);
    
    return rock;
  }, []);

  const createBush = useCallback((scene: THREE.Scene, x: number, z: number) => {
    const geometry = new THREE.SphereGeometry(0.6, 8, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
    const bush = new THREE.Mesh(geometry, material);
    
    bush.position.set(x, 0.4, z);
    bush.scale.set(1, 0.7, 1);
    bush.castShadow = true;
    bush.userData = { type: 'bush', gatherable: true, resource: Math.random() > 0.5 ? 'apple' : 'berry' };
    
    scene.add(bush);
    worldObjectsRef.current.push(bush);
    
    return bush;
  }, []);

  const createWater = useCallback((scene: THREE.Scene, x: number, z: number) => {
    const geometry = new THREE.CircleGeometry(5, 32);
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x4682B4, 
      transparent: true, 
      opacity: 0.7 
    });
    const water = new THREE.Mesh(geometry, material);
    
    water.position.set(x, 0.1, z);
    water.rotation.x = -Math.PI / 2;
    water.userData = { type: 'water', gatherable: false };
    
    scene.add(water);
    
    return water;
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
      
      // Add some drift for snow
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
      
      // Find parent with userData
      while (object.parent && !object.userData.type) {
        object = object.parent as THREE.Object3D;
      }
      
      if (object.userData.gatherable && object.userData.resource) {
        const resourceId = object.userData.resource as keyof typeof resourceItems;
        const resource = resourceItems[resourceId];
        
        if (resource) {
          addItem(resource, Math.floor(Math.random() * 2) + 1);
          
          // Visual feedback - shrink and remove
          const originalScale = object.scale.clone();
          const shrinkInterval = setInterval(() => {
            object.scale.multiplyScalar(0.9);
            if (object.scale.x < 0.1) {
              clearInterval(shrinkInterval);
              sceneRef.current?.remove(object);
              const index = worldObjectsRef.current.indexOf(object);
              if (index > -1) {
                worldObjectsRef.current.splice(index, 1);
              }
              
              // Respawn after delay
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
              }, 30000);
            }
          }, 50);
        }
      }
    }
  }, [addItem, createTree, createRock, createBush]);

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
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
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
    
    // Create world
    createTerrain(scene);
    
    // Add trees
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      if (Math.abs(x) > 5 || Math.abs(z) > 5) {
        createTree(scene, x, z);
      }
    }
    
    // Add rocks
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      if (Math.abs(x) > 3 || Math.abs(z) > 3) {
        createRock(scene, x, z);
      }
    }
    
    // Add bushes
    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      if (Math.abs(x) > 3 || Math.abs(z) > 3) {
        createBush(scene, x, z);
      }
    }
    
    // Add water sources
    createWater(scene, 20, 20);
    createWater(scene, -30, -15);
    
    // Controls
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      
      if (e.key.toLowerCase() === 'e') {
        useGameStore.getState().toggleCrafting();
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
    
    // Number key for hotbar
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
        
        // Keep player above ground
        playerRef.current.position.y = 2;
        
        // Boundary
        playerRef.current.position.x = Math.max(-90, Math.min(90, playerRef.current.position.x));
        playerRef.current.position.z = Math.max(-90, Math.min(90, playerRef.current.position.z));
      }
      
      // Update camera
      camera.position.copy(playerRef.current.position);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = playerRef.current.rotation.y;
      camera.rotation.x = playerRef.current.rotation.x;
      
      // Day/night cycle
      dayTime += delta * 0.01;
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
        ambientLight.intensity = 0.1;
      } else if (dayTime < 0.3 || dayTime > 0.75) {
        // Dawn/Dusk
        scene.background = new THREE.Color(0xff7e5f);
        scene.fog = new THREE.Fog(0xff7e5f, 40, 100);
        directionalLight.intensity = 0.6;
        ambientLight.intensity = 0.3;
      } else {
        // Day
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 50, 150);
        directionalLight.intensity = 1;
        ambientLight.intensity = 0.5;
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
      if (statsTimer > 2) {
        statsTimer = 0;
        const state = useGameStore.getState();
        updatePlayerStats({
          hunger: Math.max(0, state.player.hunger - 0.5),
          thirst: Math.max(0, state.player.thirst - 0.7),
          temperature: currentWeather === 'snow' 
            ? Math.max(0, state.player.temperature - 1)
            : currentWeather === 'rain'
            ? Math.max(20, state.player.temperature - 0.5)
            : Math.min(50, state.player.temperature + 0.2),
        });
        
        // Health effects
        if (state.player.hunger < 10 || state.player.thirst < 10) {
          updatePlayerStats({
            health: Math.max(0, state.player.health - 1),
          });
        }
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleNumberKey);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [createTerrain, createTree, createRock, createBush, createWater, handleGather, setPlayerRotation, setTimeOfDay, createWeatherParticles, updateWeatherParticles, updatePlayerStats]);

  // Handle weather changes
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
