import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ARENA_DEPTH, ARENA_WIDTH, BOX_SIZE, GameStatus } from '../types';

interface SimulationProps {
  boxCount: number;
  speedMultiplier: number;
  status: GameStatus;
  onStatsUpdate: (infected: number) => void;
  onFinished: () => void;
}

const tempMatrix = new THREE.Matrix4();

// Colors
const COLOR_HEALTHY = new THREE.Color('#ffffff');
const COLOR_INFECTED = new THREE.Color('#8b5cf6'); // Violet-500

interface BoxData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  infected: boolean;
}

export const Simulation: React.FC<SimulationProps> = ({
  boxCount,
  speedMultiplier,
  status,
  onStatsUpdate,
  onFinished,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Simulation State stored in Refs to avoid React render cycle overhead on every frame
  const boxes = useRef<BoxData[]>([]);
  const isRunning = useRef(false);
  const finished = useRef(false);

  // Initialize Boxes
  useEffect(() => {
    // Reset simulation state
    const newBoxes: BoxData[] = [];
    finished.current = false;

    for (let i = 0; i < boxCount; i++) {
      // Ensure boxes don't spawn inside each other initially (simple retry mechanic)
      let x = 0, z = 0;
      let safe = false;
      let attempts = 0;
      
      while (!safe && attempts < 100) {
        x = (Math.random() - 0.5) * (ARENA_WIDTH - BOX_SIZE * 2);
        z = (Math.random() - 0.5) * (ARENA_DEPTH - BOX_SIZE * 2);
        
        safe = true;
        for (const existing of newBoxes) {
          const dx = existing.position.x - x;
          const dz = existing.position.z - z;
          if (Math.sqrt(dx*dx + dz*dz) < BOX_SIZE * 1.1) {
            safe = false;
            break;
          }
        }
        attempts++;
      }

      // Random velocity (normalized 2D vector)
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle);
      const vz = Math.sin(angle);

      // First box is infected
      const isInfected = i === 0;

      newBoxes.push({
        position: new THREE.Vector3(x, BOX_SIZE / 2, z),
        velocity: new THREE.Vector3(vx, 0, vz),
        infected: isInfected,
      });
    }

    boxes.current = newBoxes;
    
    // Initial Render of InstancedMesh
    if (meshRef.current) {
      boxes.current.forEach((box, i) => {
        tempMatrix.setPosition(box.position);
        meshRef.current!.setMatrixAt(i, tempMatrix);
        meshRef.current!.setColorAt(i, box.infected ? COLOR_INFECTED : COLOR_HEALTHY);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }

    onStatsUpdate(1); // Reset stats
  }, [boxCount, status === 'IDLE']); // Re-run when box count changes or we hard reset to IDLE

  // Update running ref
  useEffect(() => {
    isRunning.current = status === 'RUNNING';
  }, [status]);

  useFrame((state, delta) => {
    if (!isRunning.current || !meshRef.current || finished.current) return;

    // Cap delta to prevent tunneling on lag spikes
    const dt = Math.min(delta, 0.1);
    const speed = 10 * speedMultiplier;
    
    let currentInfectedCount = 0;
    let colorNeedsUpdate = false;

    const boxList = boxes.current;
    const count = boxList.length;

    // 1. Move and Wall Collisions
    for (let i = 0; i < count; i++) {
      const box = boxList[i];
      
      // Move
      box.position.addScaledVector(box.velocity, speed * dt);

      // Wall Collision X
      const halfWidth = ARENA_WIDTH / 2;
      const boundaryX = halfWidth - BOX_SIZE / 2;
      
      if (box.position.x > boundaryX) {
        box.position.x = boundaryX;
        box.velocity.x *= -1;
      } else if (box.position.x < -boundaryX) {
        box.position.x = -boundaryX;
        box.velocity.x *= -1;
      }

      // Wall Collision Z
      const halfDepth = ARENA_DEPTH / 2;
      const boundaryZ = halfDepth - BOX_SIZE / 2;

      if (box.position.z > boundaryZ) {
        box.position.z = boundaryZ;
        box.velocity.z *= -1;
      } else if (box.position.z < -boundaryZ) {
        box.position.z = -boundaryZ;
        box.velocity.z *= -1;
      }

      if (box.infected) currentInfectedCount++;
    }

    // 2. Box vs Box Collisions (Simple O(N^2) for N=100 is fine)
    // For larger N, a spatial partition (Grid/Quadtree) would be needed.
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const b1 = boxList[i];
        const b2 = boxList[j];

        const dx = b2.position.x - b1.position.x;
        const dz = b2.position.z - b1.position.z;
        const distSq = dx * dx + dz * dz;
        const minDist = BOX_SIZE; // Assumes cubes are aligned or simple radius check

        // Using simple radius check (slightly generous) for box collision to prevent corner clipping
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          
          // A. Resolve Overlap (Push apart)
          const overlap = minDist - dist;
          // Normal vector from 1 to 2
          let nx = dx / dist;
          let nz = dz / dist;
          
          if (dist === 0) { nx = 1; nz = 0; } // Prevent div by zero

          const moveX = nx * overlap * 0.5;
          const moveZ = nz * overlap * 0.5;

          b1.position.x -= moveX;
          b1.position.z -= moveZ;
          b2.position.x += moveX;
          b2.position.z += moveZ;

          // B. Bounce (Elastic Collision - simplified for equal mass)
          // Swap velocity components along the normal
          // v1_new = v1 - dot(v1-v2, n) * n
          
          const dvx = b1.velocity.x - b2.velocity.x;
          const dvz = b1.velocity.z - b2.velocity.z;
          const dot = dvx * nx + dvz * nz;

          if (dot > 0) {
            b1.velocity.x -= dot * nx;
            b1.velocity.z -= dot * nz;
            b2.velocity.x += dot * nx;
            b2.velocity.z += dot * nz;
          }

          // C. Infection Spread
          if (b1.infected !== b2.infected) {
            b1.infected = true;
            b2.infected = true;
            colorNeedsUpdate = true;
            // Critical fix: Increment count immediately so we detect the finish condition in this frame
            currentInfectedCount++;
          }
        }
      }
    }

    // 3. Update Visuals
    for (let i = 0; i < count; i++) {
      const box = boxList[i];
      tempMatrix.setPosition(box.position);
      meshRef.current.setMatrixAt(i, tempMatrix);
      
      if (colorNeedsUpdate) {
        meshRef.current.setColorAt(i, box.infected ? COLOR_INFECTED : COLOR_HEALTHY);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    
    if (colorNeedsUpdate) {
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
        onStatsUpdate(currentInfectedCount);
      
        // Check End Condition
        if (currentInfectedCount >= count) {
            finished.current = true;
            onFinished();
        }
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, boxCount]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
};