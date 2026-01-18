import React, { useRef, useEffect, useState, useCallback, useMemo, Suspense } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useVelocity,
  useReducedMotion,
  useAnimationFrame,
  AnimatePresence
} from "framer-motion";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import kaedeAnim from "../assets/kaede.json";

// Custom hook for smooth mobile detection with passive listeners
const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    touchCapable: false,
    reducedMotion: false
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
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        touchCapable,
        reducedMotion
      });
    };
    
    checkDevice();
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkDevice, 150);
    };
    
    window.addEventListener("resize", handleResize, { passive: true });
    
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => {
      setDeviceInfo(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    motionMediaQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  return deviceInfo;
};

// Advanced smooth scroll hook with momentum
const useMomentumScroll = (isMobile, contentRef) => {
  const scrollY = useMotionValue(0);
  const scrollYProgress = useMotionValue(0);
  const scrollVelocity = useMotionValue(0);
  
  useEffect(() => {
    if (!contentRef.current) return;
    
    let animationId;
    let lastScrollY = 0;
    let lastTime = 0;
    let velocity = 0;
    const friction = isMobile ? 0.92 : 0.88;
    
    const updateScroll = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      
      // Calculate velocity with damping
      velocity = velocity * friction + deltaY * (1 - friction);
      
      // Apply momentum
      const targetScrollY = currentScrollY + velocity * 0.1;
      const currentValue = scrollY.get();
      
      // Smooth interpolation with easing
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const t = Math.min(deltaTime * 0.01, 1);
      const easedT = easeOutCubic(t);
      
      scrollY.set(currentValue + (targetScrollY - currentValue) * easedT);
      scrollYProgress.set(scrollY.get() / (document.body.scrollHeight - window.innerHeight));
      scrollVelocity.set(velocity);
      
      lastScrollY = currentScrollY;
      lastTime = currentTime;
      animationId = requestAnimationFrame(updateScroll);
    };
    
    animationId = requestAnimationFrame(updateScroll);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isMobile, scrollY, scrollYProgress, scrollVelocity]);
  
  return { scrollY, scrollYProgress, scrollVelocity };
};

// Premium spring configurations
const PREMIUM_SPRINGS = {
  ultraSmooth: {
    stiffness: 180,
    damping: 32,
    mass: 0.6,
    restDelta: 0.0001,
    restSpeed: 0.0001
  },
  smooth: {
    stiffness: 150,
    damping: 28,
    mass: 0.5,
    restDelta: 0.0001,
    restSpeed: 0.0001
  },
  responsive: {
    stiffness: 140,
    damping: 30,
    mass: 0.7,
    restDelta: 0.001,
    restSpeed: 0.001
  },
  bouncy: {
    stiffness: 200,
    damping: 25,
    mass: 0.5,
    restDelta: 0.001,
    restSpeed: 0.001
  }
};

// Premium easing functions
const PREMIUM_EASING = {
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeOutCirc: [0, 0.55, 0.45, 1],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeOutQuint: [0.22, 1, 0.36, 1]
};

// Optimized MicroInteraction with GPU layers
const MicroInteraction = React.memo(({ type, x, y, color, isMobile }) => {
  const style = {
    width: isMobile ? '8px' : '12px',
    height: isMobile ? '8px' : '12px',
    background: `radial-gradient(circle, ${color}60 30%, transparent 70%)`,
    borderRadius: '50%',
    willChange: 'transform, opacity',
    transform: 'translate3d(0,0,0)',
    backfaceVisibility: 'hidden',
    perspective: 1000
  };
  
  if (type === 'sparkle') {
    return (
      <motion.div
        className="absolute pointer-events-none"
        initial={{ x, y, scale: 0, opacity: 0, rotate: 0 }}
        animate={{
          scale: [0, 1.4, 0],
          opacity: [0, 0.8, 0],
          rotate: [0, 180],
          y: [y, y - (isMobile ? 20 : 40)]
        }}
        transition={{
          duration: isMobile ? 0.4 : 0.6,
          ease: "easeOut",
          times: [0, 0.5, 1]
        }}
        style={style}
      />
    );
  }
  
  return null;
});

