import React, { useRef, useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useMotionValue, 
  useSpring,
  AnimatePresence,
  useAnimationFrame,
  useReducedMotion
} from 'framer-motion';

// ============================================
// FONT STYLES & TYPOGRAPHY SYSTEM (ABOUT US PAGE)
// ============================================

// Google Fonts import
const loadFonts = () => {
  if (typeof window !== 'undefined') {
    // Remove existing font links if any
    const existingLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    existingLinks.forEach(link => link.remove());
    
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
};

// Load fonts on initial render
if (typeof window !== 'undefined') {
  loadFonts();
}

// Typography configuration with new fonts
const TYPOGRAPHY_CONFIG = {
  heading: {
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 800,
    letterSpacing: '-0.02em',
    fontFeatureSettings: '"salt" on, "ss01" on'
  },
  subheading: {
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 600,
    letterSpacing: '-0.01em',
    fontFeatureSettings: '"ss03" on'
  },
  body: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 400,
    lineHeight: 1.7,
    letterSpacing: '-0.01em'
  },
  accent: {
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 500,
    letterSpacing: '0.02em'
  },
  button: {
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 600,
    letterSpacing: '0.01em'
  }
};

// Typography Component
const Typography = React.memo(({ 
  children, 
  variant = "body", 
  className = "",
  style = {},
  as: Component = "div",
  ...props 
}) => {
  const baseStyle = TYPOGRAPHY_CONFIG[variant] || TYPOGRAPHY_CONFIG.body;
  
  return (
    <Component
      className={className}
      style={{
        ...baseStyle,
        ...style,
        fontFeatureSettings: baseStyle.fontFeatureSettings || 'normal',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
      {...props}
    >
      {children}
    </Component>
  );
});

Typography.displayName = 'Typography';

// Typing Animation Component (Updated with new fonts)
const TypingAnimation = React.memo(({ text, speed = 50, className = "", delay = 0, variant = "body" }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    if (isComplete) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isComplete]);

  const typographyStyle = TYPOGRAPHY_CONFIG[variant] || TYPOGRAPHY_CONFIG.body;

  return (
    <div className={`inline-flex items-center ${className}`} style={typographyStyle}>
      <span>{displayedText}</span>
      {!isComplete && (
        <motion.div
          animate={{ 
            opacity: [1, 0, 1],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block w-[2px] h-6 ml-1 bg-gradient-to-b from-green-400 to-emerald-600"
        />
      )}
      {isComplete && (
        <motion.span
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block w-[2px] h-6 ml-1 bg-gradient-to-b from-green-400 to-emerald-600"
        />
      )}
    </div>
  );
});

TypingAnimation.displayName = 'TypingAnimation';

// ============================================
// EXISTING CODE CONTINUES BELOW
// ============================================

// ULTRA OPTIMIZED PREMIUM DEVICE DETECTION HOOK
const usePremiumDeviceDetection = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    touchCapable: false,
    reducedMotion: false,
    highRefreshRate: false,
    lowPowerMode: false,
    dataSaver: false,
    isIOS: false,
    isAndroid: false,
    canHover: true
  });
  
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highRefreshRate = window.matchMedia('(min-resolution: 192dpi)').matches;
      const lowPowerMode = navigator.connection?.saveData || false;
      const dataSaver = navigator.connection?.saveData || false;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      const canHover = window.matchMedia('(hover: hover)').matches;
      
      requestAnimationFrame(() => {
        setDevice({
          isMobile,
          isTablet,
          isDesktop,
          touchCapable,
          reducedMotion,
          highRefreshRate,
          lowPowerMode,
          dataSaver,
          isIOS,
          isAndroid,
          canHover
        });
      });
    };
    
    checkDevice();
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        requestAnimationFrame(checkDevice);
      }, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dataQuery = window.matchMedia('(prefers-reduced-data: reduce)');
    const refreshQuery = window.matchMedia('(min-resolution: 192dpi)');
    const hoverQuery = window.matchMedia('(hover: hover)');
    
    const handleMediaChange = () => requestAnimationFrame(checkDevice);
    
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', handleMediaChange, { passive: true });
    if (dataQuery.addEventListener) dataQuery.addEventListener('change', handleMediaChange, { passive: true });
    if (refreshQuery.addEventListener) refreshQuery.addEventListener('change', handleMediaChange, { passive: true });
    if (hoverQuery.addEventListener) hoverQuery.addEventListener('change', handleMediaChange, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      
      if (motionQuery.removeEventListener) motionQuery.removeEventListener('change', handleMediaChange);
      if (dataQuery.removeEventListener) dataQuery.removeEventListener('change', handleMediaChange);
      if (refreshQuery.removeEventListener) refreshQuery.removeEventListener('change', handleMediaChange);
      if (hoverQuery.removeEventListener) hoverQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);
  
  return device;
};

// ENHANCED SPRING CONFIGURATIONS FOR BUTTERY ANIMATIONS
const PREMIUM_SPRINGS = {
  ultraSmooth: { stiffness: 210, damping: 32, mass: 0.4, restDelta: 0.0001, restSpeed: 0.0001 },
  smooth: { stiffness: 185, damping: 28, mass: 0.5, restDelta: 0.0001, restSpeed: 0.0001 },
  responsive: { stiffness: 165, damping: 25, mass: 0.6, restDelta: 0.001, restSpeed: 0.001 },
  bouncy: { stiffness: 230, damping: 22, mass: 0.4, restDelta: 0.001, restSpeed: 0.001 },
  mobile: { stiffness: 150, damping: 30, mass: 0.7, restDelta: 0.005, restSpeed: 0.005 },
  hover: { stiffness: 400, damping: 25, mass: 0.3, restDelta: 0.0001, restSpeed: 0.0001 }
};

// ENHANCED EASING CURVES FOR SMOOTH ANIMATIONS
const PREMIUM_EASING = {
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeOutCirc: [0, 0.55, 0.45, 1],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeOutQuint: [0.22, 1, 0.36, 1],
  premiumEnter: [0.32, 0.94, 0.6, 1],
  premiumExit: [0.76, 0, 0.24, 1],
  mobileEase: [0.25, 0.46, 0.45, 0.94],
  hoverEase: [0.4, 0, 0.2, 1],
  smoothBounce: [0.68, -0.55, 0.265, 1.55]
};

