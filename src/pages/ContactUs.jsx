import React, { useRef, useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { 
  motion, 
  useMotionValue, 
  animate, 
  useTransform,
  useSpring,
  AnimatePresence,
  useScroll,
  useAnimationFrame,
  useReducedMotion
} from 'framer-motion';
import emailjs from '@emailjs/browser';

// ============================================
// FONT STYLES & TYPOGRAPHY SYSTEM (CONTACT US PAGE)
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

// ============================================
// TYPING ANIMATION COMPONENT (NEW)
// ============================================
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
// EXISTING CODE CONTINUES BELOW (NO OTHER CHANGES)
// ============================================

// PREMIUM DEVICE DETECTION HOOK
const usePremiumDeviceDetection = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    touchCapable: false,
    reducedMotion: false,
    highRefreshRate: false,
    isPortrait: true
  });
  
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highRefreshRate = window.matchMedia('(min-resolution: 192dpi)').matches || 
                             'devicePixelRatio' in window && window.devicePixelRatio > 1.5;
      const isPortrait = height > width;
      
      setDevice({
        isMobile,
        isTablet,
        isDesktop,
        touchCapable,
        reducedMotion,
        highRefreshRate,
        isPortrait
      });
    };
    
    checkDevice();
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkDevice, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', checkDevice);
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => {
      setDevice(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    motionQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkDevice);
      motionQuery.removeEventListener('change', handleMotionChange);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  return device;
};

// ============================================
// PREMIUM SPRING CONFIGURATIONS
// ============================================
const PREMIUM_SPRINGS = {
  ultraSmooth: { stiffness: 200, damping: 35, mass: 0.5, restDelta: 0.0001, restSpeed: 0.0001 },
  smooth: { stiffness: 180, damping: 30, mass: 0.6, restDelta: 0.0001, restSpeed: 0.0001 },
  responsive: { stiffness: 160, damping: 28, mass: 0.7, restDelta: 0.001, restSpeed: 0.001 },
  bouncy: { stiffness: 220, damping: 25, mass: 0.5, restDelta: 0.001, restSpeed: 0.001 },
  mobile: { stiffness: 150, damping: 30, mass: 0.7, restDelta: 0.005, restSpeed: 0.005 },
  hover: { stiffness: 400, damping: 25, mass: 0.3, restDelta: 0.0001, restSpeed: 0.0001 }
};

// ============================================
// PREMIUM EASING CURVES
// ============================================
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

// ============================================
// PREMIUM MICRO INTERACTION COMPONENT
// ============================================
const PremiumMicroInteraction = React.memo(({ type, x, y, color, isMobile, isTablet }) => {
  const size = isMobile ? 8 : isTablet ? 10 : 12;
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    background: `radial-gradient(circle, ${color}99, ${color}33 70%)`,
    borderRadius: '50%',
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: 1000,
    filter: `blur(${isMobile ? '1px' : '1.5px'})`
  };
  
  if (type === 'sparkle') {
    return (
      <motion.div
        className="absolute pointer-events-none"
        initial={{ x, y, scale: 0, opacity: 0, rotate: 0 }}
        animate={{
          scale: [0, 1.5, 0],
          opacity: [0, 0.9, 0],
          rotate: [0, 180],
          y: [y, y - (isMobile ? 15 : isTablet ? 25 : 40)]
        }}
        transition={{
          duration: isMobile ? 0.35 : isTablet ? 0.45 : 0.6,
          ease: PREMIUM_EASING.easeOutExpo,
          times: [0, 0.5, 1]
        }}
        style={style}
      />
    );
  }
  
  if (type === 'glow') {
    return (
      <motion.div
        className="absolute pointer-events-none rounded-full"
        initial={{ x: x - size/2, y: y - size/2, scale: 0, opacity: 0.7 }}
        animate={{
          scale: [0, 2],
          opacity: [0.7, 0]
        }}
        transition={{
          duration: isMobile ? 0.5 : 0.7,
          ease: PREMIUM_EASING.easeOutCirc
        }}
        style={{
          ...style,
          background: color,
          filter: `blur(${isMobile ? '3px' : '4px'})`
        }}
      />
    );
  }
  
  return null;
});

