'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function ImageGallery({ images, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  const imageUrl = images[0];

  // Reset zoom when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleZoom = (delta) => {
    setScale(prev => Math.min(Math.max(prev + delta, 1), 5));
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (isOpen) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      handleZoom(delta);
    }
  };

  if (!imageUrl) {
    return (
      <div className="h-[200px] flex items-center justify-center text-6xl bg-gray-50 opacity-30">
        📦
      </div>
    );
  }

  return (
    <>
      <div 
        className="relative w-full h-[400px] bg-gray-900 cursor-zoom-in group overflow-hidden select-none"
        onClick={() => setIsOpen(true)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div 
          className="absolute inset-0 blur-xl opacity-50 scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-contain relative z-10 transition-transform duration-500 group-hover:scale-[1.02] pointer-events-none"
          priority 
          draggable={false}
        />
        <div className="absolute inset-0 z-30 pointer-events-auto bg-transparent" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-40 flex items-center justify-center">
          <div className="bg-white/90 px-4 py-2 rounded-full text-[12px] font-semibold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 shadow-sm pointer-events-none">
            Klikni za puni prikaz 🔍
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200"
          onContextMenu={(e) => e.preventDefault()}
          onWheel={handleWheel}
        >
          {/* Controls Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[120] bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white/80 text-sm font-medium px-4">{title}</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/10">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleZoom(-0.5); }}
                  className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
                  title="Umanji"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
                <div className="w-12 text-center text-white text-xs font-bold">{Math.round(scale * 100)}%</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleZoom(0.5); }}
                  className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
                  title="Uveličaj"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
              </div>
              <button 
                className="p-2 text-white hover:text-red-400 transition-colors"
                onClick={() => setIsOpen(false)}
                title="Zatvori"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          
          {/* Main Image Container */}
          <div 
            ref={containerRef}
            className={`relative w-full h-full flex items-center justify-center overflow-hidden ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            onClick={() => scale === 1 && setIsOpen(false)}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div 
              className="relative transition-transform duration-200 ease-out flex items-center justify-center"
              style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                width: '80%',
                height: '80%'
              }}
            >
              <Image 
                src={imageUrl} 
                alt={title} 
                fill 
                className="object-contain pointer-events-none select-none"
                draggable={false}
                unoptimized // Keep as much detail as possible in the lightbox
              />
              {/* Invisible protection layer */}
              <div className="absolute inset-0 z-[105] bg-transparent" />
            </div>
          </div>

          {/* Hint */}
          <div className="absolute bottom-6 text-white/40 text-[11px] pointer-events-none">
            Koristite točkić miša za zumiranje • Kliknite i prevucite za pomeranje
          </div>
        </div>
      )}
    </>
  );
}
