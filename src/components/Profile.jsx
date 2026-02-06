import { useEffect, useState, useRef, useCallback, useMemo, memo, Suspense } from "react";
import { auth } from "./FireBase";
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { debounce, throttle } from "lodash-es";

// ============================================
// FONT STYLES & TYPOGRAPHY SYSTEM
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
const Typography = memo(({ 
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
const TypingAnimation = memo(({ text, speed = 50, className = "", delay = 0, variant = "body" }) => {
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

// Device Detection Hook
const usePremiumDeviceDetection = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    touchCapable: false,
    reducedMotion: false,
    highRefreshRate: false,
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
      const canHover = window.matchMedia('(hover: hover)').matches;
      
      setDevice({
        isMobile,
        isTablet,
        isDesktop,
        touchCapable,
        reducedMotion,
        highRefreshRate,
        canHover
      });
    };
    
    checkDevice();
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkDevice, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverQuery = window.matchMedia('(hover: hover)');
    
    const handleMotionChange = () => checkDevice();
    
    motionQuery.addEventListener('change', handleMotionChange);
    hoverQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
      hoverQuery.removeEventListener('change', handleMotionChange);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  return device;
};

// Premium Spring Configurations
const PREMIUM_SPRINGS = {
  ultraSmooth: { stiffness: 200, damping: 35, mass: 0.5, restDelta: 0.0001, restSpeed: 0.0001 },
  smooth: { stiffness: 180, damping: 30, mass: 0.6, restDelta: 0.0001, restSpeed: 0.0001 },
  responsive: { stiffness: 160, damping: 28, mass: 0.7, restDelta: 0.001, restSpeed: 0.001 },
  bouncy: { stiffness: 220, damping: 25, mass: 0.5, restDelta: 0.001, restSpeed: 0.001 },
  mobile: { stiffness: 150, damping: 30, mass: 0.7, restDelta: 0.005, restSpeed: 0.005 },
  hover: { stiffness: 400, damping: 25, mass: 0.3, restDelta: 0.0001, restSpeed: 0.0001 }
};

// Premium Easing Curves
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

// Optimized Micro Interaction Component
const MicroInteraction = memo(({ type, x, y, color, isMobile }) => {
  if (type === 'sparkle') {
    return (
      <motion.div
        className="absolute pointer-events-none will-change-transform gpu-accelerated"
        initial={{ x, y, scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 0],
          opacity: [0, 1, 0],
          rotate: [0, 180]
        }}
        transition={{ duration: isMobile ? 0.4 : 0.6 }}
        style={{
          width: isMobile ? '16px' : '20px',
          height: isMobile ? '16px' : '20px',
          background: `radial-gradient(circle, ${color}60, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translateZ(0)'
        }}
      />
    );
  }
  
  if (type === 'pulse') {
    return (
      <motion.div
        className="absolute pointer-events-none rounded-full will-change-transform"
        initial={{ x: x - (isMobile ? 10 : 15), y: y - (isMobile ? 10 : 15), scale: 0, opacity: 0.7 }}
        animate={{
          scale: [0, 1.5],
          opacity: [0.7, 0]
        }}
        transition={{ duration: isMobile ? 0.6 : 0.8 }}
        style={{
          width: isMobile ? '24px' : '30px',
          height: isMobile ? '24px' : '30px',
          background: color,
          filter: 'blur(4px)',
          transform: 'translateZ(0)'
        }}
      />
    );
  }
  
  return null;
});

MicroInteraction.displayName = 'MicroInteraction';

// Premium Scroll Progress Component
const PremiumScrollProgress = memo(({ scrollYProgress }) => {
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

PremiumScrollProgress.displayName = 'PremiumScrollProgress';

// Optimized Interactive Background
const InteractiveBackground = memo(({ isMobile, reducedMotion }) => {
  const [interactions, setInteractions] = useState([]);
  
  useEffect(() => {
    if (reducedMotion) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && interactions.length < (isMobile ? 3 : 6)) {
        const type = Math.random() > 0.5 ? 'sparkle' : 'pulse';
        const colors = ['#10B981', '#34D399', '#22C55E', '#059669'];
        setInteractions(prev => {
          if (prev.length >= (isMobile ? 4 : 8)) {
            return [...prev.slice(1), {
              id: Date.now(),
              type,
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              color: colors[Math.floor(Math.random() * colors.length)]
            }];
          }
          return [...prev, {
            id: Date.now(),
            type,
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            color: colors[Math.floor(Math.random() * colors.length)]
          }];
        });
      }
    }, isMobile ? 1500 : 1000);
    
    return () => clearInterval(interval);
  }, [isMobile, reducedMotion, interactions.length]);
  
  useEffect(() => {
    if (reducedMotion) return;
    
    const cleanupInterval = setInterval(() => {
      setInteractions(prev => prev.filter(int => Date.now() - int.id < 2000));
    }, 1000);
    
    return () => clearInterval(cleanupInterval);
  }, [reducedMotion]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {interactions.map(interaction => (
          <MicroInteraction key={interaction.id} {...interaction} isMobile={isMobile} />
        ))}
      </AnimatePresence>
    </div>
  );
});

InteractiveBackground.displayName = 'InteractiveBackground';

// Premium Background Orbs
const PremiumBackgroundOrbs = memo(({ isMobile, isTablet, reducedMotion }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        className={`absolute ${isMobile ? '-top-20 -left-20' : '-top-40 -left-40'} ${
          isMobile ? 'w-[25rem] h-[25rem]' : 'w-[35rem] h-[35rem]'
        } rounded-full pointer-events-none gpu-accelerated`}
        animate={reducedMotion ? {} : {
          opacity: [isMobile ? 0.06 : 0.1, isMobile ? 0.1 : 0.15, isMobile ? 0.06 : 0.1],
          scale: [1, isMobile ? 1.03 : 1.05, 1],
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
        className={`absolute ${isMobile ? '-right-10 -bottom-10' : '-right-20 -bottom-20'} ${
          isMobile ? 'w-[20rem] h-[20rem]' : 'w-[25rem] h-[25rem]'
        } rounded-full pointer-events-none gpu-accelerated`}
        animate={reducedMotion ? {} : {
          opacity: [isMobile ? 0.05 : 0.08, isMobile ? 0.08 : 0.12, isMobile ? 0.05 : 0.08],
          scale: [1, isMobile ? 1.02 : 1.03, 1],
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

PremiumBackgroundOrbs.displayName = 'PremiumBackgroundOrbs';

// Optimized Ripple Effect
const RippleEffect = memo(({ ripple }) => {
  const [shouldRender, setShouldRender] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShouldRender(false), ripple.isMobile ? 800 : 1000);
    return () => clearTimeout(timer);
  }, [ripple.isMobile]);
  
  if (!shouldRender) return null;
  
  if (ripple.type === 'sparkle') {
    return (
      <motion.div
        className="absolute pointer-events-none will-change-transform gpu-accelerated"
        initial={{
          x: ripple.x - (ripple.isMobile ? 8 : 10),
          y: ripple.y - (ripple.isMobile ? 8 : 10),
          scale: 0,
          opacity: 0,
          rotate: 0
        }}
        animate={{
          scale: [0, 1.5, 0],
          opacity: [0, 1, 0],
          rotate: [0, 180],
          y: [ripple.y - (ripple.isMobile ? 8 : 10), ripple.y - (ripple.isMobile ? 25 : 35)]
        }}
        transition={{ duration: ripple.isMobile ? 0.6 : 0.8 }}
        style={{
          width: ripple.isMobile ? '16px' : '20px',
          height: ripple.isMobile ? '16px' : '20px',
          background: `radial-gradient(circle, ${ripple.color}, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translateZ(0)'
        }}
      />
    );
  }
  
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full will-change-transform gpu-accelerated"
      initial={{
        scale: 0,
        opacity: 0.7,
        x: ripple.x - (ripple.isMobile ? 15 : 20),
        y: ripple.y - (ripple.isMobile ? 15 : 20),
      }}
      animate={{
        scale: ripple.isMobile ? 3.5 : 5,
        opacity: 0,
      }}
      transition={{
        duration: ripple.isMobile ? 0.9 : 1.2,
        ease: "easeOut"
      }}
      style={{
        width: ripple.isMobile ? 30 : 40,
        height: ripple.isMobile ? 30 : 40,
        background: `radial-gradient(circle, ${ripple.color}, transparent 70%)`,
        filter: `blur(${ripple.isMobile ? 8 : 12}px)`,
        mixBlendMode: "screen",
        transform: 'translateZ(0)',
      }}
    />
  );
});

RippleEffect.displayName = 'RippleEffect';

// Enhanced GlowingCard Component
const GlowingCard = memo(({ children, glowColor = "#22c55e", className = "", isMobile, tilt = true, isHovered = false, reducedMotion = false, canHover = true }) => {
  return (
    <motion.div
      className={`relative rounded-2xl p-[1.5px] overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${glowColor}40, transparent)`,
        boxShadow: `0 0 20px ${glowColor}40`,
        transform: 'translateZ(0)'
      }}
      whileHover={(!reducedMotion && canHover && tilt) ? { scale: 1.03, y: -3 } : {}}
      whileTap={isMobile ? { scale: 0.98 } : {}}
      transition={{ 
        duration: 0.3, 
        type: "spring", 
        stiffness: 300,
        damping: 25
      }}
    >
      {/* Animated Glow on Hover */}
      {isHovered && !reducedMotion && (
        <motion.div
          className="absolute -inset-4 -z-10 rounded-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 0.6,
            scale: 1.05,
          }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            background: `radial-gradient(circle at center, ${glowColor}40, transparent 70%)`,
            filter: 'blur(25px)',
            transform: 'translateZ(0)'
          }}
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent backdrop-blur-sm rounded-2xl opacity-0 hover:opacity-100 transition-all duration-500" />
      <div className={`relative rounded-2xl bg-white/95 backdrop-blur-xl z-10 ${isMobile ? 'p-4' : 'p-6'}`}>
        {children}
      </div>
    </motion.div>
  );
});

