"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Float, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Instanced "Market City" — an animated candlestick/bar terrain      */
/* ------------------------------------------------------------------ */

const GRID = 22; // 22 x 22 city

function BarCity() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Precompute per-bar properties: position, base height, phase, color tier
  const bars = useMemo(() => {
    const arr: {
      x: number;
      z: number;
      base: number;
      phase: number;
      speed: number;
      color: THREE.Color;
    }[] = [];
    const half = (GRID - 1) / 2;
    const cGold = new THREE.Color("#f59e0b");
    const cEmerald = new THREE.Color("#10b981");
    const cRose = new THREE.Color("#f43f5e");
    const cViolet = new THREE.Color("#8b5cf6");

    for (let ix = 0; ix < GRID; ix++) {
      for (let iz = 0; iz < GRID; iz++) {
        const x = (ix - half) * 0.62;
        const z = (iz - half) * 0.62;
        // radial falloff so the city rises toward center — like a market heatmap
        const d = Math.sqrt((ix - half) ** 2 + (iz - half) ** 2) / half;
        const noise = Math.abs(Math.sin(ix * 12.9898 + iz * 78.233) * 43758.5453) % 1;
        const base = Math.max(0.08, (1 - d) * (1.1 + noise * 1.6) + noise * 0.22);
        const phase = noise * Math.PI * 2;
        const speed = 0.4 + noise * 0.8;

        // color tiers: center = gold (hot), some emerald/rose clusters, edge violet dim
        let color: THREE.Color;
        const roll = noise;
        if (d < 0.35) color = cGold.clone();
        else if (roll > 0.72) color = cEmerald.clone();
        else if (roll > 0.5) color = cRose.clone().multiplyScalar(0.85);
        else color = cViolet.clone().multiplyScalar(0.8);

        arr.push({ x, z, base, phase, speed, color });
      }
    }
    return arr;
  }, []);

  const colorAttr = useMemo(() => {
    const colors = new Float32Array(bars.length * 3);
    bars.forEach((b, i) => {
      colors[i * 3] = b.color.r;
      colors[i * 3 + 1] = b.color.g;
      colors[i * 3 + 2] = b.color.b;
    });
    return colors;
  }, [bars]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mesh = meshRef.current;
    if (!mesh) return;
    bars.forEach((b, i) => {
      const h = b.base * (1 + 0.28 * Math.sin(t * b.speed + b.phase));
      dummy.position.set(b.x, h / 2, b.z);
      dummy.scale.set(0.42, h, 0.42);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, GRID * GRID]} key={GRID * GRID}>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorAttr, 3]} />
      </boxGeometry>
      <meshStandardMaterial
        vertexColors
        metalness={0.55}
        roughness={0.25}
        emissiveIntensity={0.55}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating glass monoliths — abstract "order blocks"                 */
/* ------------------------------------------------------------------ */

function GlassMonoliths() {
  return (
    <group>
      <Float speed={1.6} rotationIntensity={0.6} floatIntensity={1.4}>
        <mesh position={[-5.4, 2.6, -2.2]} rotation={[0.4, 0.6, 0.12]}>
          <icosahedronGeometry args={[1.15, 0]} />
          <meshPhysicalMaterial
            color="#1a1024"
            metalness={0.35}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.08}
            emissive="#8b5cf6"
            emissiveIntensity={0.14}
          />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.8}>
        <mesh position={[5.6, 3.4, -3.4]} rotation={[0.2, -0.5, 0.35]}>
          <octahedronGeometry args={[0.95, 0]} />
          <meshPhysicalMaterial
            color="#241705"
            metalness={0.6}
            roughness={0.15}
            clearcoat={1}
            emissive="#f59e0b"
            emissiveIntensity={0.22}
          />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh position={[4.4, 1.7, 2.6]} rotation={[0.7, 0.2, 0]}>
          <torusGeometry args={[0.62, 0.2, 24, 64]} />
          <meshPhysicalMaterial
            color="#03110c"
            metalness={0.5}
            roughness={0.1}
            clearcoat={1}
            emissive="#10b981"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Camera rig — mouse parallax with buttery lerp                      */
/* ------------------------------------------------------------------ */

function CameraRig({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(({ camera }, delta) => {
    const targetX = pointer.x * 1.6;
    const targetY = 6.4 + pointer.y * 0.9;
    camera.position.x += (targetX - camera.position.x) * Math.min(1, delta * 2.2);
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 2.2);
    camera.lookAt(0, 1.1, 0);
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(performance.now() * 0.00006) * 0.14;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

function Scene() {
  return (
    <>
      <color attach="background" args={["#05070d"]} />
      <fog attach="fog" args={["#05070d", 9, 24]} />

      {/* hand-built lighting rig — no external HDR dependency */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 10, 4]} intensity={1.1} color="#ffe9c4" />
      <pointLight position={[-7, 5, -4]} intensity={38} color="#8b5cf6" distance={20} />
      <pointLight position={[7, 4, 3]} intensity={30} color="#f59e0b" distance={18} />
      <pointLight position={[0, 2.2, 7]} intensity={16} color="#10b981" distance={14} />
      <spotLight
        position={[0, 12, 0]}
        angle={0.6}
        penumbra={0.9}
        intensity={60}
        color="#fff7e6"
        distance={26}
      />

      <CameraRig>
        <BarCity />
        <GlassMonoliths />
      </CameraRig>

      <Sparkles
        count={130}
        scale={[16, 7, 16]}
        position={[0, 3.4, 0]}
        size={2.4}
        speed={0.32}
        color="#fbbf24"
        opacity={0.55}
      />
      <Sparkles
        count={70}
        scale={[14, 5, 14]}
        position={[0, 2.2, 0]}
        size={1.8}
        speed={0.22}
        color="#a78bfa"
        opacity={0.4}
      />

      {/* reflective trading floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[46, 46]} />
        <MeshReflectorMaterial
          blur={[280, 60]}
          resolution={560}
          mixBlur={1}
          mixStrength={14}
          roughness={0.86}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.35}
          color="#070a12"
          metalness={0.55}
          mirror={0.55}
        />
      </mesh>
    </>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 6.4, 12.5], fov: 42, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