// Floating Icon with improved performance
const FloatingIcon = React.memo(({ icon, color, initialX, initialY, delay, isMobile }) => (
  <motion.div
    className="absolute pointer-events-none"
    initial={{ x: initialX, y: initialY, scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1.1, 1, 0.9, 0],
      opacity: [0, 0.9, 0.8, 0.6, 0],
      y: [initialY, initialY - (isMobile ? 50 : 100)],
      rotate: [0, 20, -20, 0]
    }}
    transition={{
      duration: isMobile ? 2.8 : 3.5,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 6 + 4,
      ease: PREMIUM_EASING.easeOutCirc,
      times: [0, 0.3, 0.6, 0.8, 1]
    }}
    style={{
      color,
      fontSize: isMobile ? '16px' : '20px',
      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
      willChange: 'transform, opacity',
      transform: 'translate3d(0,0,0)'
    }}
  >
    {icon}
  </motion.div>
));

// Optimized InteractiveBackground with particle system
const InteractiveBackground = React.memo(({ isMobile, isTablet }) => {
  const [interactions, setInteractions] = useState([]);
  const particleCount = isMobile ? 15 : isTablet ? 25 : 40;
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (interactions.length < particleCount) {
        const type = 'sparkle';
        const colors = ['#10B981', '#34D399', '#22C55E', '#059669'];
        const newInteraction = {
          id: Date.now(),
          type,
          x: Math.random() * 100 + '%',
          y: Math.random() * 100 + '%',
          color: colors[Math.floor(Math.random() * colors.length)]
        };
        
        setInteractions(prev => [
          ...prev.slice(-(particleCount - 1)),
          newInteraction
        ]);
        
        setTimeout(() => {
          setInteractions(prev => prev.filter(i => i.id !== newInteraction.id));
        }, 1500);
      }
    }, isMobile ? 200 : 100);
    
    return () => clearInterval(interval);
  }, [interactions.length, isMobile, isTablet, particleCount]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      {interactions.map(interaction => (
        <MicroInteraction key={interaction.id} {...interaction} isMobile={isMobile} />
      ))}
    </div>
  );
});

// Premium Particle Background with optimized rendering
const ParticleBackground = React.memo(({ isMobile, isTablet }) => {
  const particleCount = isMobile ? 40 : isTablet ? 60 : 80;
  
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {Array.from({ length: particleCount }).map((_, i) => {
        const size = isMobile ? Math.random() * 2 + 1 : Math.random() * 3 + 1;
        const colors = ['#22c55e20', '#10b98120', '#34d39920', '#05966920'];
        
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
              willChange: 'transform',
              transform: 'translate3d(0,0,0)'
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * (isMobile ? 30 : 50)],
              y: [0, (Math.random() - 0.5) * (isMobile ? 30 : 50)],
              opacity: [0.1, 0.25, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: Math.random() * 4 + 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05,
              times: [0, 0.5, 1]
            }}
          />
        );
      })}
    </div>
  );
});

// Smooth scroll progress indicator
const ScrollProgress = React.memo(({ scrollYProgress }) => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 z-50 origin-left will-change-transform"
      style={{ 
        scaleX: scrollYProgress,
        transform: 'translate3d(0,0,0)',
        willChange: 'transform'
      }}
    />
  );
});