GlowingCard.displayName = 'GlowingCard';

const Profile = () => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const rafRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [ripples, setRipples] = useState([]);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const device = usePremiumDeviceDetection();
  const { isMobile, isTablet, reducedMotion, touchCapable, canHover } = device;
  
  // Enhanced scroll animations
  const { scrollYProgress } = useScroll();
  const scrollY = useMotionValue(0);
  
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
  
  const currentSpring = isMobile ? PREMIUM_SPRINGS.mobile : 
                       isTablet ? PREMIUM_SPRINGS.responsive : 
                       PREMIUM_SPRINGS.ultraSmooth;
  
  const heroYSpring = useSpring(heroY, currentSpring);
  const heroScaleSpring = useSpring(heroScale, currentSpring);
  
  // Ripple effect with cooldown
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
      type: 'ripple',
      size: isMobile ? 0.7 : isTablet ? 0.85 : 1,
      isMobile
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
  
  // Hover detection
  const handleMouseEnter = useCallback(() => {
    if (!reducedMotion && canHover) setIsHovered(true);
  }, [reducedMotion, canHover]);
  
  const handleMouseLeave = useCallback(() => {
    if (!reducedMotion && canHover) setIsHovered(false);
  }, [reducedMotion, canHover]);
  
  // Optimized user fetch
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      requestAnimationFrame(() => {
        setUser(currentUser);
        setLoading(false);
      });
    });
    return () => unsubscribe();
  }, []);
  
  // Optimized name update
  const handleNameUpdate = useCallback(async () => {
    if (newName.trim() === "") {
      toast.error("Please enter a name");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      await auth.currentUser.reload();
      
      setUser(prev => ({ ...auth.currentUser }));
      setNewName("");
      
      toast.success("Name updated successfully! 🎉", {
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '10px',
        },
        icon: '✨',
      });
      
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update name. Please try again.", {
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '10px',
        }
      });
    } finally {
      setIsUpdating(false);
    }
  }, [newName]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
    };
  }, []);
  
  // Memoized particle options
  const particleOptions = useMemo(() => ({
    fpsLimit: isMobile ? 30 : 60,
    particles: {
      number: { 
        value: isMobile ? 15 : 25,
        density: { 
          enable: true, 
          value_area: isMobile ? 250 : 350 
        } 
      },
      color: { value: ["#22c55e", "#10b981", "#34d399"] },
      shape: { type: "circle" },
      opacity: { 
        value: isMobile ? 0.05 : 0.07,
        random: true,
        animation: { 
          enable: true, 
          speed: 0.5,
          minimumValue: 0.05 
        } 
      },
      size: { 
        value: isMobile ? 1.2 : 1.8,
        random: true,
        animation: { 
          enable: true, 
          speed: 1, 
          minimumValue: 0.8 
        } 
      },
      move: {
        enable: true,
        speed: isMobile ? 0.1 : 0.15,
        direction: "none",
        random: true,
        straight: false,
        outMode: "bounce",
        attract: { enable: false }
      }
    },
    interactivity: {
      events: {
        onhover: { 
          enable: !isMobile, 
          mode: "repulse",
          parallax: { enable: false }
        },
        onclick: { enable: true, mode: "push" }
      }
    },
    detectRetina: true,
    responsive: []
  }), [isMobile]);
  
  // Loading skeleton
  if (loading) {
    return (
      <div 
        ref={containerRef}
        className="relative min-h-screen bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 overflow-y-auto scroll-smooth"
        style={{ transform: 'translateZ(0)' }}
      >
        <Suspense fallback={null}>
          <InteractiveBackground 
            isMobile={isMobile}
            reducedMotion={reducedMotion}
          />
          <PremiumBackgroundOrbs 
            isMobile={isMobile}
            isTablet={isTablet}
            reducedMotion={reducedMotion}
          />
        </Suspense>
        
        <Particles className="absolute inset-0" style={{ zIndex: 0 }} options={particleOptions} />
        
        <motion.div
          style={{ y: heroYSpring }}
          className="relative z-50 p-4 sm:p-6 lg:p-8 max-w-md mx-auto"
        >
          <div className="relative w-fit mx-auto mb-8">
            <Typography variant="heading">
              <TypingAnimation 
                text="Loading Profile..."
                speed={70}
                variant="heading"
                className="text-2xl sm:text-3xl font-extrabold tracking-wide text-center bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent"
              />
            </Typography>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ 
                duration: reducedMotion ? 0 : 1.5, 
                delay: 0.5,
                ease: PREMIUM_EASING.easeOutQuint
              }}
              className={`h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded origin-left mx-auto ${
                isMobile ? 'w-24' : 'w-32'
              }`}
            />
          </div>
          
          <div className="space-y-4">
            <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 animate-pulse ${isMobile ? 'space-y-4' : 'space-y-5'}`}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 mx-auto" />
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mx-auto" />
                <div className="h-4 w-5/6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mx-auto" />
                <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 to-gray-300 rounded mx-auto" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div 
        ref={containerRef}
        className="relative min-h-screen bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 overflow-hidden flex items-center justify-center will-change-transform"
        style={{ transform: 'translateZ(0)' }}
      >
        <Suspense fallback={null}>
          <InteractiveBackground 
            isMobile={isMobile}
            reducedMotion={reducedMotion}
          />
          <PremiumBackgroundOrbs 
            isMobile={isMobile}
            isTablet={isTablet}
            reducedMotion={reducedMotion}
          />
        </Suspense>
        
        <Particles className="absolute inset-0" style={{ zIndex: 0 }} options={particleOptions} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: PREMIUM_EASING.premiumEnter }}
          className="text-center p-8 max-w-md z-50"
        >
          <GlowingCard 
            isMobile={isMobile} 
            tilt={false}
            isHovered={isHovered}
            reducedMotion={reducedMotion}
            canHover={canHover}
            glowColor="#EF4444"
          >
            <div className="space-y-4">
              <TypingAnimation 
                text="🔒"
                speed={50}
                className="text-6xl mb-4"
              />
              <Typography variant="subheading">
                <TypingAnimation 
                  text="Please Log In"
                  speed={40}
                  delay={100}
                  className="text-xl font-bold text-gray-800"
                  variant="subheading"
                />
              </Typography>
              <Typography variant="body">
                <TypingAnimation 
                  text="You need to be logged in to view your profile."
                  speed={30}
                  delay={200}
                  className="text-gray-600"
                  variant="body"
                />
              </Typography>
              <motion.a
                href="/login"
                className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                whileHover={(!reducedMotion && canHover) ? { 
                  scale: 1.05,
                  transition: PREMIUM_SPRINGS.hover
                } : undefined}
                whileTap={touchCapable ? { scale: 0.95 } : undefined}
                style={TYPOGRAPHY_CONFIG.button}
              >
                <TypingAnimation 
                  text="Go to Login"
                  speed={30}
                  delay={300}
                  className="text-white"
                  variant="button"
                />
              </motion.a>
            </div>
          </GlowingCard>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchMove={handleMove}
      onMouseMove={!isMobile ? handleMove : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
      <Suspense fallback={null}>
        <InteractiveBackground 
          isMobile={isMobile}
          reducedMotion={reducedMotion}
        />
        <PremiumBackgroundOrbs 
          isMobile={isMobile}
          isTablet={isTablet}
          reducedMotion={reducedMotion}
        />
      </Suspense>
      
      <Particles className="absolute inset-0" style={{ zIndex: 0 }} options={particleOptions} />
      
      {/* Ripple Effects Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        <AnimatePresence>
          {ripples.map(ripple => (
            <RippleEffect key={ripple.id} ripple={ripple} />
          ))}
        </AnimatePresence>
        
        {/* Touch/Mouse Trail Effect */}
        <motion.div
          className="absolute pointer-events-none rounded-full gpu-accelerated"
          animate={{
            x: touchPosition.x - (isMobile ? 6 : 8),
            y: touchPosition.y - (isMobile ? 6 : 8),
            opacity: touchPosition.x === 0 && touchPosition.y === 0 ? 0 : 0.3,
          }}
          transition={{
            type: "spring",
            stiffness: isMobile ? 800 : 600,
            damping: isMobile ? 40 : 30,
            mass: 0.5
          }}
          style={{
            width: isMobile ? 12 : 16,
            height: isMobile ? 12 : 16,
            background: `radial-gradient(circle, rgba(34,197,94,0.2), transparent 70%)`,
            border: `1px solid rgba(34,197,94,0.15)`,
            boxShadow: '0 0 8px rgba(34,197,94,0.1)',
            transform: 'translateZ(0)'
          }}
        />
      </div>
      
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
          className="text-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
        >
          {/* Hero Section */}
          <motion.section
            style={{ y: heroYSpring }}
            className="max-w-4xl mx-auto mb-8 sm:mb-12 relative"
          >
            {/* Hero Background Glow */}
            {isHovered && !reducedMotion && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-3xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: [0.15, 0.25, 0.15],
                  scale: [1, 1.05, 1]
                }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: "radial-gradient(circle at center, rgba(34,197,94,0.15), transparent 70%)",
                  filter: "blur(40px)",
                  transform: 'translateZ(0)'
                }}
              />
            )}
            
            <motion.div
              className="text-center"
              whileHover={(!reducedMotion && canHover) ? { 
                scale: 1.01,
                transition: { duration: 0.3 }
              } : undefined}
            >
              <Typography variant="heading" as={motion.h1}
                animate={reducedMotion ? {} : {
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={reducedMotion ? {} : {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className={`tracking-tight ${isMobile ? 'text-3xl' : 'text-4xl sm:text-5xl'} mb-4 sm:mb-6 will-change-transform`}
                style={{
                  background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  transform: 'translateZ(0)'
                }}
                whileHover={(!reducedMotion && canHover) ? {
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeInOut" }
                } : {}}
              >
                <TypingAnimation text="Your Profile" speed={70} variant="heading" className="block" />
              </Typography>
              
              {/* Animated Underline */}
              <motion.div
                className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-6 sm:mb-8 h-1"
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ 
                  duration: reducedMotion ? 0 : 1.5, 
                  delay: 0.5,
                  ease: PREMIUM_EASING.easeOutQuint
                }}
                whileHover={(!reducedMotion && canHover) ? {
                  scaleX: 1.2,
                  transition: { duration: 0.3 }
                } : {}}
              />
              
              <Typography variant="body" as={motion.p}
                animate={reducedMotion ? {} : { 
                  opacity: [0.9, 1, 0.9],
                }}
                transition={reducedMotion ? {} : { 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`text-gray-700 max-w-2xl mx-auto leading-relaxed ${isMobile ? 'text-base' : 'text-lg sm:text-xl'}`}
              >
                <TypingAnimation 
                  text="Welcome to your personalized dashboard. Manage your account settings and preferences here." 
                  speed={30} 
                  delay={800}
                  variant="body"
                />
              </Typography>
            </motion.div>
          </motion.section>
          
          {/* Profile Content */}
          <div className="max-w-md mx-auto">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ 
                opacity: 1, 
                y: 0, 
                scale: 1
              }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: reducedMotion ? 0 : 0.6,
                ease: PREMIUM_EASING.premiumEnter
              }}
              whileHover={(!reducedMotion && canHover) ? {
                y: -10,
                scale: 1.02,
                boxShadow: "0px 25px 70px rgba(16,185,129,0.25)",
                transition: PREMIUM_SPRINGS.hover
              } : undefined}
              whileTap={isMobile ? { scale: 0.98 } : undefined}
              className="mb-6 will-change-transform"
              style={{ transform: 'translateZ(0)' }}
            >
              <GlowingCard 
                glowColor="#10B981" 
                isMobile={isMobile} 
                tilt={false}
                isHovered={isHovered}
                reducedMotion={reducedMotion}
                canHover={canHover}
              >
                <div className="space-y-6 text-center">
                  {/* Profile Image */}
                  {user.photoURL ? (
                    <motion.div
                      whileHover={(!reducedMotion && canHover) ? { scale: 1.03 } : {}}
                      whileTap={isMobile ? { scale: 0.95 } : {}}
                      className="relative w-32 h-32 mx-auto"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 blur-md"
                        animate={reducedMotion ? {} : { opacity: [0.3, 0.4, 0.3] }}
                        transition={reducedMotion ? {} : { duration: 6, repeat: Infinity }}
                      />
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="relative w-full h-full rounded-full border-4 border-white shadow-lg object-cover"
                        loading="eager"
                        decoding="async"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={(!reducedMotion && canHover) ? { scale: 1.03 } : {}}
                      className="relative w-32 h-32 mx-auto"
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-5xl text-green-600 font-bold">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : "👤"}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* User Info with Typing Animation */}
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-left space-y-3"
                    >
                      <div>
                        <Typography variant="accent">
                          <TypingAnimation 
                            text="Name"
                            speed={40}
                            delay={100}
                            className="text-sm font-medium text-gray-500 mb-1"
                            variant="accent"
                          />
                        </Typography>
                        <Typography variant="subheading">
                          <TypingAnimation 
                            text={user.displayName || "No name set"}
                            speed={30}
                            delay={200}
                            className={`text-gray-800 truncate ${
                              isMobile ? 'text-lg' : 'text-xl'
                            } ${!user.displayName ? 'text-gray-400 italic' : ''}`}
                            variant="subheading"
                          />
                        </Typography>
                      </div>
                      
                      <div>
                        <Typography variant="accent">
                          <TypingAnimation 
                            text="Email"
                            speed={40}
                            delay={300}
                            className="text-sm font-medium text-gray-500 mb-1"
                            variant="accent"
                          />
                        </Typography>
                        <Typography variant="body">
                          <TypingAnimation 
                            text={user.email}
                            speed={30}
                            delay={400}
                            className={`text-gray-700 truncate ${
                              isMobile ? 'text-base' : 'text-lg'
                            }`}
                            variant="body"
                          />
                        </Typography>
                      </div>
                      
                      <div>
                        <Typography variant="accent">
                          <TypingAnimation 
                            text="User ID"
                            speed={40}
                            delay={500}
                            className="text-sm font-medium text-gray-500 mb-1"
                            variant="accent"
                          />
                        </Typography>
                        <Typography variant="body">
                          <TypingAnimation 
                            text={`${user.uid.slice(0, 24)}...`}
                            speed={20}
                            delay={600}
                            className={`font-mono text-gray-600 ${
                              isMobile ? 'text-xs' : 'text-sm'
                            } break-all`}
                            variant="body"
                          />
                        </Typography>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </GlowingCard>
            </motion.div>
            
            {/* Update Name Form */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ 
                opacity: 1, 
                y: 0, 
                scale: 1
              }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: 0.15,
                duration: reducedMotion ? 0 : 0.6,
                ease: PREMIUM_EASING.premiumEnter
              }}
              whileHover={(!reducedMotion && canHover) ? {
                y: -10,
                scale: 1.02,
                boxShadow: "0px 25px 70px rgba(16,185,129,0.25)",
                transition: PREMIUM_SPRINGS.hover
              } : undefined}
              whileTap={isMobile ? { scale: 0.98 } : undefined}
              className="mb-6 will-change-transform"
              style={{ transform: 'translateZ(0)' }}
            >
              <GlowingCard 
                glowColor="#34D399" 
                isMobile={isMobile}
                isHovered={isHovered}
                reducedMotion={reducedMotion}
                canHover={canHover}
              >
                <div className="space-y-4">
                  <Typography variant="subheading">
                    <TypingAnimation 
                      text="Update Display Name"
                      speed={40}
                      delay={100}
                      className={`text-gray-800 text-center ${
                        isMobile ? 'text-lg' : 'text-xl'
                      }`}
                      variant="subheading"
                    />
                  </Typography>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value.slice(0, 50))}
                        placeholder="Enter new display name"
                        className={`
                          w-full px-4 py-3 bg-white/90 border border-green-200 
                          rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 
                          focus:ring-offset-1 placeholder-gray-400 relative z-10
                          ${isMobile ? 'text-sm' : ''}
                        `}
                        maxLength={50}
                        data-no-ripple="true"
                      />
                    </div>
                    
                    <motion.button
                      onClick={handleNameUpdate}
                      disabled={isUpdating || newName.trim() === ""}
                      whileHover={(!reducedMotion && canHover && !isUpdating && newName.trim() !== "") ? { 
                        scale: 1.03,
                        transition: PREMIUM_SPRINGS.hover
                      } : undefined}
                      whileTap={touchCapable ? { scale: 0.97 } : undefined}
                      className={`
                        w-full py-3 rounded-lg font-medium relative overflow-hidden
                        transition-all duration-200
                        ${isUpdating 
                          ? 'bg-gradient-to-r from-gray-400 to-gray-300 cursor-not-allowed' 
                          : newName.trim() === ""
                          ? 'bg-gradient-to-r from-gray-300 to-gray-200 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-md'
                        }
                      `}
                      data-no-ripple="true"
                      style={TYPOGRAPHY_CONFIG.button}
                    >
                      <span className="relative z-10 text-white">
                        {isUpdating ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <TypingAnimation 
                              text="Updating..."
                              speed={50}
                              className="text-white"
                              variant="button"
                            />
                          </span>
                        ) : (
                          <TypingAnimation 
                            text="Update Name"
                            speed={30}
                            delay={0}
                            className="text-white"
                            variant="button"
                          />
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                  
                  <Typography variant="body">
                    <TypingAnimation 
                      text="Your display name will be visible across the app"
                      speed={30}
                      delay={300}
                      className={`text-center text-gray-500 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}
                      variant="body"
                    />
                  </Typography>
                </div>
              </GlowingCard>
            </motion.div>
            
            {/* Account Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-100/50 ${
                isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-2 gap-4'
              }`}
            >
              {[
                { 
                  label: "Created", 
                  value: user.metadata?.creationTime 
                    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
                        month: isMobile ? 'numeric' : 'short', 
                        day: 'numeric' 
                      }) 
                    : "N/A" 
                },
                { 
                  label: "Last Login", 
                  value: user.metadata?.lastSignInTime 
                    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', { 
                        month: isMobile ? 'numeric' : 'short', 
                        day: 'numeric' 
                      }) 
                    : "N/A" 
                },
                { label: "Verified", value: user.emailVerified ? "✅ Yes" : "❌ No" },
                { label: "Provider", value: "Email" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-white/90 rounded-xl p-3 text-center"
                  whileHover={(!reducedMotion && canHover) ? { scale: 1.02, y: -2 } : {}}
                >
                  <Typography variant="accent">
                    <TypingAnimation 
                      text={stat.label}
                      speed={30}
                      delay={50 * idx}
                      className={`text-green-700 mb-1 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}
                      variant="accent"
                    />
                  </Typography>
                  <Typography variant="body">
                    <TypingAnimation 
                      text={stat.value}
                      speed={20}
                      delay={100 * idx + 100}
                      className={`text-gray-600 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}
                      variant="body"
                    />
                  </Typography>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default memo(Profile);