// THROTTLE UTILITY FUNCTION (FIXED)
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ENHANCED MICROINTERACTION WITH MORE ANIMATIONS
const PremiumMicroInteraction = React.memo(({ type, x, y, color, isMobile, isTablet, reducedMotion }) => {
  if (reducedMotion) return null;
  
  const size = isMobile ? 8 : isTablet ? 10 : 12;
  
  if (type === 'sparkle') {
    return (
      <motion.div
        className="absolute pointer-events-none"
        initial={{ x, y, scale: 0, opacity: 0, rotate: 0 }}
        animate={{
          scale: [0, 1.4, 0],
          opacity: [0, 0.9, 0],
          rotate: [0, 180],
          y: [y, y - (isMobile ? 15 : isTablet ? 25 : 40)]
        }}
        transition={{
          duration: isMobile ? 0.4 : isTablet ? 0.5 : 0.6,
          ease: PREMIUM_EASING.easeOutExpo,
          times: [0, 0.5, 1]
        }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `radial-gradient(circle, ${color}99, ${color}33 70%)`,
          borderRadius: '50%',
          filter: `blur(${isMobile ? '1px' : '1.5px'})`,
          boxShadow: `0 0 ${isMobile ? '8px' : '12px'} ${color}80`,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      />
    );
  }
  
  if (type === 'glow') {
    return (
      <motion.div
        className="absolute pointer-events-none rounded-full"
        initial={{ x: x - size/2, y: y - size/2, scale: 0, opacity: 0.7 }}
        animate={{
          scale: [0, 2.5],
          opacity: [0.7, 0]
        }}
        transition={{
          duration: isMobile ? 0.6 : 0.8,
          ease: PREMIUM_EASING.easeOutCirc
        }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: color,
          filter: `blur(${isMobile ? '3px' : '4px'})`,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      />
    );
  }
  
  if (type === 'pulse') {
    return (
      <motion.div
        className="absolute pointer-events-none rounded-full"
        initial={{ x: x - size/2, y: y - size/2, scale: 0, opacity: 0.6 }}
        animate={{
          scale: [0, 3],
          opacity: [0.6, 0]
        }}
        transition={{
          duration: isMobile ? 0.8 : 1,
          ease: PREMIUM_EASING.easeOutBack,
          repeat: 1,
          repeatType: "reverse"
        }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `conic-gradient(from 0deg, ${color}, ${color}40)`,
          filter: `blur(${isMobile ? '2px' : '3px'})`,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      />
    );
  }
  
  return null;
});

// ENHANCED INTERACTIVE BACKGROUND WITH MORE ANIMATION TYPES
const PremiumInteractiveBackground = React.memo(({ isMobile, isTablet, reducedMotion, dataSaver }) => {
  const [interactions, setInteractions] = useState([]);
  const interactionCount = useMemo(() => 
    dataSaver ? 4 : (isMobile ? 6 : isTablet ? 10 : 15),
    [isMobile, isTablet, dataSaver]
  );
  
  useEffect(() => {
    if (reducedMotion || dataSaver) return;
    
    let frameId;
    let lastTime = 0;
    const updateInterval = isMobile ? 150 : isTablet ? 120 : 100;
    
    const updateInteractions = (currentTime) => {
      if (currentTime - lastTime > updateInterval) {
        if (Math.random() > 0.85 && interactions.length < interactionCount) {
          const types = ['sparkle', 'glow', 'pulse'];
          const colors = [
            '#10B981CC',
            '#34D399CC', 
            '#22C55ECC',
            '#059669CC',
            '#047857CC',
            '#7C3AEDCC'
          ];
          
          const newInteraction = {
            id: Date.now() + Math.random(),
            type: types[Math.floor(Math.random() * types.length)],
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            color: colors[Math.floor(Math.random() * colors.length)]
          };
          
          setInteractions(prev => {
            const newArray = [...prev.slice(-(interactionCount - 1)), newInteraction];
            return newArray;
          });
          
          setTimeout(() => {
            setInteractions(prev => prev.filter(i => i.id !== newInteraction.id));
          }, 2000);
        }
        lastTime = currentTime;
      }
      frameId = requestAnimationFrame(updateInteractions);
    };
    
    frameId = requestAnimationFrame(updateInteractions);
    
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [interactions.length, isMobile, isTablet, reducedMotion, interactionCount, dataSaver]);
  
  if (dataSaver || reducedMotion) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      {interactions.map(interaction => (
        <PremiumMicroInteraction 
          key={interaction.id} 
          {...interaction} 
          isMobile={isMobile}
          isTablet={isTablet}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
});

// ENHANCED PARTICLE BACKGROUND WITH MORE ANIMATIONS
const PremiumParticleBackground = React.memo(({ isMobile, isTablet, reducedMotion, dataSaver }) => {
  const particleCount = useMemo(() => 
    dataSaver ? 0 : (reducedMotion ? 0 : (isMobile ? 25 : isTablet ? 40 : 60)),
    [isMobile, isTablet, reducedMotion, dataSaver]
  );
  
  if (reducedMotion || dataSaver || particleCount === 0) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-48 -left-48 w-96 h-96 rounded-full"
          animate={reducedMotion ? {} : {
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.05, 1]
          }}
          transition={reducedMotion ? {} : {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.1), rgba(34,197,94,0.08), transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform, opacity',
            transform: 'translateZ(0)'
          }}
        />
        <motion.div
          className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full"
          animate={reducedMotion ? {} : {
            opacity: [0.04, 0.08, 0.04],
            scale: [1, 1.04, 1]
          }}
          transition={reducedMotion ? {} : {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          style={{
            background: 'radial-gradient(circle, rgba(253,224,71,0.08), rgba(34,197,94,0.06), transparent 70%)',
            filter: 'blur(70px)',
            willChange: 'transform, opacity',
            transform: 'translateZ(0)'
          }}
        />
      </div>
    );
  }
  
  const particles = useMemo(() => 
    Array.from({ length: particleCount }).map((_, i) => {
      const size = isMobile ? Math.random() * 1.5 + 0.5 : isTablet ? Math.random() * 2 + 1 : Math.random() * 3 + 1.5;
      const colors = [
        'rgba(16, 185, 129, 0.25)',
        'rgba(52, 211, 153, 0.25)',
        'rgba(34, 197, 94, 0.25)',
        'rgba(5, 150, 105, 0.25)'
      ];
      
      return {
        id: i,
        size,
        color: colors[i % 4],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: Math.random() * 6 + 4,
        delay: i * 0.04,
        rotation: Math.random() * 360
      };
    }),
    [particleCount, isMobile, isTablet]
  );
  
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            left: particle.left,
            top: particle.top,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)'
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * (isMobile ? 25 : isTablet ? 35 : 50)],
            y: [0, (Math.random() - 0.5) * (isMobile ? 25 : isTablet ? 35 : 50)],
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.15, 1],
            rotate: [0, particle.rotation]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: PREMIUM_EASING.easeOutCirc,
            delay: particle.delay,
            times: [0, 0.5, 1]
          }}
        />
      ))}
    </div>
  );
});

