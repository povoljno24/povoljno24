'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '../../../components/LanguageContext';

export default function ImageGallery({ images = [], title }) {
  const { t } = useLanguage();
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
      <div className="h-[200px] flex items-center justify-center text-6xl bg-gray-50 opacity-30">
        📦
      </div>
    );
  }

  return (
    <>
      <div className="relative bg-gray-900 overflow-hidden select-none group/main">
        {/* Main Display Area */}
        <div 
          className="relative w-full h-[450px] cursor-zoom-in overflow-hidden"
          onClick={() => setIsOpen(true)}
          onContextMenu={(e) => e.preventDefault()}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className="absolute inset-0 blur-2xl opacity-40 scale-110 pointer-events-none transition-all duration-700"
            style={{ backgroundImage: `url(${currentImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <Image 
            src={currentImageUrl} 
            alt={title} 
            fill 
            className="object-contain relative z-10 transition-all duration-500 group-hover/main:scale-[1.01] pointer-events-none"
            priority 
            draggable={false}
          />
          
          {/* Protection layer */}
          <div className="absolute inset-0 z-20 bg-transparent" />
          
          {/* Zoom Hint */}
          <div className="absolute inset-0 bg-black/0 group-hover/main:bg-black/10 transition-colors z-30 flex items-center justify-center">
            <div className="bg-white/90 px-4 py-2 rounded-full text-[12px] font-semibold text-gray-800 opacity-0 group-hover/main:opacity-100 transition-opacity transform translate-y-2 group-hover/main:translate-y-0 shadow-sm pointer-events-none">
              {t.zoomImage} 🔍
            </div>
          </div>
        </div>

        {/* Navigation Arrows (Only if multiple images) */}
        {validImages.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover/main:opacity-100 backdrop-blur-sm border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover/main:opacity-100 backdrop-blur-sm border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            
            {/* Page Indicator */}
            <div className="absolute bottom-4 right-4 z-40 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
              {currentIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {validImages.length > 1 && (
        <div className="bg-white p-3 flex gap-2 overflow-x-auto scrollbar-hide border-b border-gray-100">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              onContextMenu={(e) => e.preventDefault()}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${currentIndex === idx ? 'ring-2 ring-[#185FA5] opacity-100 shadow-md' : 'opacity-60 hover:opacity-100'}`}
            >
              <Image src={img} alt={`${title} ${idx}`} fill className="object-cover pointer-events-none" draggable={false} />
              <div className="absolute inset-0 z-10 bg-transparent" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center animate-in fade-in duration-200"
          onContextMenu={(e) => e.preventDefault()}
          onWheel={handleWheel}
        >
          {/* Controls Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[120] bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <button 
                onClick={closeLightbox}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>
              <div className="text-white text-sm font-semibold tracking-wide truncate max-w-[200px] sm:max-w-md">{title}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-1 border border-white/10">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleZoom(-0.5); }}
                  className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
                <div className="w-12 text-center text-white text-[11px] font-bold">{Math.round(scale * 100)}%</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleZoom(0.5); }}
                  className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
              </div>
              <button 
                className="p-2 text-white hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                onClick={closeLightbox}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-[130] w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-[130] w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </>
            )}

            <div 
              className="relative transition-transform duration-200 ease-out flex items-center justify-center w-[90%] h-[80%]"
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
              <div className="absolute inset-0 z-[105] bg-transparent" />
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-6 flex flex-col items-center gap-2">
            <div className="text-white/60 text-[12px] font-medium tracking-widest bg-white/5 px-4 py-1 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {validImages.length}
            </div>
            <div className="text-white/20 text-[10px] hidden sm:block">
              {t.zoomTip}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
