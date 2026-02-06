// Ultra Optimized Privacy Policy Component with Zero Lag
import React, { useEffect, useRef, useState, useCallback, useMemo, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence
} from "framer-motion";

// Typing Animation Component
const TypingAnimation = React.memo(({ text, speed = 50, className = "", delay = 0 }) => {
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

  return (
    <span className={`inline-flex items-center ${className}`}>
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
    </span>
  );
});

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
const MicroInteraction = React.memo(({ type, x, y, color, isMobile }) => {
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

// Optimized Interactive Background
const InteractiveBackground = React.memo(({ isMobile, reducedMotion }) => {
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
const PremiumBackgroundOrbs = React.memo(({ isMobile, isTablet, reducedMotion }) => {
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

// Optimized Section Component
const Section = React.memo(({ title, children, isMobile, index, reducedMotion, canHover }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        scale: 1
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        delay: index * 0.1,
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
      onHoverStart={() => !reducedMotion && canHover && setIsHovered(true)}
      onHoverEnd={() => !reducedMotion && canHover && setIsHovered(false)}
      className="group relative cursor-pointer mb-6 will-change-transform"
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-green-50/30 rounded-2xl backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-300 gpu-accelerated" />
      
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
            background: `radial-gradient(circle at center, #10B98140, transparent 70%)`,
            filter: 'blur(25px)',
            transform: 'translateZ(0)'
          }}
        />
      )}
      
      {/* Floating Icons on Hover */}
      {isHovered && !reducedMotion && (
        <>
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 text-lg will-change-transform"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ color: '#10B981' }}
          >
            🔒
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -left-2 w-6 h-6 text-lg will-change-transform"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            style={{ color: '#34D399' }}
          >
            ⭐
          </motion.div>
        </>
      )}
      
      {/* Content */}
      <div className="relative p-5 sm:p-6">
        {/* Section Header */}
        <motion.div 
          className="flex items-center gap-3 mb-3 sm:mb-4"
          whileHover={(!reducedMotion && canHover) ? { x: 5 } : undefined}
        >
          <motion.div
            className="w-2 h-6 sm:h-8 rounded-full bg-gradient-to-b from-green-500 to-emerald-500 will-change-transform"
            animate={(isHovered && !reducedMotion) ? {
              scaleY: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ transform: 'translateZ(0)' }}
          />
          <motion.h2 
            animate={(isHovered && !reducedMotion) ? {
              scale: 1.03,
              x: 3,
            } : {}}
            className="font-bold text-green-800 text-lg sm:text-xl"
          >
            <TypingAnimation text={title} speed={40} delay={index * 100} />
          </motion.h2>
        </motion.div>
        
        {/* Section Content */}
        <div className="text-gray-600 leading-relaxed text-sm sm:text-base">
          {Array.isArray(children) ? (
            <ul className="list-disc pl-5 sm:pl-6 space-y-1 sm:space-y-2">
              {children.map((item, itemIdx) => (
                <motion.li
                  key={itemIdx}
                  className="hover:text-green-700 transition-colors duration-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + itemIdx * 0.05 }}
                  whileHover={(!reducedMotion && canHover) ? {
                    x: 3,
                    scale: 1.01
                  } : undefined}
                  style={{ transform: 'translateZ(0)' }}
                >
                  <TypingAnimation text={item} speed={30} delay={index * 150 + itemIdx * 50} />
                </motion.li>
              ))}
            </ul>
          ) : (
            <motion.p 
              className="hover:text-green-700 transition-colors duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={(!reducedMotion && canHover) ? {
                x: 3,
                color: "#374151"
              } : undefined}
            >
              <TypingAnimation text={children} speed={30} delay={index * 100} />
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

Section.displayName = 'Section';

// Optimized Ripple Effect
const RippleEffect = React.memo(({ ripple }) => {
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

// Throttle Utility Function
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

const PrivacyPolicy = () => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  
  const [ripples, setRipples] = useState([]);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const device = usePremiumDeviceDetection();
  const { isMobile, isTablet, reducedMotion, touchCapable, canHover } = device;
  
  // Fixed: useScroll without target parameter
  const { scrollYProgress } = useScroll();
  
  const scrollY = useMotionValue(0);
  
  // Scroll-based animations
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
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
    };
  }, []);
  
  // Hover detection
  const handleMouseEnter = useCallback(() => {
    if (!reducedMotion && canHover) setIsHovered(true);
  }, [reducedMotion, canHover]);
  
  const handleMouseLeave = useCallback(() => {
    if (!reducedMotion && canHover) setIsHovered(false);
  }, [reducedMotion, canHover]);
  
  const sections = useMemo(() => [
    {
      title: "Information we collect",
      content: [
        "Usage data: pages visited, interactions, device type.",
        "Consent data: choices made via the CMP for EEA/UK/Swiss visitors.",
        "Ad-related data: collected by third parties like Google AdSense."
      ]
    },
    {
      title: "Cookies and advertising",
      content: "We use cookies to improve experience and for advertising via Google AdSense. Users in the EEA/UK/Switzerland get a CMP banner automatically to manage choices."
    },
    {
      title: "Use of Google AdSense",
      content: "Google may use cookies or device identifiers to serve ads. Ads help support this platform; we ensure they remain respectful & non-intrusive."
    },
    {
      title: "Data retention and security",
      content: "We retain data only as long as necessary and use industry-standard protection to prevent unauthorized access."
    },
    {
      title: "Your rights",
      content: [
        "Access, update, or delete your data where applicable.",
        "Withdraw or modify consent via the CMP settings.",
        "Request more information about how your data is handled."
      ]
    },
    {
      title: "Contact",
      content: "For privacy inquiries, contact us via the Contact page or email: purescan.helpdesk@gmail.com"
    }
  ], []);
  
  return (
    <div 
      ref={containerRef}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchMove={handleMove}
      onMouseMove={!isMobile ? handleMove : undefined}
      className="relative w-full flex flex-col bg-gradient-to-b from-white via-green-50/90 to-emerald-50/70 font-sans cursor-default"
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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
              <motion.h1
                animate={reducedMotion ? {} : {
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={reducedMotion ? {} : {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className={`font-bold tracking-tight ${isMobile ? 'text-3xl' : 'text-4xl sm:text-5xl'} mb-4 sm:mb-6 will-change-transform`}
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
                <TypingAnimation text="Privacy Policy" speed={70} className="block" />
              </motion.h1>
              
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
              
              <motion.p
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
                  text="We value your privacy. This policy explains what data we collect, how we use it, and your rights." 
                  speed={30} 
                  delay={800}
                />
              </motion.p>
            </motion.div>
          </motion.section>

          {/* Policy Sections Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ 
              once: true,
              amount: isMobile ? 0.1 : 0.3,
              margin: isMobile ? "0px" : "-50px"
            }}
            variants={{ 
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { staggerChildren: isMobile ? 0.1 : 0.15 }
              }
            }}
            className="max-w-4xl mx-auto"
          >
            {sections.map((section, idx) => (
              <Section
                key={idx}
                title={section.title}
                isMobile={isMobile}
                index={idx}
                reducedMotion={reducedMotion}
                canHover={canHover}
              >
                {Array.isArray(section.content) ? section.content : section.content}
              </Section>
            ))}
          </motion.div>

          {/* Back to Home Button */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: reducedMotion ? 0 : 0.8,
              ease: PREMIUM_EASING.premiumEnter
            }}
            className="max-w-4xl mx-auto text-center mt-8 sm:mt-12"
          >
            <motion.div
              whileHover={(!reducedMotion && canHover) ? { 
                scale: 1.05,
                transition: PREMIUM_SPRINGS.hover
              } : undefined}
              whileTap={touchCapable ? { scale: 0.95 } : undefined}
              className="inline-block"
            >
              <Link
                to="/"
                className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold overflow-hidden px-6 py-3 text-base shadow-lg sm:px-8 sm:py-4 sm:text-lg"
                data-no-ripple="true"
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
                  ←
                </motion.span>
                <motion.span 
                  className="relative z-10"
                  whileHover={!reducedMotion ? {
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  } : {}}
                >
                  <TypingAnimation text="Back to Home" speed={30} delay={200} />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;