// Premium hover effect component
const PremiumHoverEffect = ({ children, isMobile }) => {
  const [hoverState, setHoverState] = useState({ x: 0, y: 0, active: false });
  
  const handleMouseMove = useCallback((e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverState({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    });
  }, [isMobile]);
  
  const handleMouseLeave = useCallback(() => {
    setHoverState(prev => ({ ...prev, active: false }));
  }, []);
  
  return (
    <div 
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {!isMobile && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          animate={{
            scale: hoverState.active ? 1 : 0,
            opacity: hoverState.active ? 0.4 : 0,
            x: hoverState.x - 60,
            y: hoverState.y - 60
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          style={{
            width: 120,
            height: 120,
            background: "radial-gradient(circle, rgba(34,197,94,0.3), rgba(16,185,129,0.1), transparent 70%)",
            filter: "blur(15px)",
            willChange: 'transform, opacity'
          }}
        />
      )}
    </div>
  );
};

export default function Home() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
  const [ripples, setRipples] = useState([]);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [scrollState, setScrollState] = useState({ velocity: 0, isScrolling: false });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [floatingIcons, setFloatingIcons] = useState([]);
  
  const deviceInfo = useDeviceDetection();
  const { isMobile, isTablet, isDesktop, reducedMotion } = deviceInfo;
  
  // Enhanced smooth scroll with momentum
  const { scrollY, scrollYProgress, scrollVelocity } = useMomentumScroll(isMobile, contentRef);
  
  // Track scroll state
  useEffect(() => {
    const unsubscribe = scrollVelocity.on("change", (latest) => {
      const velocity = Math.abs(latest);
      setScrollState({
        velocity,
        isScrolling: velocity > 0.5
      });
    });
    
    return () => unsubscribe();
  }, [scrollVelocity]);
  
  // Premium scroll animations
  const heroScale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 1],
    [1, 0.998, 0.995, 0.99, 0.98]
  );
  
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1, 0.95]
  );
  
  const heroY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, isMobile ? -15 : -30]
  );
  
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -80]
  );
  
  // Apply premium spring animations
  const heroScaleSpring = useSpring(heroScale, PREMIUM_SPRINGS.ultraSmooth);
  const heroYSpring = useSpring(heroY, PREMIUM_SPRINGS.smooth);
  const parallaxYSpring = useSpring(parallaxY, PREMIUM_SPRINGS.responsive);
  
  // Enhanced mouse tracking with smooth interpolation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    if (isMobile) return;
    
    let lastX = 0;
    let lastY = 0;
    let animationId;
    
    const updateMousePosition = () => {
      const currentX = mousePosition.x / window.innerWidth - 0.5;
      const currentY = mousePosition.y / window.innerHeight - 0.5;
      
      // Smooth interpolation
      lastX = lastX + (currentX - lastX) * 0.15;
      lastY = lastY + (currentY - lastY) * 0.15;
      
      mouseX.set(lastX);
      mouseY.set(lastY);
      
      animationId = requestAnimationFrame(updateMousePosition);
    };
    
    animationId = requestAnimationFrame(updateMousePosition);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [mousePosition, isMobile, mouseX, mouseY]);
  
  // Premium 3D effects
  const rotateY = useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [3, -3]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [-2, 2]);
  const parallaxX = useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [-15, 15]);
  const parallaxYMouse = useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [-12, 12]);
  
  const rotateYSpring = useSpring(rotateY, PREMIUM_SPRINGS.ultraSmooth);
  const rotateXSpring = useSpring(rotateX, PREMIUM_SPRINGS.ultraSmooth);
  const parallaxXSpring = useSpring(parallaxX, PREMIUM_SPRINGS.smooth);
  const parallaxYMouseSpring = useSpring(parallaxYMouse, PREMIUM_SPRINGS.smooth);
  
  // Premium ripple effect with optimized performance
  const handleInteraction = useCallback((e) => {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'SELECT' ||
      e.target.closest('button') ||
      e.target.closest('a')
    ) {
      return;
    }
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let clientX, clientY;
    if (e.type.includes('touch')) {
      const touch = e.touches?.[0] || e.changedTouches?.[0];
      if (!touch) return;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const colors = [
      'rgba(16, 185, 129, 0.8)',
      'rgba(52, 211, 153, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(5, 150, 105, 0.8)'
    ];
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: isMobile ? 0.8 : 1
    };
    
    setRipples(prev => [...prev.slice(-2), newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);
  }, [isMobile]);
  
  // Smooth mouse/touch movement
  const handleMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let clientX, clientY;
    if (e.type.includes('touch')) {
      const touch = e.touches[0];
      if (!touch) return;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setTouchPosition({ x, y });
    if (!isMobile) {
      setMousePosition({ x: clientX, y: clientY });
    }
  }, [isMobile]);
  
  // Memoized features data
  const features = useMemo(() => [
    { 
      title: "Scan Products", 
      desc: "Instant barcode scanning for food items and cosmetics.",
      icon: "📱",
      color: "#10B981"
    },
    { 
      title: "Health Score", 
      desc: "Get a clear score based on nutrition, additives, and ingredients.",
      icon: "⭐",
      color: "#059669"
    },
    { 
      title: "Privacy First", 
      desc: "No ads, no data sharing — your health, your control.",
      icon: "🔒",
      color: "#047857"
    },
    { 
      title: "Smart Insights", 
      desc: "AI-powered analysis of ingredients and nutrition facts.",
      icon: "🤖",
      color: "#7C3AED"
    },
    { 
      title: "Allergen Alert", 
      desc: "Instant warnings for common allergens and sensitivities.",
      icon: "⚠️",
      color: "#DC2626"
    },
    { 
      title: "Save History", 
      desc: "Track your scanning history and health progress.",
      icon: "📊",
      color: "#0EA5E9"
    }
  ], []);
  
  // Optimized ripple effects
  const RippleEffects = useMemo(() => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      <AnimatePresence>
        {ripples.map(ripple => (
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
              scale: [0, ripple.size * 3, ripple.size * 4],
              opacity: [0.9, 0.4, 0],
              width: [20, 140, 180],
              height: [20, 140, 180],
              x: [ripple.x - 10, ripple.x - 70, ripple.x - 90],
              y: [ripple.y - 10, ripple.y - 70, ripple.y - 90]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1,
              ease: PREMIUM_EASING.easeOutExpo
            }}
            style={{
              background: `radial-gradient(circle, ${ripple.color}, transparent 70%)`,
              filter: 'blur(10px)',
              mixBlendMode: 'screen',
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  ), [ripples]);
  
  // Touch trail with premium feel
  const TouchTrail = useMemo(() => (
    <motion.div
      className="absolute pointer-events-none rounded-full z-30"
      animate={{
        x: touchPosition.x - 5,
        y: touchPosition.y - 5,
        scale: scrollState.isScrolling ? 0.7 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 1200,
        damping: 70,
        mass: 0.2
      }}
      style={{
        width: 10,
        height: 10,
        background: "radial-gradient(circle, rgba(34,197,94,0.4), rgba(16,185,129,0.2))",
        border: '1.5px solid rgba(34,197,94,0.5)',
        filter: 'blur(0.5px)',
        willChange: 'transform'
      }}
    />
  ), [touchPosition, scrollState.isScrolling]);
  
  // Premium background animation
  const BackgroundAnimation = useMemo(() => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <Suspense fallback={null}>
        <InteractiveBackground isMobile={isMobile} isTablet={isTablet} />
        <ParticleBackground isMobile={isMobile} isTablet={isTablet} />
      </Suspense>
      
      {/* Premium gradient orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full"
        animate={{
          opacity: [0.08, 0.18, 0.08],
          scale: [1, 1.12, 1],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1]
        }}
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.2), rgba(34,197,94,0.15), transparent 70%)',
          filter: 'blur(100px)',
          willChange: 'transform, opacity'
        }}
      />
      
      <motion.div
        className="absolute -right-20 -bottom-20 w-[35rem] h-[35rem] rounded-full"
        animate={{
          opacity: [0.06, 0.14, 0.06],
          scale: [1, 1.08, 1],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          delay: 0.3
        }}
        style={{
          background: 'radial-gradient(circle, rgba(253,224,71,0.12), rgba(34,197,94,0.1), transparent 70%)',
          filter: 'blur(90px)',
          willChange: 'transform, opacity'
        }}
      />
    </div>
  ), [isMobile, isTablet]);
  
  // Main render
  return (
    <div 
      ref={containerRef}
      onClick={!reducedMotion ? handleInteraction : undefined}
      onTouchStart={!reducedMotion ? handleInteraction : undefined}
      onTouchMove={handleMove}
      onMouseMove={!isMobile ? handleMove : undefined}
      className="relative min-h-screen w-full flex flex-col bg-gradient-to-b from-white via-green-50/80 to-emerald-50/60 font-sans cursor-default overflow-hidden"
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        transform: 'translate3d(0,0,0)'
      }}
    >
      {/* Premium Scroll Progress */}
      <ScrollProgress scrollYProgress={scrollYProgress} />
      
      {/* Background Animations */}
      {BackgroundAnimation}
      
      {/* Interactive Effects */}
      {!reducedMotion && (
        <>
          {RippleEffects}
          {TouchTrail}
        </>
      )}
      
      {/* Smooth Scroll Container */}
      <div 
        ref={contentRef}
        className="relative z-10 flex-grow w-full overflow-visible"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}
      >
        {/* Main Content with Premium Animations */}
        <motion.div
          style={{ 
            scale: heroScaleSpring,
            opacity: heroOpacity
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: reducedMotion ? 0 : 0.8,
            ease: PREMIUM_EASING.easeOutExpo
          }}
          className="text-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 xl:px-12 font-sans w-full max-w-full relative"
        >
          {/* Premium Hero Section */}
          <motion.section
            style={{ 
              y: heroYSpring,
              rotateY: rotateYSpring,
              rotateX: rotateXSpring,
              x: parallaxXSpring,
              y: parallaxYMouseSpring
            }}
            className="max-w-7xl mx-auto mb-16 sm:mb-24 relative w-full"
          >
            <PremiumHoverEffect isMobile={isMobile}>
              <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16 w-full">
                {/* Premium Lottie Animation */}
                <motion.div
                  animate={{ 
                    y: [0, -12, 0]
                  }}
                  transition={{ 
                    duration: reducedMotion ? 0 : 4,
                    repeat: reducedMotion ? 0 : Infinity,
                    ease: "easeInOut",
                    times: [0, 0.5, 1]
                  }}
                  whileHover={!isMobile && !reducedMotion ? { 
                    scale: 1.05,
                    transition: { 
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }
                  } : undefined}
                  whileTap={{ scale: 0.98 }}
                  className={`${isMobile ? 'w-48 h-48' : isTablet ? 'w-64 h-64' : 'w-72 h-72'} flex-shrink-0 mx-auto lg:mx-0`}
                >
                  <div className={`relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-white to-green-50/50 ${isMobile ? 'shadow-xl' : 'shadow-2xl'} backdrop-blur-sm`}>
                    <Lottie 
                      animationData={kaedeAnim} 
                      loop={!reducedMotion}
                      className="absolute inset-0"
                    />
                  </div>
                </motion.div>

                {/* Premium Hero Text */}
                <motion.div
                  className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8 min-w-0"
                >
                  <div className="relative">
                    <motion.h1
                      className={`font-bold tracking-tight ${isMobile ? 'text-3xl sm:text-4xl' : isTablet ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl lg:text-7xl'}`}
                      animate={{
                        backgroundPosition: reducedMotion ? '0% 50%' : ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: reducedMotion ? 0 : 15,
                        repeat: reducedMotion ? 0 : Infinity,
                        ease: "linear"
                      }}
                      style={{
                        background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                        backgroundSize: '400% 400%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        willChange: 'background-position'
                      }}
                    >
                      Eat Smarter.
                      <br />
                      <span className="text-emerald-700">Live Better.</span>
                    </motion.h1>
                    
                    <motion.div
                      className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-4 ${isMobile ? 'h-0.5' : 'h-1'}`}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ 
                        duration: reducedMotion ? 0 : 1.5, 
                        delay: 0.5,
                        ease: PREMIUM_EASING.easeOutQuint
                      }}
                    />
                  </div>

                  <motion.p
                    animate={reducedMotion ? {} : { 
                      opacity: [0.9, 1, 0.9]
                    }}
                    transition={reducedMotion ? {} : { 
                      duration: 6, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`text-gray-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed ${isMobile ? 'text-base sm:text-lg' : isTablet ? 'text-lg' : 'text-xl'}`}
                  >
                    PureScan helps you scan food product barcodes and understand their 
                    nutritional value and health impact — instantly. 
                    <span className={`block mt-2 text-green-600 font-semibold ${isMobile ? 'text-sm' : ''}`}>
                      Your health companion in every scan.
                    </span>
                  </motion.p>

                  {/* Premium CTA Button */}
                  <motion.div
                    whileHover={!isMobile && !reducedMotion ? { 
                      scale: 1.05,
                      transition: { 
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }
                    } : undefined}
                    whileTap={{ 
                      scale: 0.95,
                      transition: { duration: 0.1 }
                    }}
                    className="relative inline-block"
                  >
                    <Link
                      to="/select-scan"
                      className={`group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-semibold hover:shadow-3xl transition-all duration-300 overflow-hidden ${isMobile ? 'px-6 py-3 text-base shadow-lg' : isTablet ? 'px-8 py-4 text-lg shadow-xl' : 'px-10 py-4 text-xl shadow-2xl'}`}
                    >
                      <motion.span
                        animate={reducedMotion ? {} : { rotate: [0, 360] }}
                        transition={reducedMotion ? {} : { 
                          duration: 20, 
                          repeat: Infinity, 
                          ease: "linear"
                        }}
                        className={isMobile ? 'text-xl' : 'text-2xl'}
                      >
                        🔍
                      </motion.span>
                      <span className="relative z-10">
                        {isMobile ? 'Start Scanning' : 'Start Scanning Now'}
                      </span>
                    </Link>
                  </motion.div>

                  {/* Mobile CTA */}
                  {isMobile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.5,
                        duration: 0.5
                      }}
                      className="mt-4"
                    >
                      <Link
                        to="/how-it-works"
                        className="text-green-600 font-medium text-sm flex items-center justify-center gap-1"
                      >
                        Learn how it works
                        <motion.span
                          animate={reducedMotion ? {} : { x: [0, 3, 0] }}
                          transition={reducedMotion ? {} : { 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          →
                        </motion.span>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </PremiumHoverEffect>
          </motion.section>

          {/* Premium Features Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ 
              once: true,
              amount: isMobile ? 0.1 : 0.2,
              margin: "100px"
            }}
            variants={{ 
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { 
                  staggerChildren: isMobile ? 0.08 : 0.12,
                  delayChildren: 0.2
                }
              }
            }}
            className={`grid ${isMobile ? 'grid-cols-1 gap-6' : isTablet ? 'grid-cols-2 gap-8' : 'grid-cols-3 gap-10 lg:gap-12'} max-w-7xl mx-auto mb-16 sm:mb-24 lg:mb-32 w-full`}
          >
            {features.slice(0, isMobile ? 3 : features.length).map((item, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { 
                    opacity: 0, 
                    y: 40,
                    scale: 0.9
                  },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                    transition: { 
                      type: "spring",
                      stiffness: 100,
                      damping: 25,
                      mass: 0.5,
                      delay: idx * 0.1
                    }
                  }
                }}
                whileHover={!isMobile && !reducedMotion ? {
                  y: -12,
                  scale: 1.03,
                  transition: { 
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                } : undefined}
                whileTap={{ 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
                className="group relative cursor-pointer w-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-white to-green-50/30 rounded-3xl shadow-lg backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-500 ${isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'}`} />
                
                <div className={`relative ${isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'} w-full`}>
                  {/* Animated Icon */}
                  <motion.div
                    whileHover={!isMobile && !reducedMotion ? { 
                      scale: 1.15,
                      rotate: [0, -5, 5, 0]
                    } : undefined}
                    transition={{ duration: 0.5 }}
                    className={`mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white to-green-100 flex items-center justify-center shadow-lg ${isMobile ? 'w-16 h-16' : isTablet ? 'w-20 h-20' : 'w-24 h-24'}`}
                  >
                    <motion.div
                      animate={reducedMotion ? {} : { 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={reducedMotion ? {} : { 
                        duration: 3, 
                        repeat: Infinity,
                        delay: idx * 0.2
                      }}
                      className={isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'}
                    >
                      {item.icon}
                    </motion.div>
                  </motion.div>
                  
                  <h3 className={`font-bold text-green-800 text-center mb-2 ${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'}`}>
                    {item.title}
                  </h3>
                  
                  <p className={`text-gray-600 text-center ${isMobile ? 'text-sm mb-2' : isTablet ? 'text-base mb-3' : 'leading-relaxed mb-4'}`}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Premium Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ 
              once: true, 
              margin: "100px" 
            }}
            transition={{ 
              duration: 0.6,
              ease: PREMIUM_EASING.easeOutExpo
            }}
            className="max-w-4xl mx-auto mb-16 sm:mb-24 w-full"
          >
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className={`font-bold text-center mb-8 ${isMobile ? 'text-xl' : 'text-2xl'} text-green-800 w-full`}>
                Trusted by Health-Conscious Users
              </h2>
            </motion.div>
            
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-8'} text-center w-full`}>
              {[
                { value: "10K+", label: "Products Scanned", color: "#10B981" },
                { value: "4.8★", label: "User Rating", color: "#059669" },
                { value: "100%", label: "Privacy Score", color: "#047857" },
                { value: "24/7", label: "Support", color: "#7C3AED" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm w-full"
                  initial={{ 
                    opacity: 0, 
                    y: 30,
                    scale: 0.9
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    scale: 1
                  }}
                  viewport={{ once: true }}
                  transition={{ 
                    type: "spring",
                    stiffness: 120,
                    damping: 25,
                    delay: idx * 0.1
                  }}
                  whileHover={!isMobile && !reducedMotion ? { 
                    y: -5,
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  } : undefined}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'} mb-2`}
                    style={{ color: stat.color }}
                    animate={reducedMotion ? {} : { 
                      scale: [1, 1.1, 1]
                    }}
                    transition={reducedMotion ? {} : { 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.3
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Premium Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "100px" }}
            transition={{ 
              duration: 0.8,
              ease: PREMIUM_EASING.easeOutExpo
            }}
            className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto rounded-3xl overflow-hidden mb-20 w-full"
          >
            {/* Premium Gradient Border */}
            <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 opacity-20">
              <div className="absolute inset-[2px] rounded-3xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20" />
            </div>
            
            <div className="relative z-10 text-center px-4">
              <motion.h2
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'} mb-4`}
                animate={reducedMotion ? {} : {
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={reducedMotion ? {} : {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Ready to Transform Your Health?
              </motion.h2>
              
              <motion.p
                className={`text-gray-600 mb-8 ${isMobile ? 'text-sm' : 'text-lg'} max-w-2xl mx-auto`}
                animate={reducedMotion ? {} : { opacity: [0.9, 1, 0.9] }}
                transition={reducedMotion ? {} : { duration: 4, repeat: Infinity }}
              >
                Join thousands who've made smarter choices with PureScan.
              </motion.p>
              
              <motion.div
                whileHover={!isMobile && !reducedMotion ? { 
                  scale: 1.05,
                  transition: { 
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }
                } : undefined}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
                className="inline-block"
              >
                <Link
                  to="/select-scan"
                  className={`group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:shadow-3xl transition-all duration-300 overflow-hidden ${isMobile ? 'px-6 py-3 text-base shadow-lg' : 'px-8 py-4 text-lg shadow-2xl'}`}
                >
                  <motion.span
                    animate={reducedMotion ? {} : { rotate: [0, 360] }}
                    transition={reducedMotion ? {} : { 
                      duration: 20, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                    className={isMobile ? 'text-xl' : 'text-2xl'}
                  >
                    ✨
                  </motion.span>
                  <span className="relative z-10">
                    Start Your Journey Today
                  </span>
                  <motion.span
                    animate={reducedMotion ? {} : { rotate: [0, 360] }}
                    transition={reducedMotion ? {} : { 
                      duration: 20, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                    className={isMobile ? 'text-xl' : 'text-2xl'}
                  >
                    ✨
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}