// ENHANCED SCROLL PROGRESS WITH ANIMATION (FIXED)
const PremiumScrollProgress = React.memo(({ scrollYProgress }) => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left pointer-events-none bg-green-500/20"
      style={{ 
        scaleX: scrollYProgress,
        transform: 'translate3d(0,0,0)',
        willChange: 'transform'
      }}
    >
      <motion.div
        className="h-full w-full"
        animate={{
          backgroundPosition: ['0% 0%', '100% 0%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
          backgroundSize: '400% 100%',
          willChange: 'background-position'
        }}
      />
    </motion.div>
  );
});

// ENHANCED RIPPLE EFFECT WITH MORE ANIMATIONS
const PremiumRippleEffect = React.memo(({ ripples, isMobile, isTablet, reducedMotion }) => {
  if (reducedMotion || ripples.length === 0) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      <AnimatePresence>
        {ripples.slice(-3).map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute pointer-events-none rounded-full"
            initial={{
              scale: 0,
              opacity: 0.9,
              x: ripple.x - 10,
              y: ripple.y - 10,
              width: 20,
              height: 20
            }}
            animate={{
              scale: [0, ripple.size * 2.5, ripple.size * 3],
              opacity: [0.9, 0.4, 0],
              width: [20, 100, 130],
              height: [20, 100, 130],
              x: [ripple.x - 10, ripple.x - 50, ripple.x - 65],
              y: [ripple.y - 10, ripple.y - 50, ripple.y - 65],
              rotate: [0, 45, 90]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.9,
              ease: PREMIUM_EASING.easeOutExpo
            }}
            style={{
              background: `radial-gradient(circle, ${ripple.color}, transparent 70%)`,
              filter: 'blur(8px)',
              mixBlendMode: 'screen',
              transform: 'translate3d(0,0,0)',
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

// ENHANCED TOUCH TRAIL WITH ANIMATIONS
const PremiumTouchTrail = React.memo(({ position, isScrolling, reducedMotion }) => {
  const trailRef = useRef(null);
  
  useEffect(() => {
    if (trailRef.current && !reducedMotion) {
      trailRef.current.style.left = `${position.x - 4}px`;
      trailRef.current.style.top = `${position.y - 4}px`;
    }
  }, [position, reducedMotion]);
  
  if (reducedMotion) return null;
  
  return (
    <motion.div
      ref={trailRef}
      className="absolute pointer-events-none rounded-full z-30"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        width: '8px',
        height: '8px',
        background: 'radial-gradient(circle, rgba(34,197,94,0.5), rgba(16,185,129,0.3))',
        border: '1px solid rgba(34,197,94,0.6)',
        filter: 'blur(0.5px)',
        opacity: isScrolling ? 0.5 : 1,
        boxShadow: '0 0 10px rgba(34,197,94,0.3)',
        transform: 'translate3d(0,0,0)',
        willChange: 'transform, opacity'
      }}
    />
  );
});

// ENHANCED FLOATING ELEMENTS WITH MORE ANIMATIONS
const PremiumFloatingElements = React.memo(({ isMobile, isTablet, reducedMotion, dataSaver }) => {
  const elements = useMemo(() => {
    if (dataSaver || reducedMotion) return [];
    
    const baseElements = [
      { icon: '💚', x: '10%', y: '20%', delay: 0, size: isMobile ? 'text-lg' : 'text-xl' },
      { icon: '🍃', x: '85%', y: '30%', delay: 2, size: isMobile ? 'text-base' : 'text-lg' },
      { icon: '✨', x: '20%', y: '70%', delay: 4, size: isMobile ? 'text-base' : 'text-lg' },
      { icon: '🌱', x: '75%', y: '65%', delay: 6, size: isMobile ? 'text-lg' : 'text-xl' }
    ];
    
    if (!isMobile && !isTablet) {
      baseElements.push(
        { icon: '🍎', x: '40%', y: '15%', delay: 1, size: 'text-base' },
        { icon: '🥑', x: '60%', y: '80%', delay: 3, size: 'text-lg' },
        { icon: '🥦', x: '15%', y: '45%', delay: 5, size: 'text-base' },
        { icon: '🍓', x: '90%', y: '50%', delay: 7, size: 'text-base' }
      );
    }
    
    return baseElements;
  }, [isMobile, isTablet, reducedMotion, dataSaver]);
  
  if (elements.length === 0) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {elements.slice(0, isMobile ? 4 : isTablet ? 6 : 8).map((el, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${el.size} opacity-30`}
          style={{ 
            left: el.x, 
            top: el.y,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)'
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6 + idx,
            repeat: Infinity,
            ease: PREMIUM_EASING.smoothBounce,
            delay: el.delay,
            times: [0, 0.5, 1]
          }}
        >
          {el.icon}
        </motion.div>
      ))}
    </div>
  );
});

// ENHANCED BACKGROUND ORBS WITH ANIMATIONS
const PremiumBackgroundOrbs = React.memo(({ isMobile, isTablet, reducedMotion, dataSaver }) => {
  if (dataSaver) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-gradient-to-br from-green-400/5 via-emerald-400/3 to-teal-300/5 blur-[60px]" />
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        className="absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 lg:w-[30rem] lg:h-[30rem] rounded-full"
        animate={reducedMotion ? {} : {
          opacity: [0.1, 0.18, 0.1],
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360]
        }}
        transition={reducedMotion ? {} : {
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.2), rgba(34,197,94,0.15), transparent 70%)',
          filter: 'blur(80px)',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      />
      
      <motion.div
        className="absolute -right-16 -bottom-16 w-64 h-64 sm:w-80 sm:h-80 lg:w-[25rem] lg:h-[25rem] rounded-full"
        animate={reducedMotion ? {} : {
          opacity: [0.08, 0.16, 0.08],
          scale: [1, 1.08, 1],
          rotate: [0, -180, -360]
        }}
        transition={reducedMotion ? {} : {
          duration: 18,
          repeat: Infinity,
          ease: "linear",
          delay: 0.5
        }}
        style={{
          background: 'radial-gradient(circle, rgba(253,224,71,0.15), rgba(34,197,94,0.1), transparent 70%)',
          filter: 'blur(70px)',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      />
      
      <motion.div
        className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-40 sm:h-40 rounded-full"
        animate={reducedMotion ? {} : {
          opacity: [0.05, 0.1, 0.05],
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, -20, 0]
        }}
        transition={reducedMotion ? {} : {
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.1), rgba(34,197,94,0.05), transparent 70%)',
          filter: 'blur(40px)',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      />
    </div>
  );
});

// ENHANCED CARD COMPONENT WITH ANIMATED HOVER EFFECTS
const PremiumCard = React.memo(({ children, className = '', isMobile, isTablet, reducedMotion, touchCapable, canHover }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  const handleHoverStart = useCallback(() => {
    if (!reducedMotion && canHover) setIsHovered(true);
  }, [reducedMotion, canHover]);
  
  const handleHoverEnd = useCallback(() => {
    if (!reducedMotion && canHover) setIsHovered(false);
  }, [reducedMotion, canHover]);
  
  // Mouse position tracking for parallax effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || reducedMotion || !canHover) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    
    setMousePosition({ x, y });
  }, [reducedMotion, canHover]);
  
  const handleMouseLeave = useCallback(() => {
    setMousePosition({ x: 0, y: 0 });
  }, []);
  
  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/20 bg-gradient-to-br from-white/90 to-white/60 shadow-2xl shadow-green-100/50 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: isMobile ? "50px" : "100px" }}
      transition={{
        duration: reducedMotion ? 0 : 0.6,
        ease: PREMIUM_EASING.premiumEnter
      }}
      whileHover={(!reducedMotion && canHover) ? {
        y: -8,
        scale: 1.02,
        boxShadow: "0 25px 60px rgba(16,185,129,0.2)",
        transition: PREMIUM_SPRINGS.hover
      } : undefined}
      whileTap={touchCapable ? { 
        scale: 0.98,
        transition: PREMIUM_SPRINGS.responsive 
      } : undefined}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => touchCapable && !reducedMotion && setIsHovered(true)}
      onTouchEnd={() => touchCapable && !reducedMotion && setIsHovered(false)}
      style={{
        transform: `translate3d(0,0,0) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
        willChange: 'transform, box-shadow',
        transition: !reducedMotion && canHover ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
      }}
    >
      {/* Animated gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-emerald-50/0"
        animate={isHovered ? {
          background: [
            'linear-gradient(135deg, rgba(16,185,129,0.03) 0%, rgba(52,211,153,0.02) 100%)',
            'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(52,211,153,0.04) 100%)',
            'linear-gradient(135deg, rgba(16,185,129,0.03) 0%, rgba(52,211,153,0.02) 100%)'
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          willChange: 'background',
          transform: 'translateZ(0)'
        }}
      />
      
      {/* Animated border effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 50%, rgba(16,185,129,0.1) 50%, rgba(52,211,153,0.1) 100%)',
          backgroundSize: '200% 100%',
          opacity: 0,
          willChange: 'background-position, opacity',
          transform: 'translateZ(0)'
        }}
        animate={isHovered ? {
          backgroundPosition: ['100% 0', '0% 0'],
          opacity: [0, 0.3, 0]
        } : {}}
        transition={{
          duration: 1.5,
          ease: "linear"
        }}
      />
      
      {/* Floating particles inside card */}
      {isHovered && !reducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: isMobile ? 3 : isTablet ? 5 : 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              initial={{
                scale: 0,
                opacity: 0,
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%'
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.4, 0],
                y: [0, -20, -40]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: "easeOut"
              }}
              style={{
                width: '2px',
                height: '2px',
                background: 'rgba(16, 185, 129, 0.6)',
                filter: 'blur(0.5px)',
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
            />
          ))}
        </div>
      )}
      
      <div className="relative z-10 p-6 sm:p-8">
        {children}
      </div>
    </motion.div>
  );
});

