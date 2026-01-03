import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  count: number;
  xpBurst: number;
  levelUp: boolean;
  accentColor: string;
}

const getColorFromAccent = (accent: string): THREE.Color => {
  switch (accent) {
    case 'blue': return new THREE.Color(0x06b6d4);
    case 'green': return new THREE.Color(0x22c55e);
    case 'red': return new THREE.Color(0xef4444);
    default: return new THREE.Color(0x9333ea);
  }
};

const Particles = ({ count, xpBurst, levelUp, accentColor }: ParticlesProps) => {
  const mesh = useRef<THREE.Points>(null);
  const burstRef = useRef<THREE.Points>(null);
  const [burstActive, setBurstActive] = useState(false);
  const [levelUpActive, setLevelUpActive] = useState(false);
  
  const primaryColor = useMemo(() => getColorFromAccent(accentColor), [accentColor]);

  // Background particles
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01 + 0.005;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.005;
      
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        colors[i3] = primaryColor.r;
        colors[i3 + 1] = primaryColor.g;
        colors[i3 + 2] = primaryColor.b;
      } else if (colorChoice < 0.8) {
        colors[i3] = 0.23; // secondary blue-ish
        colors[i3 + 1] = 0.51;
        colors[i3 + 2] = 0.96;
      } else {
        colors[i3] = 0.92; // gold
        colors[i3 + 1] = 0.70;
        colors[i3 + 2] = 0.03;
      }
      
      sizes[i] = Math.random() * 3 + 1;
    }
    
    return { positions, velocities, colors, sizes };
  }, [count, primaryColor]);

  // Burst particles for XP gains
  const burstParticles = useMemo(() => {
    const burstCount = 50;
    const positions = new Float32Array(burstCount * 3);
    const velocities = new Float32Array(burstCount * 3);
    const colors = new Float32Array(burstCount * 3);
    const sizes = new Float32Array(burstCount);
    const lifetimes = new Float32Array(burstCount);
    
    for (let i = 0; i < burstCount; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.3 + 0.1;
      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = Math.sin(angle) * speed + 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
      
      colors[i3] = primaryColor.r;
      colors[i3 + 1] = primaryColor.g;
      colors[i3 + 2] = primaryColor.b;
      
      sizes[i] = Math.random() * 5 + 3;
      lifetimes[i] = Math.random() * 0.5 + 0.5;
    }
    
    return { positions, velocities, colors, sizes, lifetimes };
  }, [primaryColor]);

  // Level up particles (bigger burst)
  const levelUpParticles = useMemo(() => {
    const burstCount = 150;
    const positions = new Float32Array(burstCount * 3);
    const velocities = new Float32Array(burstCount * 3);
    const colors = new Float32Array(burstCount * 3);
    const sizes = new Float32Array(burstCount);
    
    for (let i = 0; i < burstCount; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;
      
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI;
      const speed = Math.random() * 0.5 + 0.2;
      velocities[i3] = Math.cos(angle) * Math.cos(elevation) * speed;
      velocities[i3 + 1] = Math.sin(elevation) * speed + 0.1;
      velocities[i3 + 2] = Math.sin(angle) * Math.cos(elevation) * speed;
      
      // Golden color for level up
      colors[i3] = 0.92 + Math.random() * 0.08;
      colors[i3 + 1] = 0.70 + Math.random() * 0.2;
      colors[i3 + 2] = 0.03;
      
      sizes[i] = Math.random() * 8 + 4;
    }
    
    return { positions, velocities, colors, sizes };
  }, []);

  // Track XP burst
  const prevXpBurst = useRef(xpBurst);
  useEffect(() => {
    if (xpBurst > prevXpBurst.current) {
      setBurstActive(true);
      setTimeout(() => setBurstActive(false), 1000);
    }
    prevXpBurst.current = xpBurst;
  }, [xpBurst]);

  // Track level up
  useEffect(() => {
    if (levelUp) {
      setLevelUpActive(true);
      setTimeout(() => setLevelUpActive(false), 2000);
    }
  }, [levelUp]);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] += particles.velocities[i3];
      positions[i3 + 1] += particles.velocities[i3 + 1];
      positions[i3 + 2] += particles.velocities[i3 + 2];
      
      // Wrap around
      if (positions[i3] > 10) positions[i3] = -10;
      if (positions[i3] < -10) positions[i3] = 10;
      if (positions[i3 + 1] > 10) positions[i3 + 1] = -10;
      if (positions[i3 + 1] < -10) positions[i3 + 1] = 10;
      if (positions[i3 + 2] > 5) positions[i3 + 2] = -5;
      if (positions[i3 + 2] < -5) positions[i3 + 2] = 5;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y += delta * 0.02;

    // Animate burst particles
    if (burstRef.current && burstActive) {
      const burstPos = burstRef.current.geometry.attributes.position.array as Float32Array;
      const burstSizes = burstRef.current.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < 50; i++) {
        const i3 = i * 3;
        burstPos[i3] += burstParticles.velocities[i3];
        burstPos[i3 + 1] += burstParticles.velocities[i3 + 1];
        burstPos[i3 + 2] += burstParticles.velocities[i3 + 2];
        burstSizes[i] *= 0.96;
      }
      
      burstRef.current.geometry.attributes.position.needsUpdate = true;
      burstRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Background particles */}
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={particles.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={count}
            array={particles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={2}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* XP burst particles */}
      {burstActive && (
        <points ref={burstRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={50}
              array={new Float32Array(burstParticles.positions)}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={50}
              array={burstParticles.colors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={50}
              array={new Float32Array(burstParticles.sizes)}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={4}
            vertexColors
            transparent
            opacity={0.8}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Level up explosion */}
      {levelUpActive && (
        <LevelUpExplosion particles={levelUpParticles} />
      )}
    </>
  );
};

const LevelUpExplosion = ({ particles }: { particles: ReturnType<typeof useMemo> }) => {
  const mesh = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    
    timeRef.current += delta;
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    const sizes = mesh.current.geometry.attributes.size.array as Float32Array;
    
    for (let i = 0; i < 150; i++) {
      const i3 = i * 3;
      positions[i3] += (particles as any).velocities[i3] * (1 - timeRef.current * 0.3);
      positions[i3 + 1] += (particles as any).velocities[i3 + 1] * (1 - timeRef.current * 0.3);
      positions[i3 + 2] += (particles as any).velocities[i3 + 2] * (1 - timeRef.current * 0.3);
      sizes[i] *= 0.98;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={150}
          array={new Float32Array((particles as any).positions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={150}
          array={(particles as any).colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={150}
          array={new Float32Array((particles as any).sizes)}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={6}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

interface ParticleBackgroundProps {
  xpGainTrigger: number;
  levelUpTrigger: boolean;
  accentColor?: string;
}

export const ParticleBackground = ({ 
  xpGainTrigger, 
  levelUpTrigger,
  accentColor = 'purple'
}: ParticleBackgroundProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Particles 
          count={200} 
          xpBurst={xpGainTrigger} 
          levelUp={levelUpTrigger}
          accentColor={accentColor}
        />
      </Canvas>
    </div>
  );
};
