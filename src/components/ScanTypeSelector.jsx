import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ScanTypeSelector = memo(() => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const rippleContainerRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const lastTapTimeRef = useRef(0);

  // Mobile detection with throttling
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      if (isMobileDevice !== isMobile) {
        setIsMobile(isMobileDevice);
      }
    };

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        cancelAnimationFrame(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = requestAnimationFrame(checkMobile);
    };

    checkMobile();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        cancelAnimationFrame(resizeTimeoutRef.current);
      }
    };
  }, [isMobile]);

  // Optimized navigation handler with tap debouncing
  const handleSelect = useCallback((type) => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 1000) return; // Prevent rapid taps
    lastTapTimeRef.current = now;

    if (type === 'food') navigate('/scan');
    else if (type === 'cosmetics') navigate('/scan-cosmetics');
  }, [navigate]);

  // Ripple effect for buttons (GPU accelerated)
  const createRipple = useCallback((event, color) => {
    if (!rippleContainerRef.current || isMobile) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    const circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.style.backgroundColor = color;
    circle.style.opacity = '0.4';
    circle.style.position = 'absolute';
    circle.style.borderRadius = '50%';
    circle.style.transform = 'scale(0)';
    circle.style.animation = 'ripple 600ms linear';
    circle.style.pointerEvents = 'none';

    button.appendChild(circle);

    setTimeout(() => {
      if (circle.parentNode === button) {
        button.removeChild(circle);
      }
    }, 600);
  }, [isMobile]);

  // Button click handler with optimized effects
  const handleButtonClick = useCallback((type, event) => {
    if (type === 'food') {
      createRipple(event, 'rgba(72, 187, 120, 0.6)');
    } else {
      createRipple(event, 'rgba(236, 72, 153, 0.6)');
    }
    
    // Debounced navigation
    requestAnimationFrame(() => {
      handleSelect(type);
    });
  }, [createRipple, handleSelect]);

  // Memoized button configurations
  const buttonConfigs = useMemo(() => ({
    food: {
      gradient: 'from-green-600 to-lime-500',
      shadow: '0 15px 35px rgba(72,187,120,0.5)',
      rippleColor: 'rgba(72, 187, 120, 0.6)',
      emoji: '🥗🍎🥑'
    },
    cosmetics: {
      gradient: 'from-pink-500 to-rose-400',
      shadow: '0 15px 35px rgba(236,72,153,0.5)',
      rippleColor: 'rgba(236, 72, 153, 0.6)',
      emoji: '💄🧴🪞'
    }
  }), []);

  // Optimized motion values for performance
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }), []);

  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }), []);

  // Button hover states for mobile optimization
  const handleButtonHoverStart = useCallback((type) => {
    if (!isMobile) {
      setHoveredButton(type);
    }
  }, [isMobile]);

  const handleButtonHoverEnd = useCallback(() => {
    if (!isMobile) {
      setHoveredButton(null);
    }
  }, [isMobile]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        willChange: 'opacity',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Static background circles - No animation for performance */}
      <div 
        className="absolute top-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"
        style={{ willChange: 'transform, opacity' }}
      />
      <div 
        className="absolute bottom-0 right-0 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Main Card */}
      <motion.div
        variants={cardVariants}
        className="relative z-10 bg-white/95 backdrop-blur-sm shadow-xl rounded-3xl p-6 sm:p-8 md:p-12 w-full max-w-md flex flex-col items-center"
        style={{
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
        whileHover={!isMobile ? {
          y: -8,
          boxShadow: '0 25px 50px rgba(34, 197, 94, 0.15)',
          transition: { duration: 0.3, ease: "easeOut" }
        } : {}}
      >
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-green-800 mb-3 sm:mb-4 tracking-tight">
          Choose Scan Category
        </h2>

        <p className="text-center text-gray-600 mb-6 sm:mb-10 text-sm sm:text-base leading-relaxed">
          Select what you'd like to scan — tailored experience for you.
        </p>

        <div className="flex flex-col gap-4 sm:gap-6 w-full" ref={rippleContainerRef}>
          {/* Food Button */}
          <motion.button
            onHoverStart={() => handleButtonHoverStart('food')}
            onHoverEnd={handleButtonHoverEnd}
            whileHover={!isMobile ? {
              scale: 1.05,
              boxShadow: buttonConfigs.food.shadow,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.8
              }
            } : {}}
            whileTap={{
              scale: isMobile ? 0.97 : 0.95,
              transition: { duration: 0.1 }
            }}
            onClick={(e) => handleButtonClick('food', e)}
            className={`flex items-center justify-center gap-3 bg-gradient-to-r ${buttonConfigs.food.gradient} 
              text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold shadow-lg 
              relative overflow-hidden active:scale-95 transition-transform duration-150`}
            style={{
              willChange: 'transform, box-shadow',
              transform: 'translateZ(0)',
              WebkitFontSmoothing: 'antialiased'
            }}
            aria-label="Scan food products"
          >
            <span className="text-xl sm:text-2xl">{buttonConfigs.food.emoji}</span>
            <span>Food Products</span>
            {/* Optimized shimmer effect - Only on hover and desktop */}
            {hoveredButton === 'food' && !isMobile && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)'
                }}
              />
            )}
          </motion.button>

          {/* Cosmetics Button */}
          <motion.button
            onHoverStart={() => handleButtonHoverStart('cosmetics')}
            onHoverEnd={handleButtonHoverEnd}
            whileHover={!isMobile ? {
              scale: 1.05,
              boxShadow: buttonConfigs.cosmetics.shadow,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.8
              }
            } : {}}
            whileTap={{
              scale: isMobile ? 0.97 : 0.95,
              transition: { duration: 0.1 }
            }}
            onClick={(e) => handleButtonClick('cosmetics', e)}
            className={`flex items-center justify-center gap-3 bg-gradient-to-r ${buttonConfigs.cosmetics.gradient} 
              text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold shadow-lg 
              relative overflow-hidden active:scale-95 transition-transform duration-150`}
            style={{
              willChange: 'transform, box-shadow',
              transform: 'translateZ(0)',
              WebkitFontSmoothing: 'antialiased'
            }}
            aria-label="Scan cosmetic products"
          >
            <span className="text-xl sm:text-2xl">{buttonConfigs.cosmetics.emoji}</span>
            <span>Cosmetics Products</span>
            {/* Optimized shimmer effect - Only on hover and desktop */}
            {hoveredButton === 'cosmetics' && !isMobile && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)'
                }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* CSS animations - Properly formatted without jsx/global attributes */}
      <style>
        {`
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          
          /* Performance optimizations */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          button {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          /* Reduce motion for users who prefer it */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          /* Mobile optimizations */
          @media (max-width: 768px) {
            .backdrop-blur-sm {
              backdrop-filter: blur(4px);
              -webkit-backdrop-filter: blur(4px);
            }
          }
        `}
      </style>
    </motion.div>
  );
});

ScanTypeSelector.displayName = 'ScanTypeSelector';

export default ScanTypeSelector;