// ENHANCED STAT COMPONENT WITH ANIMATIONS
const PremiumStat = React.memo(({ value, label, color, index, isMobile, reducedMotion }) => {
  const [isHovered, setIsHovered] = useState(false);
  const statRef = useRef(null);
  
  return (
    <motion.div
      ref={statRef}
      className="relative overflow-hidden rounded-xl backdrop-blur-lg bg-white/80 p-4 sm:p-6 shadow-lg shadow-green-100/30"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: reducedMotion ? 0 : 0.5,
        delay: index * 0.1,
        ease: PREMIUM_EASING.premiumEnter
      }}
      whileHover={!reducedMotion ? {
        y: -4,
        scale: 1.05,
        boxShadow: "0 15px 40px rgba(16,185,129,0.25)",
        transition: PREMIUM_SPRINGS.hover
      } : undefined}
      onHoverStart={() => !reducedMotion && setIsHovered(true)}
      onHoverEnd={() => !reducedMotion && setIsHovered(false)}
      style={{
        transform: 'translate3d(0,0,0)',
        willChange: 'transform'
      }}
    >
      {/* Pulsing background effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color}15, transparent 70%)`,
          opacity: 0,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
        animate={isHovered ? {
          scale: [1, 1.2, 1],
          opacity: [0, 0.3, 0]
        } : {}}
        transition={{
          duration: 1.5,
          ease: "easeOut"
        }}
      />
      
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-xl border-2 pointer-events-none"
        style={{
          borderColor: color,
          opacity: 0,
          willChange: 'opacity, border-color',
          transform: 'translateZ(0)'
        }}
        animate={isHovered ? {
          opacity: [0, 0.3, 0],
          borderColor: [color + '00', color + '80', color + '00']
        } : {}}
        transition={{
          duration: 1.2,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className={`font-bold ${isMobile ? 'text-2xl sm:text-3xl' : 'text-4xl'} mb-2`}
        style={{ color }}
        animate={reducedMotion ? {} : {
          scale: [1, 1.08, 1],
          textShadow: isHovered ? [
            `0 0 0px ${color}`,
            `0 0 10px ${color}40`,
            `0 0 0px ${color}`
          ] : []
        }}
        transition={reducedMotion ? {} : {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.3
        }}
      >
        {value}
      </motion.div>
      <div className={`text-gray-600 ${isMobile ? 'text-xs sm:text-sm' : 'text-sm'}`}>
        {label}
      </div>
      
      {/* Particle burst on hover */}
      {isHovered && !reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 40;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  x: `calc(50% + ${Math.cos(angle) * distance}px)`,
                  y: `calc(50% + ${Math.sin(angle) * distance}px)`,
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
                style={{
                  width: '4px',
                  height: '4px',
                  background: color,
                  filter: 'blur(1px)',
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)'
                }}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
});

