'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '../../../components/LanguageContext';

export default function ImageGallery({ images = [], title, t }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(0);
  const containerRef = useRef(null);
  
  // Filter out any null/undefined images
  const validImages = images.filter(Boolean);
  const currentImageUrl = validImages[currentIndex];

  const closeLightbox = () => {
    setIsOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoom = (delta) => {
    setScale(prev => Math.min(Math.max(prev + delta, 1), 5));
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
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

  const onTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) { // Threshold for swipe
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  if (validImages.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-6xl bg-[#050505] border-b border-white/5 relative group">
         <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
         <span className="opacity-10 scale-150 grayscale">📦</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative bg-[#050505] overflow-hidden select-none group/main border-b border-white/5">
        {/* Main Display Area */}
        <div 
          className="relative w-full h-[550px] cursor-zoom-in overflow-hidden"
          onClick={() => setIsOpen(true)}
          onContextMenu={(e) => e.preventDefault()}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className="absolute inset-0 blur-3xl opacity-20 scale-125 pointer-events-none transition-all duration-1000"
            style={{ backgroundImage: `url(${currentImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <Image 
            src={currentImageUrl} 
            alt={title} 
            fill 
            className="object-contain relative z-10 transition-all duration-700 group-hover/main:scale-[1.02] pointer-events-none"
            priority 
            draggable={false}
          />
          
          {/* Protection layer */}
          <div className="absolute inset-0 z-20 bg-transparent" />
          
          {/* Zoom Hint */}
          <div className="absolute inset-0 bg-black/0 group-hover/main:bg-black/20 transition-all duration-500 z-30 flex items-center justify-center">
            <div className="bg-white text-black px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.3em] opacity-0 group-hover/main:opacity-100 transition-all transform translate-y-4 group-hover/main:translate-y-0 shadow-[0_20px_40px_rgba(255,255,255,0.1)] pointer-events-none">
              Povećaj 🔍
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-white/5 hover:bg-white text-black flex items-center justify-center transition-all opacity-0 group-hover/main:opacity-100 backdrop-blur-md border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-white/5 hover:bg-white text-black flex items-center justify-center transition-all opacity-0 group-hover/main:opacity-100 backdrop-blur-md border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            
            {/* Page Indicator */}
            <div className="absolute bottom-8 right-8 z-40 px-6 py-2 rounded-full bg-black/60 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.3em] border border-white/10 shadow-2xl">
              {currentIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {validImages.length > 1 && (
        <div className="bg-[#0A0A0A] p-6 flex gap-4 overflow-x-auto no-scrollbar">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              onContextMenu={(e) => e.preventDefault()}
              className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-500 border-2 ${currentIndex === idx ? 'border-white opacity-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105' : 'border-white/5 opacity-30 hover:opacity-100'}`}
            >
              <Image src={img} alt={`${title} ${idx}`} fill className="object-cover pointer-events-none" draggable={false} />
              <div className="absolute inset-0 z-10 bg-transparent" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal: Full Cinematic Black */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-black backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-500"
          onContextMenu={(e) => e.preventDefault()}
          onWheel={handleWheel}
        >
          {/* Controls Bar */}
          <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-[220] bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-6">
              <button 
                onClick={closeLightbox}
                className="p-3 text-white/40 hover:text-white transition-all bg-white/5 rounded-full border border-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>
              <div className="text-white text-[14px] font-black uppercase tracking-widest truncate max-w-[300px]">{title}</div>
            </div>
            <div className="flex items-center gap-6">
              <button 
                className="p-3 text-white/20 hover:text-red-500 transition-all bg-white/5 rounded-full border border-white/10 hover:border-red-500/20"
                onClick={closeLightbox}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          
          {/* Main Image Container */}
          <div 
            ref={containerRef}
            className={`relative w-full h-full flex items-center justify-center overflow-hidden ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            onClick={(e) => scale === 1 && closeLightbox()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Navigation in Lightbox */}
            {validImages.length > 1 && scale === 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-12 top-1/2 -translate-y-1/2 z-[230] w-20 h-20 rounded-full bg-white/5 hover:bg-white text-black flex items-center justify-center transition-all border border-white/5 shadow-2xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-12 top-1/2 -translate-y-1/2 z-[230] w-20 h-20 rounded-full bg-white/5 hover:bg-white text-black flex items-center justify-center transition-all border border-white/5 shadow-2xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </>
            )}

            <div 
              className="relative transition-transform duration-300 ease-out flex items-center justify-center w-[95%] h-[85%]"
              style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
            >
              <Image 
                src={currentImageUrl} 
                alt={title} 
                fill 
                className="object-contain pointer-events-none select-none"
                draggable={false}
                unoptimized 
              />
              <div className="absolute inset-0 z-[205] bg-transparent" />
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-12 flex flex-col items-center gap-6">
            <div className="text-white text-[12px] font-black uppercase tracking-[0.4em] bg-white/5 px-8 py-3 rounded-full backdrop-blur-2xl border border-white/10 shadow-2xl">
              {currentIndex + 1} / {validImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
