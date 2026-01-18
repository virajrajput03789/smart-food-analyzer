// Ultra Optimized Privacy Policy Component with Zero Lag
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
  AnimatePresence
} from "framer-motion";
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

// Performance Monitoring Hook (Dev only)
const usePerformanceMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      let frameCount = 0;
      let lastTime = performance.now();
      
      const checkFPS = () => {
        frameCount++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          if (fps < 50) {
            console.warn(`Performance Warning: FPS dropped to ${fps}`);
          }
          frameCount = 0;
          lastTime = currentTime;
        }
        requestAnimationFrame(checkFPS);
      };
      
      requestAnimationFrame(checkFPS);
    }
  }, []);
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

// Optimized Interactive Background
const InteractiveBackground = React.memo(({ isMobile }) => {
  const [interactions, setInteractions] = useState([]);
  
  useEffect(() => {
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
  }, [isMobile]);
  
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setInteractions(prev => prev.filter(int => Date.now() - int.id < 2000));
    }, 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
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

// Optimized Section Component
const Section = React.memo(({ title, children, isMobile, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
          type: "spring",
          stiffness: isMobile ? 80 : 100,
          damping: isMobile ? 25 : 20,
          delay: index * 0.1,
          mass: 0.5
        }
      }}
      viewport={{ once: true, margin: "-50px" }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      whileHover={!isMobile ? {
        y: -10,
        scale: 1.02,
        boxShadow: "0px 25px 70px rgba(16,185,129,0.25)",
        transition: { type: "spring", stiffness: 200, damping: 15, mass: 0.3 }
      } : undefined}
      whileTap={isMobile ? { scale: 0.98 } : undefined}
      className="group relative cursor-pointer mb-6 will-change-transform"
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Card Background with Hover Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl gpu-accelerated"
        animate={isHovered && !isMobile ? {
          background: [
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(220,252,231,0.7) 100%)",
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(187,247,208,0.8) 100%)",
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(220,252,231,0.7) 100%)"
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white to-green-50/30 backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-300 rounded-2xl" />
      </motion.div>
      
      {/* Animated Glow on Hover */}
      {!isMobile && (
        <motion.div
          className="absolute -inset-4 -z-10 rounded-2xl"
          animate={isHovered ? {
            opacity: 0.6,
            scale: 1.05,
          } : {
            opacity: 0,
            scale: 1
          }}
          transition={{ duration: 0.4 }}
          style={{
            background: `radial-gradient(circle at center, #10B98140, transparent 70%)`,
            filter: 'blur(25px)',
            transform: 'translateZ(0)'
          }}
        />
      )}
      
      {/* Floating Icons on Hover */}
      {!isMobile && isHovered && (
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
          whileHover={!isMobile ? { x: 5 } : undefined}
        >
          <motion.div
            className="w-2 h-6 sm:h-8 rounded-full bg-gradient-to-b from-green-500 to-emerald-500 will-change-transform"
            animate={isHovered && !isMobile ? {
              scaleY: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ transform: 'translateZ(0)' }}
          />
          <motion.h2 
            animate={isHovered && !isMobile ? {
              scale: 1.03,
              x: 3,
            } : {}}
            className="font-bold text-green-800 text-lg sm:text-xl"
          >
            {title}
          </motion.h2>
        </motion.div>
        
        {/* Section Content */}
        <motion.div 
          className="text-gray-600 leading-relaxed text-sm sm:text-base"
          animate={isHovered && !isMobile ? {
            x: 3,
            color: "#374151"
          } : {}}
        >
          {typeof children === "string" ? (
            <p className="hover:text-green-700 transition-colors duration-300">{children}</p>
          ) : (
            <ul className="list-disc pl-5 sm:pl-6 space-y-1 sm:space-y-2">
              {React.Children.map(children, (child, idx) => (
                <motion.li
                  key={idx}
                  className="hover:text-green-700 transition-colors duration-300"
                  whileHover={!isMobile ? {
                    x: 3,
                    scale: 1.01
                  } : undefined}
                  style={{ transform: 'translateZ(0)' }}
                >
                  {child}
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
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

// Optimized AnimatePresence Wrapper
const OptimizedAnimatePresence = React.memo(({ children, isMobile }) => (
  <AnimatePresence mode="wait">
    {React.Children.map(children, child => 
      React.isValidElement(child) ? React.cloneElement(child, { isMobile }) : child
    )}
  </AnimatePresence>
));

OptimizedAnimatePresence.displayName = 'OptimizedAnimatePresence';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const PrivacyPolicy = () => {
  usePerformanceMonitor();
  
  const containerRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const [hoverGlow, setHoverGlow] = useState({ x: 0, y: 0, active: false });
  const [isMobile, setIsMobile] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [cardHover, setCardHover] = useState(false);
  
  // Refs for performance optimization
  const animationFrameRef = useRef(null);
  const lastInteractionTime = useRef(0);
  const interactionThrottleDelay = useRef(150); // ms between interactions
  const lastResizeTime = useRef(0);
  const lastSparkleTime = useRef(0);

  // Optimized mobile detection with throttling
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      }
    };
    
    checkMobile();
    
    const handleResize = () => {
      const now = Date.now();
      if (now - lastResizeTime.current > 200) {
        lastResizeTime.current = now;
        checkMobile();
      }
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile]);

  // Enhanced mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Optimized scroll animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, isMobile ? 0.98 : 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, isMobile ? 0.9 : 0.8]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -20 : -40]);
  
  const contentYSpring = useSpring(contentY, { 
    stiffness: isMobile ? 150 : 180, 
    damping: isMobile ? 32 : 28,
    mass: 0.5
  });
  const heroScaleSpring = useSpring(heroScale, { 
    stiffness: isMobile ? 180 : 200, 
    damping: isMobile ? 40 : 35,
    mass: 0.5
  });

  // Optimized ripple effect handler with throttling
  const handleInteraction = useCallback((e) => {
    const now = Date.now();
    if (now - lastInteractionTime.current < interactionThrottleDelay.current) return;
    lastInteractionTime.current = now;
    
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'SELECT' ||
      e.target.closest('button') ||
      e.target.closest('a') ||
      e.target.closest('[data-no-ripple]')
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
      'rgba(16, 185, 129, 0.6)',
      'rgba(52, 211, 153, 0.6)',
      'rgba(34, 197, 94, 0.6)',
      'rgba(5, 150, 105, 0.6)'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newRipple = {
      id: Date.now(),
      x,
      y,
      color,
      type: 'ripple',
      isMobile
    };

    setRipples(prev => {
      const newRipples = [...prev, newRipple];
      return newRipples.slice(-(isMobile ? 4 : 6));
    });

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, isMobile ? 900 : 1200);
  }, [isMobile]);

  // Optimized move handler with requestAnimationFrame
  const handleMove = useCallback((e) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      let clientX, clientY;
      if (e.type.includes('touch')) {
        const touch = e.touches?.[0];
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
        setHoverGlow({ x, y, active: true });
        
        // Create sparkles on mouse move occasionally
        const now = Date.now();
        if (now - lastSparkleTime.current > 300 && Math.random() > 0.8) {
          lastSparkleTime.current = now;
          const colors = ['#10B981', '#34D399', '#22C55E'];
          const sparkle = {
            id: Date.now(),
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'sparkle',
            isMobile: false
          };
          
          setRipples(prev => [...prev.slice(-8), sparkle]);
          
          setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== sparkle.id));
          }, 600);
        }
      }
    });
  }, [isMobile]);

  // Optimized mouse effects for desktop
  useEffect(() => {
    if (isMobile) return;

    let isCancelled = false;

    const onMove = (e) => {
      if (isCancelled) return;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || isCancelled) return;
        
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        
        mouseX.set(nx);
        mouseY.set(ny);
      });
    };

    const onLeave = () => {
      animate(mouseX, 0, { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        mass: 0.3 
      });
      animate(mouseY, 0, { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        mass: 0.3 
      });
      setHoverGlow(prev => ({ ...prev, active: false }));
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener("pointermove", onMove, { passive: true });
      node.addEventListener("pointerleave", onLeave);
    }
    
    return () => {
      isCancelled = true;
      if (node) {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile, mouseX, mouseY]);

  // Optimized Particle options with slim loader
  const particleOptions = useMemo(() => ({
    fpsLimit: isMobile ? 30 : 60,
    particles: {
      number: { 
        value: isMobile ? 35 : 50,
        density: { 
          enable: true, 
          value_area: isMobile ? 500 : 700 
        } 
      },
      color: { 
        value: ["#22c55e", "#10b981", "#34d399", "#059669"] 
      },
      shape: { 
        type: "circle" 
      },
      opacity: { 
        value: isMobile ? 0.12 : 0.15,
        random: true,
        animation: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.05
        }
      },
      size: { 
        value: isMobile ? 2 : 2.5,
        random: true,
        animation: {
          enable: isMobile ? false : true,
          speed: 2,
          minimumValue: 1
        }
      },
      move: {
        enable: true,
        speed: isMobile ? 0.3 : 0.4,
        direction: "none",
        random: true,
        straight: false,
        outMode: "bounce",
      },
      collisions: {
        enable: false
      }
    },
    interactivity: {
      events: {
        onhover: { 
          enable: !isMobile, 
          mode: "repulse",
          parallax: { enable: false }
        },
        onclick: { 
          enable: true, 
          mode: "push" 
        }
      },
      modes: {
        repulse: {
          distance: isMobile ? 40 : 60,
          duration: 0.4
        },
        push: {
          quantity: 2
        }
      }
    },
    detectRetina: true,
    background: {
      color: "transparent"
    }
  }), [isMobile]);

  // Event handlers with passive listeners
  const handleContainerClick = useCallback((e) => {
    handleInteraction(e);
  }, [handleInteraction]);

  const handleContainerTouchStart = useCallback((e) => {
    e.preventDefault();
    handleInteraction(e);
  }, [handleInteraction]);

  const handleContainerTouchMove = useCallback((e) => {
    e.preventDefault();
    handleMove(e);
  }, [handleMove]);

  const handleContainerMouseMove = useCallback((e) => {
    if (!isMobile) handleMove(e);
  }, [handleMove, isMobile]);

  const handleContainerMouseLeave = useCallback(() => {
    if (!isMobile) setHoverGlow(prev => ({ ...prev, active: false }));
  }, [isMobile]);

  const handleContainerTouchEnd = useCallback(() => {
    if (isMobile) setHoverGlow(prev => ({ ...prev, active: false }));
  }, [isMobile]);

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

  // Cleanup ripples efficiently
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setRipples(prev => prev.filter(r => now - r.id < 1000));
    }, 500);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
      onTouchStart={handleContainerTouchStart}
      onTouchMove={handleContainerTouchMove}
      onMouseMove={handleContainerMouseMove}
      onMouseLeave={handleContainerMouseLeave}
      onTouchEnd={handleContainerTouchEnd}
      className="relative min-h-screen flex flex-col bg-gradient-to-b from-white via-green-50/80 to-emerald-50/60 overflow-hidden font-sans cursor-default px-4 sm:px-6 performance-optimized"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-y',
        overscrollBehavior: 'none'
      }}
    >
      {/* Interactive Background Layer */}
      <InteractiveBackground isMobile={isMobile} />
      
      {/* Optimized Particle Background with Slim */}
      <Particles
        className="absolute inset-0 -z-10 gpu-accelerated"
        init={async (engine) => {
          await loadSlim(engine);
        }}
        options={particleOptions}
        key={`particles-${isMobile}`}
      />

      {/* Ripple Effects Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        <OptimizedAnimatePresence isMobile={isMobile}>
          {ripples.map(ripple => (
            <RippleEffect key={ripple.id} ripple={ripple} />
          ))}
        </OptimizedAnimatePresence>

        {/* Hover Glow (Desktop only) */}
        {!isMobile && (
          <motion.div
            className="absolute pointer-events-none rounded-full will-change-transform"
            animate={{
              scale: hoverGlow.active ? 1 : 0,
              opacity: hoverGlow.active ? 0.2 : 0,
              x: hoverGlow.x - 60,
              y: hoverGlow.y - 60
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 20,
              mass: 0.2
            }}
            style={{
              width: 120,
              height: 120,
              background: "radial-gradient(circle, rgba(34,197,94,0.3), rgba(16,185,129,0.1), transparent 70%)",
              filter: "blur(15px)",
              transform: 'translateZ(0)'
            }}
          />
        )}

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

      {/* Background Orbs */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full pointer-events-none gpu-accelerated"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.12,
              scale: [1, 1.05, 1],
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
            className="absolute -right-20 -bottom-20 w-[25rem] h-[25rem] rounded-full pointer-events-none gpu-accelerated"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.1,
              scale: [1, 1.03, 1],
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

      {/* Main Content */}
      <div className="relative z-10 flex-grow py-8 sm:py-12">
        <motion.div
          style={{ 
            scale: heroScaleSpring,
            opacity: heroOpacity,
            y: contentYSpring
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-gray-900"
          onMouseEnter={() => !isMobile && setCardHover(true)}
          onMouseLeave={() => !isMobile && setCardHover(false)}
        >
          {/* Hero Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-8 sm:mb-12 relative"
          >
            {/* Hero Background Glow */}
            {!isMobile && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-3xl"
                animate={cardHover ? {
                  opacity: [0.15, 0.25, 0.15],
                  scale: [1, 1.05, 1]
                } : {
                  opacity: [0.1, 0.2, 0.1],
                  scale: [1, 1.02, 1]
                }}
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
              whileHover={!isMobile ? { 
                scale: 1.01,
                transition: { duration: 0.3 }
              } : undefined}
            >
              <motion.h1
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
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
              >
                Privacy Policy
              </motion.h1>
              
              {/* Animated Underline */}
              <motion.div
                className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-6 sm:mb-8 ${isMobile ? 'h-0.5' : 'h-1'}`}
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              
              <motion.p
                animate={{ 
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`text-gray-700 max-w-2xl mx-auto leading-relaxed ${isMobile ? 'text-base' : 'text-lg sm:text-xl'}`}
              >
                We value your privacy. This policy explains what data we collect, 
                how we use it, and your rights.
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
              >
                {Array.isArray(section.content) ? (
                  section.content.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))
                ) : (
                  section.content
                )}
              </Section>
            ))}
          </motion.div>

          {/* Back to Home Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8 sm:mt-12"
          >
            <motion.div
              whileHover={!isMobile ? { scale: 1.03 } : undefined}
              whileTap={{ scale: 0.97 }}
              className="relative inline-block"
            >
              <Link
                to="/"
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 overflow-hidden px-8 py-3 sm:px-10 sm:py-4 shadow-lg will-change-transform"
                style={{ transform: 'translateZ(0)' }}
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-xl sm:text-2xl"
                >
                  ←
                </motion.span>
                <span className="relative z-10 text-sm sm:text-base">Back to Home</span>
                
                {/* Button Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    opacity: [0.2, 0.3, 0.2],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)",
                    filter: `blur(${isMobile ? 8 : 10}px)`,
                    transform: 'translateZ(0)'
                  }}
                />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;