// CUSTOM ANTIGRAVITY CURSOR
const CustomAntigravityCursor = React.memo(({ mousePosition, isHovering, isMobile, reducedMotion }) => {
  if (isMobile || reducedMotion) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-50 will-change-transform"
      style={{
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`,
      }}
      animate={{
        scale: isHovering ? 1.5 : 1,
        opacity: isHovering ? 0.7 : 0.3,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28
      }}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-green-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '24px',
            height: '24px',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        <motion.div
          className="absolute rounded-full bg-green-500"
          animate={{
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '6px',
            height: '6px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        <motion.div
          className="absolute rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '40px',
            height: '40px',
            left: '50%',
            top: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.4), transparent 70%)',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(8px)'
          }}
        />
      </div>
    </motion.div>
  );
});

// ENHANCED HOVER EFFECT COMPONENT
const AntigravityHoverEffect = React.memo(({ children, intensity = 1, isMobile, reducedMotion }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  const handleMouseMove = useCallback(throttle((e) => {
    if (isMobile || reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * intensity * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * intensity * 20;
    setMousePosition({ x, y });
  }, 16), [isMobile, reducedMotion, intensity]);

  return (
    <motion.div
      ref={ref}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      animate={{
        rotateY: isHovered ? mousePosition.x : 0,
        rotateX: isHovered ? -mousePosition.y : 0,
        scale: isHovered ? 1.02 : 1,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 30,
          mass: 0.5
        }
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {children}
      
      {isHovered && !isMobile && !reducedMotion && (
        <>
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{
              background: `radial-gradient(600px circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(16,185,129,0.1), transparent 50%)`,
            }}
            transition={{ duration: 0.3 }}
          />
          
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </>
      )}
    </motion.div>
  );
});

// MAIN ABOUT US COMPONENT WITH FIXED SCROLLING
const AboutUs = () => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const lastUpdate = useRef(0);
  
  const [ripples, setRipples] = useState([]);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  const device = usePremiumDeviceDetection();
  const { isMobile, isTablet, isDesktop, touchCapable, reducedMotion, highRefreshRate, dataSaver, canHover } = device;
  
  // FIXED: useScroll without target parameter for window scroll
  const { scrollYProgress } = useScroll();
  
  const scrollY = useMotionValue(0);
  const scrollVelocityY = useMotionValue(0);
  
  // Simplified animation frame
  useAnimationFrame(() => {
    const currentTime = performance.now();
    
    if (currentTime - lastUpdate.current < 16) return;
    
    const currentY = window.scrollY;
    const prevY = scrollY.get();
    const velocity = currentY - prevY;
    
    if (Math.abs(velocity) > 0.1 || Math.abs(currentY - prevY) > 1) {
      scrollY.set(currentY);
      scrollVelocityY.set(velocity);
      
      setScrollVelocity(Math.abs(velocity));
      setIsScrolling(Math.abs(velocity) > 0.5);
    }
    
    lastUpdate.current = currentTime;
  });
  
  // Enhanced scroll-based animations
  const heroY = useTransform(
    scrollY,
    [0, 500],
    [0, isMobile ? -15 : -30]
  );
  
  const heroOpacity = useTransform(
    scrollY,
    [0, 300],
    [1, isMobile ? 0.97 : 0.95]
  );
  
  const heroScale = useTransform(
    scrollY,
    [0, 500],
    [1, isMobile ? 0.995 : 0.99]
  );
  
  const parallaxY = useTransform(
    scrollY,
    [0, 1000],
    [0, -60]
  );
  
  const currentSpring = isMobile ? PREMIUM_SPRINGS.mobile : 
                       isTablet ? PREMIUM_SPRINGS.responsive : 
                       PREMIUM_SPRINGS.ultraSmooth;
  
  const heroYSpring = useSpring(heroY, currentSpring);
  const heroScaleSpring = useSpring(heroScale, currentSpring);
  const parallaxYSpring = useSpring(parallaxY, PREMIUM_SPRINGS.smooth);
  
  // Enhanced mouse tracking with animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    if (isMobile || reducedMotion || touchCapable) return;
    
    let animationId;
    let rafId;
    let lastX = 0;
    let lastY = 0;
    
    const updateMousePosition = () => {
      const currentX = mouseX.get();
      const currentY = mouseY.get();
      
      if (Math.abs(currentX - lastX) > 0.001 || Math.abs(currentY - lastY) > 0.001) {
        mouseX.set(currentX + (lastX - currentX) * 0.15);
        mouseY.set(currentY + (lastY - currentY) * 0.15);
      }
      
      rafId = requestAnimationFrame(updateMousePosition);
    };
    
    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      if (!animationId) {
        animationId = requestAnimationFrame(() => {
          lastX = (e.clientX - rect.left) / rect.width - 0.5;
          lastY = (e.clientY - rect.top) / rect.height - 0.5;
          setMousePosition({
            x: e.clientX,
            y: e.clientY
          });
          animationId = null;
        });
      }
    };
    
    rafId = requestAnimationFrame(updateMousePosition);
    
    const node = containerRef.current;
    if (node) {
      node.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (animationId) cancelAnimationFrame(animationId);
      if (node) {
        node.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isMobile, reducedMotion, touchCapable, mouseX, mouseY]);
  
  // Enhanced 3D effects
  const rotateY = useTransform(
    mouseX, 
    [-0.5, 0.5], 
    (isMobile || reducedMotion || touchCapable) ? [0, 0] : [6, -6]
  );
  const rotateX = useTransform(
    mouseY, 
    [-0.5, 0.5], 
    (isMobile || reducedMotion || touchCapable) ? [0, 0] : [-4, 4]
  );
  
  const rotateYSpring = useSpring(rotateY, PREMIUM_SPRINGS.smooth);
  const rotateXSpring = useSpring(rotateX, PREMIUM_SPRINGS.smooth);
  
  // Enhanced ripple effect with cooldown
  const rippleCooldownRef = useRef(false);
  const rippleTimeoutRef = useRef(null);
  
  const handleInteraction = useCallback((e) => {
    if (rippleCooldownRef.current || reducedMotion || dataSaver) return;
    
    rippleCooldownRef.current = true;
    
    if (rippleTimeoutRef.current) {
      clearTimeout(rippleTimeoutRef.current);
    }
    
    rippleTimeoutRef.current = setTimeout(() => {
      rippleCooldownRef.current = false;
    }, isMobile ? 250 : 180);
    
    if (
      e.target.closest('button') ||
      e.target.closest('a') ||
      e.target.closest('input') ||
      e.target.closest('textarea') ||
      e.target.closest('select') ||
      e.target.closest('[data-no-ripple]')
    ) {
      return;
    }
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX || e.touches?.[0]?.clientX || e.changedTouches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY || e.changedTouches?.[0]?.clientY) - rect.top;
    
    if (!x || !y) return;
    
    const colors = [
      'rgba(16, 185, 129, 0.8)',
      'rgba(52, 211, 153, 0.8)',
      'rgba(34, 197, 94, 0.8)'
    ];
    
    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: isMobile ? 0.7 : isTablet ? 0.85 : 1
    };
    
    setRipples(prev => {
      const newArray = [...prev.slice(-2), newRipple];
      return newArray;
    });
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 900);
  }, [isMobile, isTablet, reducedMotion, dataSaver]);
  
  // Enhanced movement tracking
  const handleMove = useCallback((e) => {
    if (reducedMotion) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    if (x && y) {
      requestAnimationFrame(() => {
        setTouchPosition({ x, y });
      });
    }
  }, [reducedMotion]);

  // Hover detection for interactive elements
  useEffect(() => {
    const handleElementHover = (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.hover-effect')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    
    if (!isMobile) {
      const throttledHover = throttle(handleElementHover, 16);
      document.addEventListener('mouseover', throttledHover, { passive: true });
      return () => document.removeEventListener('mouseover', throttledHover);
    }
  }, [isMobile]);

  // Enhanced scroll interaction
  useEffect(() => {
    let scrollTimeout;
    
    const handleScroll = () => {
      setIsScrolling(true);
      
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  // Data sections with enhanced animations
  const sections = useMemo(() => [
    { 
      title: "Our Mission", 
      content: "To empower everyone to eat smarter, live better, and understand food in a way that promotes lifelong wellness." 
    },
    { 
      title: "Why Choose Us", 
      content: (
        <div className="space-y-3">
          {[
            { icon: "⚡", text: "Instant product scanning and nutrition analysis" },
            { icon: "🤖", text: "AI-based health recommendations" },
            { icon: "🔒", text: "100% privacy-focused — no data sharing" },
            { icon: "📊", text: "Trusted data and ingredient breakdown" },
            { icon: "🎯", text: "Minimal design, easy to use interface" }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              className="flex items-start gap-3 group"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ 
                delay: idx * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 25
              }}
              whileHover={!reducedMotion ? {
                x: 5,
                transition: PREMIUM_SPRINGS.hover
              } : undefined}
            >
              <motion.span 
                className="text-green-500 text-lg"
                animate={!reducedMotion ? {
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: idx * 0.5
                }}
                whileHover={!reducedMotion ? {
                  rotate: 360,
                  scale: 1.3,
                  transition: { duration: 0.5, ease: "easeInOut" }
                } : {}}
              >
                {item.icon}
              </motion.span>
              <span className="text-gray-600 flex-1">
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>
      )
    },
    { 
      title: "Our Vision", 
      content: "To build a world where food transparency is universal, and every individual can make healthy decisions with confidence." 
    },
    { 
      title: "Food Scan", 
      content: "Instantly scan packaged food items to reveal their nutritional value, additives, and health impact. PureScan helps you avoid harmful ingredients and choose better alternatives — all in one tap." 
    },
    { 
      title: "Cosmetics Scan", 
      content: "Decode cosmetic product labels and ingredients to understand their safety, skin impact, and allergen risks. PureScan ensures you're informed before you apply." 
    }
  ], [reducedMotion]);
  
  const stats = useMemo(() => [
    { value: "50K+", label: "Health Enthusiasts", color: "#10B981" },
    { value: "10K+", label: "Products Scanned", color: "#059669" },
    { value: "4.9★", label: "Average Rating", color: "#047857" },
    { value: "100%", label: "Privacy Guarantee", color: "#7C3AED" }
  ], []);
  
  // Mouse trail effect for hero section
  const heroTrailRef = useRef(null);
  
  useEffect(() => {
    if (!heroTrailRef.current || reducedMotion || isMobile || touchCapable) return;
    
    heroTrailRef.current.style.left = `${mousePosition.x}px`;
    heroTrailRef.current.style.top = `${mousePosition.y}px`;
  }, [mousePosition, reducedMotion, isMobile, touchCapable]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchMove={handleMove}
      onMouseMove={!isMobile ? handleMove : undefined}
      className="relative w-full flex flex-col bg-gradient-to-b from-white via-green-50/90 to-emerald-50/70 cursor-default"
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        transform: 'translate3d(0,0,0)',
        position: 'relative',
        minHeight: '100vh'
      }}
      data-performance-optimized="true"
      data-reduced-motion={reducedMotion}
      data-device-type={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}
    >
      {/* Enhanced Scroll Progress */}
      <PremiumScrollProgress scrollYProgress={scrollYProgress} />
      
      {/* Enhanced Background Effects */}
      <Suspense fallback={null}>
        <PremiumInteractiveBackground 
          isMobile={isMobile}
          isTablet={isTablet}
          reducedMotion={reducedMotion}
          dataSaver={dataSaver}
        />
        <PremiumParticleBackground 
          isMobile={isMobile}
          isTablet={isTablet}
          reducedMotion={reducedMotion}
          dataSaver={dataSaver}
        />
      </Suspense>
      
      {/* Enhanced Background Orbs */}
      <PremiumBackgroundOrbs 
        isMobile={isMobile}
        isTablet={isTablet}
        reducedMotion={reducedMotion}
        dataSaver={dataSaver}
      />
      
      {/* Enhanced Floating Elements */}
      <PremiumFloatingElements 
        isMobile={isMobile}
        isTablet={isTablet}
        reducedMotion={reducedMotion}
        dataSaver={dataSaver}
      />
      
      {/* Custom Cursor */}
      {!reducedMotion && !isMobile && !touchCapable && (
        <CustomAntigravityCursor 
          mousePosition={mousePosition} 
          isHovering={isHovering}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
        />
      )}
      
      {/* Mouse trail for hero section */}
      {!reducedMotion && !isMobile && !touchCapable && (
        <div
          ref={heroTrailRef}
          className="fixed pointer-events-none rounded-full z-20 transition-all duration-200 ease-out"
          style={{
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
            filter: 'blur(20px)',
            opacity: 0.5,
            transform: 'translate3d(-50%, -50%, 0)',
            willChange: 'left, top'
          }}
        />
      )}
      
      {/* Enhanced Interactive Effects */}
      <PremiumRippleEffect 
        ripples={ripples}
        isMobile={isMobile}
        isTablet={isTablet}
        reducedMotion={reducedMotion}
      />
      
      <PremiumTouchTrail 
        position={touchPosition}
        isScrolling={isScrolling}
        reducedMotion={reducedMotion}
      />
      
      {/* Main Content Container */}
      <div 
        ref={contentRef}
        className="relative z-10 flex-grow w-full"
      >
        <motion.div
          style={{ 
            scale: heroScaleSpring,
            opacity: heroOpacity
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: reducedMotion ? 0 : 0.8,
            ease: PREMIUM_EASING.premiumEnter
          }}
          className="text-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 xl:px-12 w-full max-w-full"
        >
          {/* Enhanced Hero Section with AntigravityHoverEffect */}
          <motion.section
            style={{ 
              y: heroYSpring,
              rotateY: rotateYSpring,
              rotateX: rotateXSpring
            }}
            className="max-w-4xl mx-auto mb-12 sm:mb-16 relative"
          >
            <AntigravityHoverEffect intensity={1.2} isMobile={isMobile} reducedMotion={reducedMotion}>
              <motion.div
                className="text-center"
                whileHover={(!reducedMotion && canHover) ? { 
                  scale: 1.01,
                  transition: PREMIUM_SPRINGS.hover
                } : undefined}
              >
                <motion.h1
                  animate={reducedMotion || dataSaver ? {} : {
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={reducedMotion || dataSaver ? {} : {
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className={`font-bold tracking-tight ${isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl'} mb-6`}
                  style={TYPOGRAPHY_CONFIG.heading}
                  style={{
                    ...TYPOGRAPHY_CONFIG.heading,
                    background: dataSaver ? '#10B981' : 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                    backgroundSize: dataSaver ? 'auto' : '400% 400%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    willChange: reducedMotion ? 'auto' : 'background-position'
                  }}
                  whileHover={!reducedMotion && canHover ? {
                    scale: 1.02,
                    transition: { duration: 0.3, ease: "easeInOut" }
                  } : {}}
                >
                  <TypingAnimation text="About Us" speed={70} variant="heading" className="block" />
                </motion.h1>
                
                <motion.div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-8 h-1"
                  initial={{ width: 0 }}
                  animate={{ width: "200px" }}
                  transition={{ 
                    duration: reducedMotion ? 0 : 1.5, 
                    delay: 0.5,
                    ease: PREMIUM_EASING.easeOutQuint
                  }}
                  whileHover={!reducedMotion && canHover ? {
                    scaleX: 1.2,
                    transition: { duration: 0.3 }
                  } : {}}
                />
                
                <Typography 
                  variant="body" 
                  className={`max-w-3xl mx-auto leading-relaxed ${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'}`}
                >
                  <span>
                    <TypingAnimation 
                      text="PureScan is built to help people make better food choices." 
                      speed={30} 
                      variant="body"
                    />
                  </span>
                  <motion.span 
                    className="block mt-3 text-green-600 font-semibold"
                    style={TYPOGRAPHY_CONFIG.accent}
                    animate={!reducedMotion ? {
                      scale: [1, 1.02, 1]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    whileHover={!reducedMotion && canHover ? {
                      color: "#059669",
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    } : {}}
                  >
                    <TypingAnimation 
                      text="Your health companion in every scan." 
                      speed={40} 
                      delay={1500}
                      variant="accent"
                    />
                  </motion.span>
                </Typography>
              </motion.div>
            </AntigravityHoverEffect>
          </motion.section>
          
          {/* Enhanced Introductory Cards */}
          <div className="max-w-4xl mx-auto mb-12">
            {[
              "PureScan is built to help people make better food choices. It scans food items, evaluates their nutritional quality, and helps users stay aware of what they consume daily.",
              "Our goal is to simplify food awareness using modern technology and science-backed nutrition data — so that choosing healthy products becomes effortless."
            ].map((text, idx) => (
              <PremiumCard 
                key={idx}
                isMobile={isMobile}
                isTablet={isTablet}
                reducedMotion={reducedMotion}
                touchCapable={touchCapable}
                canHover={canHover}
                className="mb-6"
              >
                <Typography variant="body" className="text-gray-600 leading-relaxed text-center">
                  <TypingAnimation text={text} speed={30} delay={idx * 500} variant="body" />
                </Typography>
              </PremiumCard>
            ))}
          </div>
          
          {/* Enhanced Main Content Sections */}
          <div className="max-w-4xl mx-auto mb-12">
            {sections.map((section, idx) => (
              <PremiumCard 
                key={idx}
                isMobile={isMobile}
                isTablet={isTablet}
                reducedMotion={reducedMotion}
                touchCapable={touchCapable}
                canHover={canHover}
                className="mb-8"
              >
                <motion.h2 
                  className="font-bold text-green-800 text-center mb-6 text-xl sm:text-2xl"
                  style={TYPOGRAPHY_CONFIG.subheading}
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  whileHover={!reducedMotion && canHover ? {
                    color: "#059669",
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  } : {}}
                >
                  <TypingAnimation text={section.title} speed={40} delay={idx * 100} variant="subheading" />
                </motion.h2>
                
                <div className="text-gray-600 leading-relaxed">
                  {typeof section.content === "string" ? (
                    <div className="text-center">
                      <TypingAnimation text={section.content} speed={30} delay={idx * 150} variant="body" />
                    </div>
                  ) : (
                    section.content
                  )}
                </div>
              </PremiumCard>
            ))}
          </div>
          
          {/* Enhanced Stats Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 25
              }}
              className={`font-bold text-green-700 mb-8 text-center ${isMobile ? 'text-xl' : 'text-2xl'}`}
              style={TYPOGRAPHY_CONFIG.subheading}
              whileHover={!reducedMotion && canHover ? {
                scale: 1.05,
                color: "#047857",
                transition: { duration: 0.3 }
              } : {}}
            >
              <TypingAnimation text="Our Impact" speed={40} variant="subheading" />
            </motion.h3>
            
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'} text-center`}>
              {stats.map((stat, idx) => (
                <PremiumStat 
                  key={idx}
                  value={stat.value}
                  label={stat.label}
                  color={stat.color}
                  index={idx}
                  isMobile={isMobile}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </div>
          
          {/* Enhanced Closing Section */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "100px" }}
            transition={{ 
              duration: reducedMotion ? 0 : 0.8,
              ease: PREMIUM_EASING.premiumEnter
            }}
            className="max-w-3xl mx-auto"
          >
            <PremiumCard 
              isMobile={isMobile}
              isTablet={isTablet}
              reducedMotion={reducedMotion}
              touchCapable={touchCapable}
              canHover={canHover}
              className="text-center"
            >
              <Typography variant="subheading" className="text-green-800 text-center mb-4 text-xl sm:text-2xl font-bold">
                <TypingAnimation text="Join Our Health Revolution" speed={40} variant="subheading" />
              </Typography>
              <Typography variant="body" className="text-gray-600 leading-relaxed mb-6">
                <TypingAnimation 
                  text="Be part of a growing community that values health, transparency, and smart choices. Start your journey towards better eating habits today." 
                  speed={30} 
                  delay={500}
                  variant="body"
                />
              </Typography>
              <motion.div
                whileHover={!reducedMotion ? { 
                  scale: 1.05,
                  transition: PREMIUM_SPRINGS.hover
                } : undefined}
                whileTap={touchCapable ? { scale: 0.95 } : undefined}
                className="inline-block"
              >
                <motion.a
                  href="/"
                  className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold overflow-hidden px-6 py-3 shadow-lg sm:px-8 sm:py-4"
                  style={TYPOGRAPHY_CONFIG.button}
                  data-no-ripple="true"
                  whileHover={!reducedMotion ? {
                    scale: 1.1,
                    boxShadow: "0 10px 40px rgba(16,185,129,0.5)",
                    transition: { duration: 0.3 }
                  } : {}}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{
                      duration: 0.6,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.span
                    animate={!reducedMotion ? { rotate: [0, 360] } : {}}
                    transition={reducedMotion ? {} : { 
                      duration: 20, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                    className="text-xl relative z-10"
                  >
                    ✨
                  </motion.span>
                  <motion.span 
                    className="relative z-10 text-base sm:text-lg"
                    style={TYPOGRAPHY_CONFIG.button}
                    whileHover={!reducedMotion ? {
                      scale: 1.1,
                      transition: { duration: 0.2 }
                    } : {}}
                  >
                    <TypingAnimation text="Back to Home" speed={30} delay={200} variant="button" />
                  </motion.span>
                  
                  {/* Particle effect on hover */}
                  {!reducedMotion && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full"
                          initial={{
                            x: '50%',
                            y: '50%',
                            scale: 0,
                            opacity: 0
                          }}
                          whileHover={{
                            x: `calc(50% + ${Math.cos((i / 12) * Math.PI * 2) * 100}px)`,
                            y: `calc(50% + ${Math.sin((i / 12) * Math.PI * 2) * 100}px)`,
                            scale: [0, 1, 0],
                            opacity: [0, 0.8, 0]
                          }}
                          transition={{
                            duration: 0.8,
                            delay: i * 0.05,
                            ease: "easeOut"
                          }}
                          style={{
                            width: '4px',
                            height: '4px',
                            background: 'rgba(255,255,255,0.8)',
                            filter: 'blur(1px)',
                            willChange: 'transform, opacity',
                            transform: 'translateZ(0)'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.a>
              </motion.div>
            </PremiumCard>
          </motion.div>
          
          {/* Spacing */}
          <div className="h-16 sm:h-20" />
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;