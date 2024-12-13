import React, { useRef, useEffect, useState } from 'react';

const AutoScrollContainer = ({ 
  children, 
  className, 
  autoScrollSpeed = 50,
  pauseOnUserInteraction = true 
}) => {
  const scrollRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || isUserScrolling) return;

    let lastTime = 0;
    let animationFrameId;

    const scroll = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const delta = currentTime - lastTime;
      
      if (delta > autoScrollSpeed) {
        container.scrollTop += 1;
        if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
          container.scrollTop = 0;
        }
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isUserScrolling, autoScrollSpeed]);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].pageY);
    if (pauseOnUserInteraction) {
      setIsUserScrolling(true);
    }
  };

  const handleTouchEnd = () => {
    if (pauseOnUserInteraction) {
      setTimeout(() => setIsUserScrolling(false), 1000);
    }
  };

  const handleWheel = () => {
    if (pauseOnUserInteraction) {
      setIsUserScrolling(true);
      clearTimeout(window.scrollTimeout);
      window.scrollTimeout = setTimeout(() => setIsUserScrolling(false), 1000);
    }
  };

  return (
    <div
      ref={scrollRef}
      className={`overflow-y-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </div>
  );
};

export default AutoScrollContainer; 