// ============================================
// PREMIUM INTERACTIVE BACKGROUND
// ============================================
const PremiumInteractiveBackground = React.memo(({ isMobile, isTablet, reducedMotion }) => {
  const [interactions, setInteractions] = useState([]);
  const interactionCount = isMobile ? 4 : isTablet ? 6 : 8;
  
  useEffect(() => {
    if (reducedMotion) return;
    
    let frameId;
    let lastTime = 0;
    const updateInterval = isMobile ? 200 : isTablet ? 150 : 120;
    
    const updateInteractions = (currentTime) => {
      if (currentTime - lastTime > updateInterval) {
        if (Math.random() > 0.8 && interactions.length < interactionCount) {
          const types = ['sparkle', 'glow'];
          const colors = [
            '#10B981CC',
            '#34D399CC', 
            '#22C55ECC',
            '#059669CC'
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
  }, [interactions.length, isMobile, isTablet, reducedMotion, interactionCount]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      {interactions.map(interaction => (
        <PremiumMicroInteraction 
          key={interaction.id} 
          {...interaction} 
          isMobile={isMobile}
          isTablet={isTablet}
        />
      ))}
    </div>
  );
});

// ============================================
// PREMIUM PARTICLE BACKGROUND
// ============================================
const PremiumParticleBackground = React.memo(({ isMobile, isTablet, reducedMotion }) => {
  const particleCount = isMobile ? 20 : isTablet ? 30 : 40;
  
  if (reducedMotion) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-96 h-96 rounded-full bg-gradient-to-br from-green-400/10 via-emerald-400/8 to-teal-300/10 blur-[100px]" />
        <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-gradient-to-br from-yellow-300/8 via-emerald-300/8 to-green-400/10 blur-[90px]" />
      </div>
    );
  }
  
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {Array.from({ length: particleCount }).map((_, i) => {
        const size = isMobile ? Math.random() * 1.5 + 0.5 : isTablet ? Math.random() * 2 + 1 : Math.random() * 3 + 1.5;
        const colors = [
          'rgba(16, 185, 129, 0.25)',
          'rgba(52, 211, 153, 0.25)',
          'rgba(34, 197, 94, 0.25)',
          'rgba(5, 150, 105, 0.25)'
        ];
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              background: colors[i % 4],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              willChange: 'transform, opacity',
              transform: 'translate3d(0,0,0)',
              filter: 'blur(0.5px)'
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * (isMobile ? 25 : isTablet ? 35 : 50)],
              y: [0, (Math.random() - 0.5) * (isMobile ? 25 : isTablet ? 35 : 50)],
              opacity: [0.15, 0.3, 0.15],
              scale: [1, 1.15, 1]
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              ease: PREMIUM_EASING.easeOutCirc,
              delay: i * 0.04,
              times: [0, 0.5, 1]
            }}
          />
        );
      })}
    </div>
  );
});

