'use client';
import React from 'react';

export default function CSSAurora() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-[#02050A] pointer-events-none">
      {/* Aurora Blends */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vh] rounded-full bg-[#185FA5] opacity-[0.12] blur-[120px] animate-aurora-first" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vh] rounded-full bg-[#1D9E75] opacity-[0.08] blur-[120px] animate-aurora-second" />
      
      {/* Ambient center accent */}
      <div className="absolute top-[30%] left-[20%] w-[50vw] h-[50vh] rounded-full bg-[#185FA5] opacity-[0.05] blur-[150px] animate-aurora-third" />

      {/* Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[#000]" style={{ filter: 'url(#noiseFilterCSS)' }} />
      
      {/* SVG noise */}
      <svg className="hidden">
        <filter id="noiseFilterCSS">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </svg>
    </div>
  );
}
