import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './FireBase';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
  AnimatePresence,
  useAnimationFrame
} from 'framer-motion';
import Particles from 'react-tsparticles';

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

// ULTRA OPTIMIZED Micro Interaction Component - No re-renders
const MicroInteraction = React.memo(({ type, x, y, color, isMobile }) => {
  const animationRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (type === 'sparkle') {
    return (
      <motion.div
        className="absolute pointer-events-none will-change-transform"
        initial={{ x, y, scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 0],
          opacity: [0, 1, 0],
          rotate: isMobile ? 90 : 180
        }}
        transition={{ 
          duration: isMobile ? 0.4 : 0.6,
          ease: "easeInOut"
        }}
        style={{
          width: isMobile ? '16px' : '20px',
          height: isMobile ? '16px' : '20px',
          background: `radial-gradient(circle, ${color}60, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />
    );
  }
  
  if (type === 'pulse') {
    return (
      <motion.div
        className="absolute pointer-events-none rounded-full will-change-transform"
        initial={{ 
          x: x - (isMobile ? 10 : 15), 
          y: y - (isMobile ? 10 : 15), 
          scale: 0, 
          opacity: 0.7 
        }}
        animate={{
          scale: [0, 1.5],
          opacity: [0.7, 0]
        }}
        transition={{ 
          duration: isMobile ? 0.6 : 0.8,
          ease: "easeOut"
        }}
        style={{
          width: isMobile ? '24px' : '30px',
          height: isMobile ? '24px' : '30px',
          background: color,
          filter: 'blur(4px)',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />
    );
  }
  
  return null;
});

// ULTRA OPTIMIZED Interactive Background - Fixed performance
const InteractiveBackground = React.memo(({ isMobile }) => {
  const [interactions, setInteractions] = useState([]);
  const lastUpdateRef = useRef(0);
  const frameRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const generateInteraction = () => {
      if (!isMountedRef.current || interactions.length >= (isMobile ? 4 : 8)) return;
      
      const now = Date.now();
      if (now - lastUpdateRef.current < (isMobile ? 1200 : 800)) return;
      
      lastUpdateRef.current = now;
      const type = Math.random() > 0.5 ? 'sparkle' : 'pulse';
      const colors = ['#10B981', '#34D399', '#22C55E', '#059669'];
      
      setInteractions(prev => {
        const newInt = {
          id: now,
          type,
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
        
        const filtered = prev.filter(int => now - int.id < 2000);
        return [...filtered.slice(-(isMobile ? 3 : 5)), newInt];
      });
    };

    const animate = () => {
      if (!isMountedRef.current) return;
      
      frameRef.current = requestAnimationFrame(animate);
      
      if (Math.random() > 0.7) {
        generateInteraction();
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      isMountedRef.current = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isMobile]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {interactions.map(interaction => (
          <MicroInteraction 
            key={`${interaction.id}-${interaction.type}`}
            {...interaction} 
            isMobile={isMobile} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

// ULTRA OPTIMIZED Floating Icon Component
const FloatingIcon = React.memo(({ icon, color, initialX, initialY, delay, isMobile }) => {
  const animationRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className="absolute pointer-events-none will-change-transform"
      initial={{ x: initialX, y: initialY, scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1, 1, 0],
        opacity: [0, 1, 1, 0],
        y: [initialY, initialY - (isMobile ? 60 : 100)],
        rotate: [0, isMobile ? 180 : 360]
      }}
      transition={{
        duration: isMobile ? 3 : 4,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 10 + 5,
        ease: "easeInOut"
      }}
      style={{
        color,
        fontSize: isMobile ? '18px' : '24px',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    >
      {icon}
    </motion.div>
  );
});

// ULTRA OPTIMIZED Ripple Component - GPU accelerated
const RippleEffect = React.memo(({ ripple }) => {
  const size = ripple.isMobile ? 30 : 40;
  const endSize = ripple.isMobile ? 140 : 200;
  
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full will-change-transform"
      initial={{
        scale: 0,
        opacity: 0.7,
        x: ripple.x - size/2,
        y: ripple.y - size/2,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${ripple.color}, ${ripple.color.replace('0.6', '0.2')})`
      }}
      animate={{
        scale: [0, ripple.isMobile ? 3 : 4, ripple.isMobile ? 3.5 : 5],
        opacity: [0.7, 0.3, 0],
        width: [size, endSize * 0.8, endSize],
        height: [size, endSize * 0.8, endSize],
        x: [
          ripple.x - size/2, 
          ripple.x - (endSize * 0.8)/2, 
          ripple.x - endSize/2
        ],
        y: [
          ripple.y - size/2, 
          ripple.y - (endSize * 0.8)/2, 
          ripple.y - endSize/2
        ]
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: ripple.isMobile ? 0.9 : 1.2,
        ease: "easeOut"
      }}
      style={{
        filter: `blur(${ripple.isMobile ? 8 : 12}px)`,
        mixBlendMode: "screen",
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    />
  );
});

// MAIN COMPONENT - ULTRA OPTIMIZED
const Signup = () => {
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Animation states
  const [ripples, setRipples] = useState([]);
  const [hoverGlow, setHoverGlow] = useState({ x: 0, y: 0, active: false });
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs for performance
  const containerRef = useRef(null);
  const rippleTimerRef = useRef(null);
  const resizeTimerRef = useRef(null);
  const mouseMoveTimerRef = useRef(null);
  const isTouchingRef = useRef(false);
  const navigate = useNavigate();
  
  // Motion values for smooth animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const trailX = useMotionValue(0);
  const trailY = useMotionValue(0);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);

  // 🔥 ULTRA OPTIMIZED Mobile Detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      const changed = mobile !== isMobile;
      if (changed) {
        setIsMobile(mobile);
      }
    };
    
    checkMobile();
    
    const handleResize = () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      resizeTimerRef.current = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, [isMobile]);

  // 🔥 ULTRA OPTIMIZED Scroll Animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, isMobile ? 0.98 : 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, isMobile ? 0.9 : 0.8]);
  const heroScaleSpring = useSpring(heroScale, { 
    stiffness: isMobile ? 180 : 200, 
    damping: isMobile ? 40 : 35,
    mass: 0.8
  });

  // 🔥 ULTRA OPTIMIZED Ripple Handler
  const handleInteraction = useCallback((e) => {
    const target = e.target;
    
    // Skip if interacting with form elements
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName) || 
        target.closest('button') || 
        target.closest('a')) {
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

    // Update trail position
    trailX.set(x - (isMobile ? 6 : 8));
    trailY.set(y - (isMobile ? 6 : 8));

    // Create ripple
    const colors = [
      'rgba(16, 185, 129, 0.6)',
      'rgba(52, 211, 153, 0.6)',
      'rgba(34, 197, 94, 0.6)',
      'rgba(5, 150, 105, 0.6)'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      color,
      isMobile
    };

    setRipples(prev => {
      const filtered = prev.filter(r => Date.now() - r.id < 1500);
      return [...filtered.slice(-4), newRipple];
    });
  }, [isMobile, trailX, trailY]);

  // 🔥 ULTRA OPTIMIZED Move Handler with Throttling
  const handleMove = useCallback((e) => {
    if (mouseMoveTimerRef.current) {
      cancelAnimationFrame(mouseMoveTimerRef.current);
    }
    
    mouseMoveTimerRef.current = requestAnimationFrame(() => {
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
      
      // Update trail position
      trailX.set(x - (isMobile ? 6 : 8));
      trailY.set(y - (isMobile ? 6 : 8));
      
      // Update glow for desktop
      if (!isMobile) {
        glowX.set(x - 60);
        glowY.set(y - 60);
        setHoverGlow(prev => ({ ...prev, active: true }));
      }
    });
  }, [isMobile, glowX, glowY, trailX, trailY]);

  // 🔥 ULTRA OPTIMIZED Desktop Mouse Effects
  useEffect(() => {
    if (isMobile) return;

    let animationFrameId;
    
    const onMove = (e) => {
      animationFrameId = requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        
        mouseX.set(nx);
        mouseY.set(ny);
        
        cardX.set(nx * 15);
        cardY.set(ny * 10);
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(animationFrameId);
      
      animate(mouseX, 0, { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        mass: 0.5
      });
      animate(mouseY, 0, { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        mass: 0.5
      });
      animate(cardX, 0, { 
        type: "spring", 
        stiffness: 90, 
        damping: 15,
        mass: 0.5
      });
      animate(cardY, 0, { 
        type: "spring", 
        stiffness: 90, 
        damping: 15,
        mass: 0.5
      });
      
      setHoverGlow(prev => ({ ...prev, active: false }));
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener("pointermove", onMove, { passive: true });
      node.addEventListener("pointerleave", onLeave, { passive: true });
    }
    
    return () => {
      if (node) {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, mouseX, mouseY, cardX, cardY]);

  // 🔥 OPTIMIZED 3D Rotation for Card
  const rotateY = useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [2, -2]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [-1.5, 1.5]);
  const rotateYSpring = useSpring(rotateY, { 
    stiffness: 200, 
    damping: 25,
    mass: 0.7 
  });
  const rotateXSpring = useSpring(rotateX, { 
    stiffness: 200, 
    damping: 25,
    mass: 0.7 
  });

  // 🔥 ULTRA OPTIMIZED Particle Options
  const particleOptions = useMemo(() => ({
    background: { color: { value: "transparent" } },
    fpsLimit: isMobile ? 30 : 60,
    particles: {
      number: { 
        value: isMobile ? 20 : 40, // Reduced for performance
        density: { 
          enable: true, 
          value_area: isMobile ? 300 : 500 
        } 
      },
      color: { 
        value: ["#22c55e", "#10b981", "#34d399", "#059669"],
        animation: {
          enable: false // Disabled for performance
        }
      },
      shape: { 
        type: "circle" 
      },
      opacity: { 
        value: isMobile ? 0.08 : 0.12,
        random: false, // Disabled for performance
        animation: {
          enable: false // Disabled for performance
        }
      },
      size: { 
        value: isMobile ? 1.5 : 2,
        random: false // Disabled for performance
      },
      move: {
        enable: true,
        speed: isMobile ? 0.2 : 0.3,
        direction: "none",
        random: false, // Disabled for performance
        straight: false,
        outModes: {
          default: "out"
        },
        attract: {
          enable: false // Disabled for performance
        }
      }
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: {
          enable: !isMobile,
          mode: "repulse",
          parallax: {
            enable: false // Disabled for performance
          }
        },
        onClick: {
          enable: true,
          mode: "push"
        },
        resize: {
          enable: true,
          delay: 0,
          speed: 1
        }
      },
      modes: {
        repulse: {
          distance: isMobile ? 30 : 50,
          duration: 0.4
        },
        push: {
          quantity: 2
        }
      }
    },
    detectRetina: true,
    smooth: true,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true
  }), [isMobile]);

  // 🔥 OPTIMIZED Floating Icons Config
  const floatingIconsConfig = useMemo(() => [
    {icon: '🍏', color: '#10B981', x: -30, y: -20},
    {icon: '🥦', color: '#34D399', x: 40, y: -10},
    {icon: '🔒', color: '#22C55E', x: 20, y: 30},
    {icon: '📱', color: '#059669', x: -20, y: 35}
  ], []);

  // 🔥 Cleanup Ripples Effectively
  useEffect(() => {
    const cleanupRipples = () => {
      setRipples(prev => prev.filter(r => Date.now() - r.id < 1200));
    };
    
    rippleTimerRef.current = setInterval(cleanupRipples, 300);
    
    return () => {
      if (rippleTimerRef.current) {
        clearInterval(rippleTimerRef.current);
      }
      if (mouseMoveTimerRef.current) {
        cancelAnimationFrame(mouseMoveTimerRef.current);
      }
    };
  }, []);

  // 🔥 Signup Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', userCredential.user);
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error.message);
      alert(error.message);
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchMove={handleMove}
      onMouseMove={!isMobile ? handleMove : undefined}
      onMouseLeave={() => !isMobile && setHoverGlow(prev => ({ ...prev, active: false }))}
      onTouchEnd={() => isMobile && setHoverGlow(prev => ({ ...prev, active: false }))}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50/80 to-emerald-50/60 overflow-hidden font-sans cursor-default touch-manipulation"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-y pinch-zoom',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* Interactive Background Layer */}
      <InteractiveBackground isMobile={isMobile} />
      
      {/* OPTIMIZED Particle Background */}
      <Particles
        className="absolute inset-0 -z-10"
        options={particleOptions}
        key={`particles-${isMobile}`}
        init={async (engine) => {
          const { loadSlim } = await import("tsparticles-slim");
          await loadSlim(engine);
        }}
      />

      {/* Ripple Effects Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30 will-change-transform">
        <AnimatePresence>
          {ripples.map(ripple => (
            <RippleEffect 
              key={`ripple-${ripple.id}`} 
              ripple={ripple} 
            />
          ))}
        </AnimatePresence>

        {/* Hover Glow (Desktop only) */}
        {!isMobile && (
          <motion.div
            className="absolute pointer-events-none rounded-full will-change-transform"
            animate={{
              scale: hoverGlow.active ? 1 : 0,
              opacity: hoverGlow.active ? 0.2 : 0
            }}
            style={{
              x: glowX,
              y: glowY,
              width: 120,
              height: 120,
              background: "radial-gradient(circle, rgba(34,197,94,0.3), rgba(16,185,129,0.1), transparent 70%)",
              filter: "blur(15px)",
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 20,
              mass: 0.3
            }}
          />
        )}

        {/* Touch/Mouse Trail Effect */}
        <motion.div
          className="absolute pointer-events-none rounded-full will-change-transform"
          style={{
            x: trailX,
            y: trailY,
            width: isMobile ? 12 : 16,
            height: isMobile ? 12 : 16,
            background: "radial-gradient(circle, rgba(34,197,94,0.15), rgba(16,185,129,0.03))",
            border: `1px solid rgba(34,197,94,${isMobile ? 0.15 : 0.2})`,
            filter: 'blur(0.5px)',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
      </div>

      {/* Background Orbs - OPTIMIZED */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full pointer-events-none will-change-transform"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.12,
              scale: [1, 1.08, 1],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            style={{ transform: 'translateZ(0)' }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-300/40 via-emerald-300/30 to-teal-200/30 blur-[80px]" />
          </motion.div>

          <motion.div
            className="absolute -right-20 -bottom-20 w-[25rem] h-[25rem] rounded-full pointer-events-none will-change-transform"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.1,
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            style={{ transform: 'translateZ(0)' }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200/30 via-emerald-200/20 to-green-300/20 blur-[60px]" />
          </motion.div>
        </>
      )}

      {/* Main Content Container */}
      <motion.div
        style={{ 
          scale: heroScaleSpring,
          opacity: heroOpacity
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4 will-change-transform"
      >
        {/* Signup Card */}
        <motion.div
          style={{ 
            rotateY: rotateYSpring,
            rotateX: rotateXSpring,
            x: cardX,
            y: cardY
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative group will-change-transform"
        >
          {/* Card Background Glow */}
          <motion.div
            className="absolute -inset-3 -z-10 rounded-3xl will-change-transform"
            animate={{
              opacity: [0.08, 0.15, 0.08],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: "radial-gradient(circle at center, rgba(34,197,94,0.12), transparent 70%)",
              filter: "blur(20px)",
              transform: 'translateZ(0)'
            }}
          />

          {/* Main Card */}
          <div className="relative bg-white/85 backdrop-blur-sm rounded-2xl border border-green-100/50 shadow-xl p-6 sm:p-8">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <Typography variant="heading" as={motion.h2}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="font-bold text-3xl sm:text-4xl mb-3 select-none"
                style={{
                  background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased'
                }}
              >
                Create Your Account
              </Typography>
              
              <Typography variant="body" as={motion.p}
                animate={{ 
                  opacity: [0.7, 0.9, 0.7],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-gray-600 text-sm sm:text-base select-none"
              >
                Start your health journey with us
              </Typography>
              
              {/* Underline */}
              <motion.div
                className="h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mt-3"
                initial={{ width: 0 }}
                animate={{ width: "100px" }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
            </motion.div>

            {/* FORM */}
            <form className="space-y-5" onSubmit={handleSignup}>
              {/* Name Input */}
              <div className="space-y-1">
                <Typography variant="accent" className="block text-sm font-medium text-gray-700 select-none">
                  Full Name
                </Typography>
                <motion.input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  whileFocus={{ 
                    boxShadow: "0px 0px 0px 2px rgba(34,197,94,0.2)",
                    borderColor: "#22C55E"
                  }}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg 
                  focus:outline-none transition-all duration-300
                  hover:border-green-300 focus:border-green-400
                  bg-white/95 backdrop-blur-sm"
                  style={TYPOGRAPHY_CONFIG.body}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <Typography variant="accent" className="block text-sm font-medium text-gray-700 select-none">
                  Email Address
                </Typography>
                <motion.input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  whileFocus={{ 
                    boxShadow: "0px 0px 0px 2px rgba(34,197,94,0.2)",
                    borderColor: "#22C55E"
                  }}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg 
                  focus:outline-none transition-all duration-300
                  hover:border-green-300 focus:border-green-400
                  bg-white/95 backdrop-blur-sm"
                  style={TYPOGRAPHY_CONFIG.body}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <Typography variant="accent" className="block text-sm font-medium text-gray-700 select-none">
                  Password
                </Typography>
                <motion.input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  whileFocus={{ 
                    boxShadow: "0px 0px 0px 2px rgba(34,197,94,0.2)",
                    borderColor: "#22C55E"
                  }}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg 
                  focus:outline-none transition-all duration-300
                  hover:border-green-300 focus:border-green-400
                  bg-white/95 backdrop-blur-sm"
                  style={TYPOGRAPHY_CONFIG.body}
                />
              </div>

              {/* Signup Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0px 6px 20px rgba(5, 150, 105, 0.3)"
                }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md transition-all duration-300 hover:from-green-700 hover:to-emerald-700 active:scale-95 select-none touch-manipulation"
                style={{
                  ...TYPOGRAPHY_CONFIG.button,
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                Create Account
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6 select-none">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <Typography variant="body" className="px-3 bg-white text-gray-500">
                  Already have an account?
                </Typography>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <div className="text-sm text-gray-600">
                <Link
                  to="/login"
                  className="text-green-700 font-semibold hover:text-green-800 inline-flex items-center gap-1 group relative select-none touch-manipulation"
                  style={{ 
                    ...TYPOGRAPHY_CONFIG.button,
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <span>Login to your account</span>
                  <motion.span
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-green-600"
                  >
                    →
                  </motion.span>
                </Link>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 text-center">
              <Typography variant="body" className="text-xs text-gray-500 select-none">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-green-600 hover:underline touch-manipulation">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-green-600 hover:underline touch-manipulation">
                  Privacy Policy
                </Link>
              </Typography>
            </div>
          </div>

          {/* Floating Icons (Desktop only) */}
          {!isMobile && (
            <div className="absolute -top-4 -right-4 -bottom-4 -left-4 pointer-events-none">
              {floatingIconsConfig.map((item, idx) => (
                <FloatingIcon
                  key={`float-${idx}`}
                  icon={item.icon}
                  color={item.color}
                  initialX={item.x}
                  initialY={item.y}
                  delay={idx * 0.3}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default React.memo(Signup);