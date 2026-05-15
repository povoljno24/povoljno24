'use client';
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  // Simple noise function for maximum compatibility
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.1;
    
    // Aurora calculation
    float n1 = noise(uv * 3.0 + t);
    float n2 = noise(uv * 5.0 - t * 0.8);
    
    // Base Colors
    vec3 space = vec3(0.02, 0.03, 0.07);
    vec3 aurora = vec3(0.09, 0.37, 0.65); // Povoljno Blue
    vec3 accent = vec3(0.07, 0.62, 0.46); // Emerald
    
    float mask = smoothstep(0.2, 0.8, n1 + n2 * 0.5);
    vec3 color = mix(space, aurora, mask);
    
    // Mouse Glow
    float dist = distance(uv, uMouse);
    float glow = smoothstep(0.5, 0.0, dist);
    color = mix(color, accent, glow * 0.2);
    
    // Vignette
    color *= (1.0 - distance(uv, vec2(0.5)) * 0.7);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const AuroraSurface = () => {
  const meshRef = useRef();
  const { viewport } = useThree();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
  }), []);

  useFrame((state) => {
    const { clock, mouse } = state;
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
      // Map mouse to UV space [0, 1]
      const targetX = (mouse.x + 1) * 0.5;
      const targetY = (mouse.y + 1) * 0.5;
      meshRef.current.material.uniforms.uMouse.value.x += (targetX - meshRef.current.material.uniforms.uMouse.value.x) * 0.1;
      meshRef.current.material.uniforms.uMouse.value.y += (targetY - meshRef.current.material.uniforms.uMouse.value.y) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default function DynamicAurora() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-[#02050A]">
      <Canvas camera={{ position: [0, 0, 1] }} gl={{ antialias: false }}>
        <AuroraSurface />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      <div className="absolute inset-0 pointer-events-none backdrop-blur-[120px] opacity-20" />
    </div>
  );
}
