import React, { useState, useEffect } from 'react';

const AnimatedProgressBar = ({ initialProgress = 0, targetProgress = 70 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // First render - set to 0
    setProgress(0);

    // Use requestAnimationFrame for smoother animation
    const startAnimation = () => {
      let start = null;
      const duration = 2000; // 2 seconds duration

      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentProgress = easeOutQuart * targetProgress;

        setProgress(currentProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    // Start animation after a brief delay
    const timer = setTimeout(startAnimation, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [targetProgress]);

  return (
    <div className="h-1 bg-[#ebeef7] rounded-full mb-2">
      <div 
        className="h-full bg-[#ea5151] rounded-full relative overflow-hidden"
        style={{ 
          width: `${progress}%`,
          transition: 'none' // Remove transition to allow requestAnimationFrame to handle animation
        }}
      >
        <div 
          className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent 
          animate-shimmer"
        />
      </div>
    </div>
  );
};

export default AnimatedProgressBar; 