// ============================================
// PREMIUM SCROLL PROGRESS (FIXED)
// ============================================
const PremiumScrollProgress = React.memo(({ scrollYProgress }) => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left will-change-transform bg-green-500/20"
      style={{ 
        scaleX: scrollYProgress,
        transform: 'translate3d(0,0,0)'
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

// ============================================
// PREMIUM RIPPLE EFFECT
// ============================================
const PremiumRippleEffect = React.memo(({ ripples, isMobile, isTablet }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute pointer-events-none rounded-full will-change-transform"
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
              y: [ripple.y - 10, ripple.y - 50, ripple.y - 65]
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
              transform: 'translate3d(0,0,0)'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

// ============================================
// PREMIUM MOUSE/TOUCH TRAIL
// ============================================
const PremiumTouchTrail = React.memo(({ position, isScrolling, isMobile }) => {
  const trailRef = useRef(null);
  
  useEffect(() => {
    if (trailRef.current) {
      trailRef.current.style.left = `${position.x - (isMobile ? 3 : 4)}px`;
      trailRef.current.style.top = `${position.y - (isMobile ? 3 : 4)}px`;
    }
  }, [position, isMobile]);
  
  return (
    <div
      ref={trailRef}
      className="absolute pointer-events-none rounded-full z-30 transition-all duration-100 ease-out"
      style={{
        width: isMobile ? '6px' : '8px',
        height: isMobile ? '6px' : '8px',
        background: 'radial-gradient(circle, rgba(34,197,94,0.5), rgba(16,185,129,0.3))',
        border: '1px solid rgba(34,197,94,0.6)',
        filter: 'blur(0.5px)',
        opacity: isScrolling ? 0.5 : 1,
        transform: 'translate3d(0,0,0)',
        willChange: 'transform, opacity'
      }}
    />
  );
});

// ============================================
// PREMIUM BACKGROUND ORBS
// ============================================
const PremiumBackgroundOrbs = React.memo(({ isMobile, isTablet, reducedMotion }) => {
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
          willChange: 'transform, opacity'
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
          willChange: 'transform, opacity'
        }}
      />
    </div>
  );
});

// ============================================
// PREMIUM FLOATING ICONS
// ============================================
const PremiumFloatingIcons = React.memo(({ isMobile, isTablet, reducedMotion }) => {
  const icons = useMemo(() => [
    { icon: '📧', x: '10%', y: '20%', delay: 0, size: isMobile ? 'text-lg' : 'text-xl' },
    { icon: '💬', x: '85%', y: '30%', delay: 2, size: isMobile ? 'text-base' : 'text-lg' },
    { icon: '📱', x: '20%', y: '70%', delay: 4, size: isMobile ? 'text-base' : 'text-lg' },
    { icon: '✉️', x: '75%', y: '65%', delay: 6, size: isMobile ? 'text-lg' : 'text-xl' },
    { icon: '💚', x: '40%', y: '15%', delay: 1, size: isMobile ? 'text-base' : 'text-lg' },
    { icon: '🌐', x: '60%', y: '80%', delay: 3, size: isMobile ? 'text-lg' : 'text-xl' }
  ], [isMobile, isTablet]);
  
  if (reducedMotion) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {icons.slice(0, isMobile ? 3 : isTablet ? 4 : 6).map((el, idx) => (
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

// ============================================
// THROTTLE UTILITY FUNCTION
// ============================================
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

// ============================================
// CUSTOM ANTIGRAVITY CURSOR
// ============================================
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

// ============================================
// ENHANCED HOVER EFFECT COMPONENT
// ============================================
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

// ============================================
// PREMIUM CONTACT FORM COMPONENT
// ============================================
const PremiumContactForm = React.memo(({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  isSubmitting, 
  submitError, 
  submitSuccess,
  isMobile,
  isTablet,
  reducedMotion 
}) => {
  const [focusedField, setFocusedField] = useState(null);
  
  const formFields = useMemo(() => [
    {
      id: 'name',
      label: 'Your Name',
      type: 'text',
      placeholder: 'Enter your full name',
      icon: '👤',
      validation: (value) => value.trim().length >= 2
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'you@example.com',
      icon: '📧',
      validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    {
      id: 'message',
      label: 'Your Message',
      type: 'textarea',
      placeholder: 'Tell us what you have in mind...',
      icon: '💬',
      rows: isMobile ? 4 : isTablet ? 5 : 6,
      validation: (value) => value.trim().length >= 10
    }
  ], [isMobile, isTablet]);
  
  const contactInfo = useMemo(() => [
    { 
      icon: '📧', 
      label: 'Email', 
      value: 'purescan.helpdesk@gmail.com', 
      link: 'mailto:purescan.helpdesk@gmail.com',
      color: 'from-green-500/20 to-emerald-500/10'
    },
    { 
      icon: '📍', 
      label: 'Location', 
      value: 'Remote Worldwide',
      color: 'from-purple-500/20 to-violet-500/10'
    },
    { 
      icon: '⏰', 
      label: 'Response', 
      value: '24-48 hours',
      color: 'from-yellow-500/20 to-amber-500/10'
    }
  ], []);
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Success Toast */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-200/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={reducedMotion ? {} : { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 0.6 }}
                className="text-2xl text-green-500"
              >
                ✨
              </motion.div>
              <div className="flex-1">
                <Typography variant="subheading" className="text-green-700 font-semibold">Message Sent Successfully!</Typography>
                <Typography variant="body" className="text-sm text-green-600">We'll get back to you within 24-48 hours.</Typography>
              </div>
            </div>
          </motion.div>
        )}
        
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/5 border border-red-200/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl text-red-500">⚠️</div>
              <div className="flex-1">
                <Typography variant="subheading" className="text-red-700 font-semibold">Oops! Something went wrong</Typography>
                <Typography variant="body" className="text-sm text-red-600">{submitError}</Typography>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Contact Info Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-3 gap-4'} mb-8`}>
        {contactInfo.map((info, idx) => (
          <motion.div
            key={idx}
            className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-100/50 shadow-sm ${info.color}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={!reducedMotion ? {
              y: -4,
              scale: 1.05,
              boxShadow: "0 10px 30px rgba(16,185,129,0.15)"
            } : undefined}
          >
            <div className="text-2xl mb-2 text-green-500">{info.icon}</div>
            <Typography variant="accent" className="text-green-700 mb-1">{info.label}</Typography>
            {info.link ? (
              <a 
                href={info.link}
                className="text-xs text-green-600 hover:text-green-700 hover:underline truncate block"
              >
                {info.value}
              </a>
            ) : (
              <Typography variant="body" className="text-xs text-gray-600 truncate">{info.value}</Typography>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {formFields.map((field, idx) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15 }}
            className="relative"
          >
            <Typography as="label" variant="accent" htmlFor={field.id} className="block text-green-700 mb-2 flex items-center gap-2">
              <span>{field.icon}</span>
              {field.label}
            </Typography>
            
            {field.type === 'textarea' ? (
              <motion.textarea
                id={field.id}
                value={formData[field.id]}
                onChange={handleInputChange}
                onFocus={() => setFocusedField(field.id)}
                onBlur={() => setFocusedField(null)}
                rows={field.rows}
                className={`
                  w-full px-4 py-3 rounded-xl border bg-white/90 backdrop-blur-sm
                  focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
                  transition-all duration-300 resize-none
                  ${focusedField === field.id ? 'shadow-lg shadow-green-200/50' : 'shadow-sm'}
                  ${submitError && !field.validation(formData[field.id]) ? 'border-red-300' : 'border-green-200'}
                `}
                style={TYPOGRAPHY_CONFIG.body}
                placeholder={field.placeholder}
                required
              />
            ) : (
              <motion.input
                type={field.type}
                id={field.id}
                value={formData[field.id]}
                onChange={handleInputChange}
                onFocus={() => setFocusedField(field.id)}
                onBlur={() => setFocusedField(null)}
                className={`
                  w-full px-4 py-3 rounded-xl border bg-white/90 backdrop-blur-sm
                  focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
                  transition-all duration-300
                  ${focusedField === field.id ? 'shadow-lg shadow-green-200/50' : 'shadow-sm'}
                  ${submitError && !field.validation(formData[field.id]) ? 'border-red-300' : 'border-green-200'}
                `}
                style={TYPOGRAPHY_CONFIG.body}
                placeholder={field.placeholder}
                required
              />
            )}
            
            {/* Focus Indicator */}
            {focusedField === field.id && !reducedMotion && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(34,197,94,0.1), transparent 70%)',
                  filter: 'blur(8px)',
                  zIndex: -1
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              />
            )}
          </motion.div>
        ))}
        
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={!reducedMotion && !isSubmitting ? { 
            scale: 1.05,
            boxShadow: "0 15px 40px rgba(16,185,129,0.3)"
          } : undefined}
          whileTap={{ scale: 0.95 }}
          className={`
            w-full py-4 px-6 rounded-xl text-white
            bg-gradient-to-r from-green-500 to-emerald-600
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg shadow-green-200/50 relative overflow-hidden
            flex items-center justify-center gap-3
          `}
          style={TYPOGRAPHY_CONFIG.button}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <Typography variant="button">Sending...</Typography>
            </>
          ) : (
            <>
              <motion.span
                animate={reducedMotion ? {} : { rotate: [0, 360] }}
                transition={reducedMotion ? {} : { duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-xl"
              >
                ✉️
              </motion.span>
              <Typography variant="button">Send Message</Typography>
            </>
          )}
          
          {/* Button Glow Effect */}
          {!isSubmitting && !reducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: "radial-gradient(circle at center, rgba(255,255,255,0.3), transparent 70%)",
                filter: "blur(10px)"
              }}
            />
          )}
        </motion.button>
      </form>
    </div>
  );
});

// ============================================
// MAIN CONTACTUS COMPONENT WITH FIXED SCROLLING
// ============================================
const ContactUs = () => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  
  const [ripples, setRipples] = useState([]);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [floatingIcons, setFloatingIcons] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const device = usePremiumDeviceDetection();
  const { isMobile, isTablet, isDesktop, reducedMotion, touchCapable, canHover } = device;
  
  // FIXED: useScroll without target parameter for window scroll
  const { scrollYProgress } = useScroll();
  
  const scrollY = useMotionValue(0);
  const scrollVelocityY = useMotionValue(0);
  
  // Simplified animation frame for better scrolling
  useAnimationFrame(() => {
    const currentY = window.scrollY;
    scrollY.set(currentY);
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
  
  // Apply premium springs
  const currentSpring = isMobile ? PREMIUM_SPRINGS.mobile : 
                       isTablet ? PREMIUM_SPRINGS.responsive : 
                       PREMIUM_SPRINGS.ultraSmooth;
  
  const heroYSpring = useSpring(heroY, currentSpring);
  const heroScaleSpring = useSpring(heroScale, currentSpring);
  
  // Enhanced mouse tracking for desktop
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    if (isMobile || reducedMotion || touchCapable) return;
    
    let animationId;
    let lastX = 0;
    let lastY = 0;
    
    const updateMousePosition = (currentTime) => {
      const currentX = mouseX.get();
      const currentY = mouseY.get();
      
      // Smooth interpolation
      const targetX = lastX;
      const targetY = lastY;
      
      mouseX.set(currentX + (targetX - currentX) * 0.15);
      mouseY.set(currentY + (targetY - currentY) * 0.15);
      
      animationId = requestAnimationFrame(updateMousePosition);
    };
    
    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      lastX = (e.clientX - rect.left) / rect.width - 0.5;
      lastY = (e.clientY - rect.top) / rect.height - 0.5;
      
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
      
      // Create floating icons occasionally
      if (Math.random() > 0.97 && floatingIcons.length < 3) {
        const icons = ['📧', '💬', '📱', '✉️', '💚'];
        const colors = ['#10B981', '#34D399', '#22C55E'];
        setFloatingIcons(prev => [...prev.slice(-2), {
          id: Date.now(),
          icon: icons[Math.floor(Math.random() * icons.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          x: e.clientX,
          y: e.clientY
        }]);
      }
    };
    
    animationId = requestAnimationFrame(updateMousePosition);
    
    const node = containerRef.current;
    if (node) {
      node.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (node) {
        node.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isMobile, reducedMotion, touchCapable, mouseX, mouseY, floatingIcons.length]);
  
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
  
  // Premium 3D effects
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
  
  // Optimized ripple effect with cooldown
  const rippleCooldownRef = useRef(false);
  const rippleTimeoutRef = useRef(null);
  
  const handleInteraction = useCallback((e) => {
    if (rippleCooldownRef.current || reducedMotion) return;
    
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
  }, [isMobile, isTablet, reducedMotion]);
  
  // Smooth movement tracking
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
  
  // Form handlers
  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (submitError) setSubmitError('');
  }, [submitError]);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Clear previous states
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitError('Please enter a valid email address');
      return;
    }

    // Name validation
    if (formData.name.trim().length < 2) {
      setSubmitError('Name should be at least 2 characters long');
      return;
    }

    // Message validation
    if (formData.message.trim().length < 10) {
      setSubmitError('Message should be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // EmailJS configuration
      const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error('EmailJS configuration is missing. Please check your environment variables.');
      }
      
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_email: import.meta.env.VITE_YOUR_EMAIL || 'purescan.helpdesk@gmail.com',
        reply_to: formData.email,
        date: new Date().toLocaleString(),
        app_name: 'PureScan',
        subject: `New Contact Message from ${formData.name}`
      };

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      // Success
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // User-friendly error messages
      if (error.text?.includes('Invalid email')) {
        setSubmitError('Invalid email format. Please check and try again.');
      } else if (error.text?.includes('Service not found')) {
        setSubmitError('Service configuration error. Please contact support.');
      } else {
        setSubmitError('Failed to send message. Please try again later or email us directly at purescan.helpdesk@gmail.com');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  // Floating icons cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (floatingIcons.length > 0) {
        setFloatingIcons(prev => prev.slice(-2));
      }
    }, 3000);
    
    return () => clearInterval(cleanupInterval);
  }, [floatingIcons.length]);
  
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
      {/* Premium Scroll Progress */}
      <PremiumScrollProgress scrollYProgress={scrollYProgress} />
      
      {/* Background Effects */}
      <Suspense fallback={<div className="absolute inset-0 -z-10 bg-green-50/50" />}>
        <PremiumInteractiveBackground 
          isMobile={isMobile}
          isTablet={isTablet}
          reducedMotion={reducedMotion}
        />
        <PremiumParticleBackground 
          isMobile={isMobile}
          isTablet={isTablet}
          reducedMotion={reducedMotion}
        />
      </Suspense>
      
      {/* Premium Background Orbs */}
      <PremiumBackgroundOrbs 
        isMobile={isMobile}
        isTablet={isTablet}
        reducedMotion={reducedMotion}
      />
      
      {/* Premium Floating Icons */}
      <PremiumFloatingIcons 
        isMobile={isMobile}
        isTablet={isTablet}
        reducedMotion={reducedMotion}
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
      
      {/* Interactive Effects */}
      {!reducedMotion && (
        <>
          <PremiumRippleEffect 
            ripples={ripples}
            isMobile={isMobile}
            isTablet={isTablet}
          />
          <PremiumTouchTrail 
            position={touchPosition}
            isScrolling={isScrolling}
            isMobile={isMobile}
          />
        </>
      )}
      
      {/* Floating Icons (Desktop only) */}
      {!isMobile && !reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <AnimatePresence>
            {floatingIcons.map(icon => (
              <motion.div
                key={icon.id}
                className="absolute pointer-events-none text-2xl"
                initial={{
                  x: icon.x,
                  y: icon.y,
                  scale: 0,
                  opacity: 0,
                  rotate: 0
                }}
                animate={{
                  scale: [0, 1, 1, 0],
                  opacity: [0, 0.8, 0.8, 0],
                  y: [icon.y, icon.y - 120],
                  rotate: [0, 360]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5 }}
                style={{
                  color: icon.color,
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
                }}
                onAnimationComplete={() => {
                  setTimeout(() => {
                    setFloatingIcons(prev => prev.filter(i => i.id !== icon.id));
                  }, 100);
                }}
              >
                {icon.icon}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Main Content */}
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
          {/* Hero Section with AntigravityHoverEffect */}
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
                  animate={reducedMotion ? {} : {
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={reducedMotion ? {} : {
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className={`font-bold tracking-tight ${isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl'} mb-6`}
                  style={TYPOGRAPHY_CONFIG.heading}
                  style={{
                    ...TYPOGRAPHY_CONFIG.heading,
                    background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                    backgroundSize: '400% 400%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    willChange: 'background-position'
                  }}
                  whileHover={!reducedMotion && canHover ? {
                    scale: 1.02,
                    transition: { duration: 0.3, ease: "easeInOut" }
                  } : {}}
                >
                  <TypingAnimation text="Contact Us" speed={70} variant="heading" className="block" />
                </motion.h1>
                
                <motion.div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-8 h-1"
                  initial={{ width: 0 }}
                  animate={{ width: isMobile ? "150px" : "200px" }}
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
                      text="Have questions, feedback, or partnership ideas? We'd love to hear from you." 
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
                      text="Get in touch with our team." 
                      speed={40} 
                      delay={1500}
                      variant="accent"
                    />
                  </motion.span>
                </Typography>
              </motion.div>
            </AntigravityHoverEffect>
          </motion.section>
          
          {/* Contact Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "100px" }}
            transition={{ 
              duration: reducedMotion ? 0 : 0.8,
              ease: PREMIUM_EASING.premiumEnter
            }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/20 bg-gradient-to-br from-white/90 to-white/60 shadow-2xl shadow-green-100/50"
              whileHover={!reducedMotion ? {
                y: -8,
                scale: 1.02,
                boxShadow: "0 25px 60px rgba(16,185,129,0.2)",
                transition: PREMIUM_SPRINGS.hover
              } : undefined}
              style={{
                transform: 'translate3d(0,0,0)',
                willChange: 'transform'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/20" />
              <div className="relative z-10 p-6 sm:p-8">
                <PremiumContactForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                  submitSuccess={submitSuccess}
                  isMobile={isMobile}
                  isTablet={isTablet}
                  reducedMotion={reducedMotion}
                />
              </div>
            </motion.div>
          </motion.div>
          
          {/* Additional Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto mt-8 text-center"
          >
            <Typography variant="body" className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Need immediate assistance? Email us directly at{' '}
              <a 
                href="mailto:purescan.helpdesk@gmail.com"
                className="text-green-600 hover:text-green-700 hover:underline font-medium"
                style={TYPOGRAPHY_CONFIG.accent}
              >
                purescan.helpdesk@gmail.com
              </a>
            </Typography>
          </motion.div>
          
          {/* Spacing */}
          <div className="h-16 sm:h-20" />
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUs;