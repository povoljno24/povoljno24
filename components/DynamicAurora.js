'use client';
import React, { useRef, useMemo, useEffect } from 'react';
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
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Optimized noise for performance
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(h + 0.5);
    vec3 g = a0.xz * x0.x + h.xz * x0.y;
    vec3 g1 = a0.y * x12.x + h.y * x12.y;
    // g.z and g1.x are used for the 2nd and 3rd points
    return 130.0 * dot(m, vec3(g.x, g1.x, g.y));
  }

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.15;
    
    // Aurora Layers
    float n1 = snoise(uv * 2.0 + vec2(time, time * 0.5));
    float n2 = snoise(uv * 3.5 - vec2(time * 0.3, time));
    float n3 = snoise(uv * 1.5 + vec2(time * 0.1, -time * 0.2));
    
    // Color Palette (Povoljno24 Premium)
    vec3 baseColor = vec3(0.02, 0.04, 0.09); // Deep Midnight
    vec3 colorA = vec3(0.09, 0.37, 0.65);    // Povoljno Blue
    vec3 colorB = vec3(0.07, 0.62, 0.46);    // Aurora Emerald
    vec3 colorC = vec3(0.15, 0.25, 0.45);    // Soft Indigo
    
    // Mix layers
    float mixFactor = smoothstep(-1.0, 1.0, n1 + n2 * 0.5);
    vec3 color = mix(baseColor, colorA, mixFactor);
    
    float detailFactor = smoothstep(-0.5, 1.5, n3 + n2);
    color = mix(color, colorC, detailFactor * 0.4);
    
    // Mouse Reactive Glow
    float mouseDist = distance(uv, uMouse);
    float glow = smoothstep(0.6, 0.0, mouseDist);
    color = mix(color, colorB, glow * 0.25);
    
    // Vignette
    float vignette = 1.0 - distance(uv, vec2(0.5)) * 0.8;
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const AuroraSurface = () => {
  const meshRef = useRef();
  const { viewport, size } = useThree();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) }
  }), [size.width, size.height]);

  useFrame((state) => {
    const { clock, mouse } = state;
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
      // Smoothly interpolate mouse position
      const targetX = (mouse.x + 1) / 2;
      const targetY = (mouse.y + 1) / 2;
      meshRef.current.material.uniforms.uMouse.value.x += (targetX - meshRef.current.material.uniforms.uMouse.value.x) * 0.05;
      meshRef.current.material.uniforms.uMouse.value.y += (targetY - meshRef.current.material.uniforms.uMouse.value.y) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export default function DynamicAurora() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-[#02050A]">
      <Canvas 
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 2]} // Performance optimization for high-res screens
        gl={{ antialias: false, stencil: false, depth: false }}
      >
        <AuroraSurface />
      </Canvas>
      
      {/* Premium Texture Overlay: Grain */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />
      
      {/* Atmospheric Blur */}
      <div className="absolute inset-0 pointer-events-none backdrop-blur-[100px] opacity-30" />
    </div>
  );
}
