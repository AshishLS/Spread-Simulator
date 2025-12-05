import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Simulation } from './components/Simulation';
import { Overlay } from './components/Overlay';
import { ARENA_DEPTH, ARENA_WIDTH, GameStatus, WALL_HEIGHT } from './types';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [boxCount, setBoxCount] = useState(50); // User Input state
  const [activeBoxCount, setActiveBoxCount] = useState(50); // Actual sim state (locks during run)
  const [speed, setSpeed] = useState(1.0);
  const [infectedCount, setInfectedCount] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startTimeRef = useRef<number>(0);
  const timerRequestRef = useRef<number>(0);

  const updateTimer = () => {
    if (status === 'RUNNING') {
      setElapsedTime(Date.now() - startTimeRef.current);
      timerRequestRef.current = requestAnimationFrame(updateTimer);
    }
  };

  useEffect(() => {
    if (status === 'RUNNING') {
      startTimeRef.current = Date.now() - elapsedTime;
      timerRequestRef.current = requestAnimationFrame(updateTimer);
    } else {
      cancelAnimationFrame(timerRequestRef.current);
    }
    return () => cancelAnimationFrame(timerRequestRef.current);
  }, [status]);

  const handleStart = () => {
    setActiveBoxCount(Math.min(500, Math.max(2, boxCount))); // Validate and lock count
    setInfectedCount(1);
    setElapsedTime(0);
    setStatus('RUNNING');
  };

  const handleRestart = () => {
    setStatus('IDLE');
    setElapsedTime(0);
    setInfectedCount(1);
  };

  const handleFinished = () => {
    setStatus('FINISHED');
    cancelAnimationFrame(timerRequestRef.current);
  };

  const handleBoxCountChange = (val: number) => {
    // Only allow changing count when IDLE
    if (status === 'IDLE') {
       setBoxCount(val);
       setActiveBoxCount(val); // Update visual immediately
    }
  };

  return (
    <div className="relative w-full h-screen bg-neutral-900">
      <Overlay
        status={status}
        elapsedTime={elapsedTime}
        totalInfected={infectedCount}
        totalBoxes={activeBoxCount}
        speed={speed}
        boxCountInput={boxCount}
        onStart={handleStart}
        onRestart={handleRestart}
        onSpeedChange={setSpeed}
        onBoxCountChange={handleBoxCountChange}
      />

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 45, 45]} fov={50} />
        <OrbitControls 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2.5} 
            minDistance={20}
            maxDistance={80}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 20, 10]} intensity={1} castShadow />
        <Environment preset="city" />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[ARENA_WIDTH, ARENA_DEPTH]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
        </mesh>
        <gridHelper args={[ARENA_WIDTH, ARENA_WIDTH, 0x444444, 0x222222]} position={[0, 0.01, 0]} />

        {/* Walls */}
        <group>
            {/* Top */}
            <mesh position={[0, WALL_HEIGHT/2, -ARENA_DEPTH/2]} receiveShadow castShadow>
                <boxGeometry args={[ARENA_WIDTH, WALL_HEIGHT, 1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {/* Bottom */}
            <mesh position={[0, WALL_HEIGHT/2, ARENA_DEPTH/2]} receiveShadow castShadow>
                <boxGeometry args={[ARENA_WIDTH, WALL_HEIGHT, 1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
             {/* Left */}
             <mesh position={[-ARENA_WIDTH/2, WALL_HEIGHT/2, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow castShadow>
                <boxGeometry args={[ARENA_DEPTH, WALL_HEIGHT, 1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {/* Right */}
            <mesh position={[ARENA_WIDTH/2, WALL_HEIGHT/2, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow castShadow>
                <boxGeometry args={[ARENA_DEPTH, WALL_HEIGHT, 1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>

        {/* Simulation Content */}
        <Simulation
          boxCount={activeBoxCount}
          speedMultiplier={speed}
          status={status}
          onStatsUpdate={setInfectedCount}
          onFinished={handleFinished}
        />
      </Canvas>
    </div>
  );
}
