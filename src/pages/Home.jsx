import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
  AnimatePresence
} from "framer-motion";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import kaedeAnim from "../assets/kaede.json";
import Particles from "react-tsparticles";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

// Mobile-optimized Floating Icon Component
const FloatingIcon = ({ icon, color, initialX, initialY, delay, isMobile }) => (
  <motion.div
    className="absolute pointer-events-none"
    initial={{ x: initialX, y: initialY, scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1, 1, 0],
      opacity: [0, 1, 1, 0],
      y: [initialY, initialY - (isMobile ? 60 : 100)],
      rotate: [0, 360]
    }}
    transition={{
      duration: isMobile ? 3 : 4,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 10 + 5
    }}
    style={{
      color,
      fontSize: isMobile ? '18px' : '24px',
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
    }}
  >
    {icon}
  </motion.div>
);

// Mobile-optimized Micro Interaction Component
const MicroInteraction = ({ type, x, y, color, isMobile }) => {
  if (type === 'sparkle') {
    return (
      <motion.div
        className="absolute pointer-events-none"
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
          borderRadius: '50%'
        }}
      />
    );
  }
  
  if (type === 'pulse') {
    return (
      <motion.div
        className="absolute pointer-events-none rounded-full"
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
          filter: 'blur(4px)'
        }}
      />
    );
  }
  
  return null;
};

// Mobile-optimized Interactive Background
const InteractiveBackground = ({ isMobile }) => {
  const [interactions, setInteractions] = useState([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && interactions.length < (isMobile ? 4 : 8)) {
        const type = Math.random() > 0.5 ? 'sparkle' : 'pulse';
        const colors = ['#10B981', '#34D399', '#22C55E', '#059669'];
        setInteractions(prev => [...prev, {
          id: Date.now(),
          type,
          x: Math.random() * 100 + '%',
          y: Math.random() * 100 + '%',
          color: colors[Math.floor(Math.random() * colors.length)]
        }]);
      }
    }, isMobile ? 1200 : 800);
    
    return () => clearInterval(interval);
  }, [interactions.length, isMobile]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {interactions.map(interaction => (
        <MicroInteraction key={interaction.id} {...interaction} isMobile={isMobile} />
      ))}
    </div>
  );
};

export default function Home() {
  const containerRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const [hoverGlow, setHoverGlow] = useState({ x: 0, y: 0, active: false });
  const [floatingIcons, setFloatingIcons] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });

  // Mobile detection with throttling
  useEffect(() => {
    let timeoutId;
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    checkMobile();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Mobile-optimized scroll animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, isMobile ? 0.98 : 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, isMobile ? 0.9 : 0.8]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -60 : -100]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 80 : 120]);
  const featuresY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -30 : -60]);
  
  const heroYSpring = useSpring(heroY, { 
    stiffness: isMobile ? 140 : 160, 
    damping: isMobile ? 35 : 30 
  });
  const orbYSpring = useSpring(orbY, { 
    stiffness: isMobile ? 120 : 140, 
    damping: isMobile ? 30 : 25 
  });
  const featuresYSpring = useSpring(featuresY, { 
    stiffness: isMobile ? 150 : 180, 
    damping: isMobile ? 32 : 28 
  });
  const heroScaleSpring = useSpring(heroScale, { 
    stiffness: isMobile ? 180 : 200, 
    damping: isMobile ? 40 : 35 
  });

  // Enhanced mouse/touch tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const orb1X = useMotionValue(0);
  const orb1Y = useMotionValue(0);
  const orb2X = useMotionValue(0);
  const orb2Y = useMotionValue(0);

  // Enhanced click/touch handler
  const handleInteraction = useCallback((e) => {
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

    // Handle both mouse and touch events
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

    // Main ripple
    const newRipple = {
      id: Date.now(),
      x,
      y,
      color,
      type: 'ripple',
      isMobile
    };

    // Secondary sparkles (less on mobile)
    const sparkleCount = isMobile ? 1 : 3;
    for (let i = 0; i < sparkleCount; i++) {
      setTimeout(() => {
        const sparkle = {
          id: Date.now() + i,
          x: x + (Math.random() * (isMobile ? 40 : 60) - (isMobile ? 20 : 30)),
          y: y + (Math.random() * (isMobile ? 40 : 60) - (isMobile ? 20 : 30)),
          color: colors[Math.floor(Math.random() * colors.length)],
          type: 'sparkle',
          isMobile
        };
        setRipples(prev => [...prev, sparkle]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== sparkle.id));
        }, isMobile ? 400 : 600);
      }, i * (isMobile ? 150 : 100));
    }

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, isMobile ? 900 : 1200);
  }, [isMobile]);

  // Enhanced hover/touch move handler
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
      setHoverGlow({ x, y, active: true });
    }

    // Create occasional floating icons on hover (desktop only)
    if (!isMobile && Math.random() > 0.97 && floatingIcons.length < 5) {
      const icons = ['🍏', '🥦', '🥑', '🍓', '🥝'];
      const colors = ['#10B981', '#34D399', '#22C55E'];
      setFloatingIcons(prev => [...prev, {
        id: Date.now(),
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        x: x,
        y: y
      }]);
    }
  }, [isMobile, floatingIcons.length]);

  // Enhanced mouse effects (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const onMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      
      mouseX.set(nx);
      mouseY.set(ny);
      
      // Enhanced orb movement
      orb1X.set(nx * -40);
      orb1Y.set(ny * -30);
      orb2X.set(nx * 30);
      orb2Y.set(ny * 25);
    };

    const onLeave = () => {
      animate(mouseX, 0, { type: "spring", stiffness: 100, damping: 15 });
      animate(mouseY, 0, { type: "spring", stiffness: 100, damping: 15 });
      animate(orb1X, 0, { type: "spring", stiffness: 90, damping: 15 });
      animate(orb1Y, 0, { type: "spring", stiffness: 90, damping: 15 });
      animate(orb2X, 0, { type: "spring", stiffness: 90, damping: 15 });
      animate(orb2Y, 0, { type: "spring", stiffness: 90, damping: 15 });
      setHoverGlow(prev => ({ ...prev, active: false }));
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", onLeave);
    }
    
    return () => {
      if (node) {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [isMobile, mouseX, mouseY, orb1X, orb1Y, orb2X, orb2Y]);

  // 3D rotation (desktop only)
  const rotateY = useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [20, -20]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [-15, 15]);
  const rotateYSpring = useSpring(rotateY, { stiffness: 250, damping: 28 });
  const rotateXSpring = useSpring(rotateX, { stiffness: 250, damping: 28 });

  // Parallax layers (desktop only)
  const layer1X = useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [-20, 20]);
  const layer1Y = useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [-15, 15]);

  // Mobile-optimized Particle Background
  const particleOptions = {
    particles: {
      number: { 
        value: isMobile ? 50 : 80, 
        density: { 
          enable: true, 
          value_area: isMobile ? 600 : 800 
        } 
      },
      color: { value: ["#22c55e", "#10b981", "#34d399", "#059669"] },
      shape: { type: "circle" },
      opacity: { 
        value: isMobile ? 0.15 : 0.2, 
        random: true, 
        animation: { 
          enable: true, 
          speed: 1, 
          minimumValue: 0.1 
        } 
      },
      size: { 
        value: isMobile ? 2.5 : 3, 
        random: true, 
        animation: { 
          enable: true, 
          speed: 2, 
          minimumValue: 1 
        } 
      },
      move: {
        enable: true,
        speed: isMobile ? 0.4 : 0.5,
        direction: "none",
        random: true,
        straight: false,
        outMode: "bounce",
        attract: { enable: true, rotateX: 600, rotateY: 1200 }
      }
    },
    interactivity: {
      events: {
        onhover: { enable: !isMobile, mode: "repulse" },
        onclick: { enable: true, mode: "push" }
      }
    },
    detectRetina: true
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
      className="relative min-h-screen flex flex-col bg-gradient-to-b from-white via-green-50/80 to-emerald-50/60 overflow-hidden font-sans cursor-default"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-y'
      }}
    >
      {/* Interactive Background Layer */}
      <InteractiveBackground isMobile={isMobile} />
      
      {/* Enhanced Particle Background */}
      <Particles
        className="absolute inset-0 -z-10"
        options={particleOptions}
      />

      {/* Enhanced Ripple Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        <AnimatePresence>
          {ripples.map(ripple => (
            ripple.type === 'ripple' ? (
              <motion.div
                key={ripple.id}
                className="absolute pointer-events-none rounded-full"
                initial={{
                  scale: 0,
                  opacity: 0.7,
                  x: ripple.x - (ripple.isMobile ? 15 : 20),
                  y: ripple.y - (ripple.isMobile ? 15 : 20),
                  width: ripple.isMobile ? 30 : 40,
                  height: ripple.isMobile ? 30 : 40,
                  background: `radial-gradient(circle, ${ripple.color}, ${ripple.color.replace('0.6', '0.2')})`
                }}
                animate={{
                  scale: [0, ripple.isMobile ? 3 : 4, ripple.isMobile ? 3.5 : 5],
                  opacity: [0.7, 0.3, 0],
                  width: [
                    ripple.isMobile ? 30 : 40, 
                    ripple.isMobile ? 120 : 160, 
                    ripple.isMobile ? 140 : 200
                  ],
                  height: [
                    ripple.isMobile ? 30 : 40, 
                    ripple.isMobile ? 120 : 160, 
                    ripple.isMobile ? 140 : 200
                  ],
                  x: [
                    ripple.x - (ripple.isMobile ? 15 : 20), 
                    ripple.x - (ripple.isMobile ? 60 : 80), 
                    ripple.x - (ripple.isMobile ? 70 : 100)
                  ],
                  y: [
                    ripple.y - (ripple.isMobile ? 15 : 20), 
                    ripple.y - (ripple.isMobile ? 60 : 80), 
                    ripple.y - (ripple.isMobile ? 70 : 100)
                  ]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: ripple.isMobile ? 0.9 : 1.2,
                  ease: "easeOut"
                }}
                style={{
                  filter: `blur(${ripple.isMobile ? 8 : 12}px)`,
                  mixBlendMode: "screen"
                }}
              />
            ) : (
              <motion.div
                key={ripple.id}
                className="absolute pointer-events-none"
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
                  y: [ripple.y - (ripple.isMobile ? 8 : 10), ripple.y - (ripple.isMobile ? 30 : 40)]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: ripple.isMobile ? 0.6 : 0.8 }}
                style={{
                  width: ripple.isMobile ? '16px' : '20px',
                  height: ripple.isMobile ? '16px' : '20px',
                  background: `radial-gradient(circle, ${ripple.color}, transparent 70%)`,
                  borderRadius: '50%'
                }}
              />
            )
          ))}
        </AnimatePresence>

        {/* Enhanced Hover Glow (Desktop only) */}
        {!isMobile && (
          <motion.div
            className="absolute pointer-events-none rounded-full"
            animate={{
              scale: hoverGlow.active ? 1 : 0,
              opacity: hoverGlow.active ? 0.3 : 0,
              x: hoverGlow.x - 75,
              y: hoverGlow.y - 75
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25
            }}
            style={{
              width: 150,
              height: 150,
              background: "radial-gradient(circle, rgba(34,197,94,0.4), rgba(16,185,129,0.15), transparent 70%)",
              filter: "blur(20px)"
            }}
          />
        )}

        {/* Touch/Mouse Trail Effect */}
        <motion.div
          className="absolute pointer-events-none rounded-full"
          animate={{
            x: touchPosition.x - (isMobile ? 6 : 8),
            y: touchPosition.y - (isMobile ? 6 : 8)
          }}
          transition={{
            type: "spring",
            stiffness: isMobile ? 600 : 500,
            damping: isMobile ? 35 : 30
          }}
          style={{
            width: isMobile ? 12 : 16,
            height: isMobile ? 12 : 16,
            background: "radial-gradient(circle, rgba(34,197,94,0.2), rgba(16,185,129,0.05))",
            border: `2px solid rgba(34,197,94,${isMobile ? 0.2 : 0.3})`,
            filter: 'blur(1px)'
          }}
        />
      </div>

      {/* Floating Icons (Desktop only) */}
      {!isMobile && (
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
                  opacity: [0, 1, 1, 0],
                  y: [icon.y, icon.y - 150],
                  rotate: [0, 360]
                }}
                exit={{ opacity: 0 }}
                onAnimationComplete={() => {
                  setFloatingIcons(prev => prev.filter(i => i.id !== icon.id));
                }}
                transition={{ duration: 3 }}
                style={{
                  color: icon.color,
                  filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.15))'
                }}
              >
                {icon.icon}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Enhanced Background Orbs with Parallax (Conditional based on device) */}
      {!isMobile && (
        <>
          <motion.div
            style={{ y: orbYSpring, x: orb1X }}
            className="absolute -top-60 -left-60 w-[45rem] h-[45rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.2,
              scale: [1, 1.15, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 via-emerald-400 to-teal-300 blur-[140px]" />
          </motion.div>

          <motion.div
            style={{ y: orb2Y, x: orb2X }}
            className="absolute -right-40 -bottom-40 w-[35rem] h-[35rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.2,
              scale: [1, 1.12, 1],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-emerald-300 to-green-400 blur-[140px]" />
          </motion.div>
        </>
      )}

      {/* Mobile-optimized Background Orbs */}
      {isMobile && (
        <>
          <motion.div
            style={{ y: orbYSpring }}
            className="absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.15,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-300 via-emerald-300 to-teal-200 blur-[100px]" />
          </motion.div>

          <motion.div
            style={{ y: orbYSpring }}
            className="absolute -right-20 -bottom-20 w-[25rem] h-[25rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.15,
              scale: [1, 1.08, 1]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 via-emerald-200 to-green-300 blur-[100px]" />
          </motion.div>
        </>
      )}

      {/* Animated Background Shapes (Mobile Optimized) */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full -z-10 ${
            i === 1 ? `w-${isMobile ? 10 : 16} h-${isMobile ? 10 : 16} bg-green-400/20 ${isMobile ? 'top-16 left-6' : 'top-1/4 left-1/6'}` :
            i === 2 ? `w-${isMobile ? 12 : 20} h-${isMobile ? 12 : 20} bg-emerald-400/15 ${isMobile ? 'bottom-32 right-8' : 'bottom-1/3 right-1/4'}` :
            `w-${isMobile ? 8 : 12} h-${isMobile ? 8 : 12} bg-teal-400/25 ${isMobile ? 'top-1/3 right-1/4' : 'top-1/3 right-1/3'}`
          }`}
          animate={{
            y: [0, isMobile ? -20 : -40, 0],
            x: [0, isMobile ? 10 : 20, 0],
            opacity: [0.2, 0.35, 0.2],
            scale: [1, isMobile ? 1.1 : 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: isMobile ? 12 + i * 2 : 15 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
          whileHover={!isMobile ? {
            scale: 1.8,
            opacity: 0.6,
            transition: { duration: 0.4 }
          } : undefined}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex-grow">
        <motion.div
          style={{ 
            scale: heroScaleSpring,
            opacity: heroOpacity
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-12 font-sans"
        >
          {/* Hero Section - Mobile Optimized */}
          <motion.section
            style={{ y: heroYSpring }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto mb-16 sm:mb-24 relative"
          >
            {/* Hero Background Glow (Mobile Optimized) */}
            {!isMobile && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-3xl"
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: "radial-gradient(circle at center, rgba(34,197,94,0.15), transparent 70%)",
                  filter: "blur(40px)"
                }}
              />
            )}

            <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-16">
              {/* Enhanced Lottie Animation - Mobile Optimized */}
              <motion.div
                animate={{ 
                  y: [0, isMobile ? -10 : -20, 0],
                  rotate: isMobile ? [0, 0] : [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: isMobile ? 4 : 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={!isMobile ? { 
                  scale: 1.05,
                  rotateY: 180,
                  transition: { duration: 0.8 }
                } : undefined}
                whileTap={isMobile ? { scale: 0.95 } : undefined}
                className={`${isMobile ? 'w-48 h-48' : 'w-56 h-56 lg:w-72 lg:h-72'} flex-shrink-0 relative mx-auto lg:mx-0`}
              >
                {/* Animated Border (Desktop only) */}
                {!isMobile && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    animate={{
                      borderColor: ['rgba(34,197,94,0.3)', 'rgba(16,185,129,0.5)', 'rgba(34,197,94,0.3)'],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      border: '2px solid',
                      filter: 'blur(1px)'
                    }}
                  />
                )}
                
                {/* Glowing Halo (Mobile Optimized) */}
                <motion.div
                  className="absolute inset-[-20px] rounded-3xl"
                  animate={{
                    opacity: [0.1, isMobile ? 0.15 : 0.25, 0.1],
                    scale: [1, isMobile ? 1.05 : 1.1, 1]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: "radial-gradient(circle, rgba(34,197,94,0.2), transparent 70%)",
                    filter: `blur(${isMobile ? 15 : 20}px)`
                  }}
                />
                
                <div className={`relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-white to-green-50/50 ${isMobile ? 'shadow-xl' : 'shadow-2xl'} backdrop-blur-sm`}>
                  <Lottie 
                    animationData={kaedeAnim} 
                    loop 
                    className="absolute inset-0"
                  />
                </div>
              </motion.div>

              {/* Hero Text - Mobile Optimized */}
              <motion.div
                style={{ 
                  rotateY: rotateYSpring, 
                  rotateX: rotateXSpring,
                  x: layer1X,
                  y: layer1Y
                }}
                className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8"
              >
                <div className="relative">
                  <motion.h1
                    className={`font-bold tracking-tight ${isMobile ? 'text-3xl sm:text-4xl' : 'text-5xl sm:text-6xl lg:text-7xl'}`}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
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
                    whileHover={!isMobile ? {
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    } : undefined}
                  >
                    Eat Smarter.
                    <br />
                    <span className="text-emerald-700">Live Better.</span>
                  </motion.h1>
                  
                  {/* Animated Underline */}
                  <motion.div
                    className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-4 ${isMobile ? 'h-0.5' : 'h-1'}`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    whileHover={!isMobile ? { scaleY: 2 } : undefined}
                  />
                </div>

                <motion.p
                  whileHover={!isMobile ? { 
                    scale: 1.03,
                    color: "#065f46",
                    x: 5
                  } : undefined}
                  animate={{ 
                    opacity: [0.9, 1, 0.9],
                    y: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`text-gray-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed ${isMobile ? 'text-base sm:text-lg' : 'text-xl'}`}
                >
                  PureScan helps you scan food product barcodes and understand their 
                  nutritional value and health impact — instantly. 
                  <span className={`block mt-2 text-green-600 font-semibold ${isMobile ? 'text-sm' : ''}`}>
                    Your health companion in every scan.
                  </span>
                </motion.p>

                {/* Enhanced CTA Button - Mobile Optimized */}
                <motion.div
                  whileHover={!isMobile ? { scale: 1.05 } : undefined}
                  whileTap={{ scale: 0.95 }}
                  className="relative inline-block"
                >
                  <Link
                    to="/select-scan"
                    className={`group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-semibold hover:shadow-3xl transition-all duration-300 overflow-hidden ${isMobile ? 'px-6 py-3 text-base shadow-lg' : 'px-10 py-4 text-xl shadow-2xl'}`}
                  >
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className={isMobile ? 'text-xl' : 'text-2xl'}
                    >
                      🔍
                    </motion.span>
                    <span className="relative z-10">
                      {isMobile ? 'Start Scanning' : 'Start Scanning Now'}
                    </span>
                    
                    {/* Button Glow Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        background: "radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)",
                        filter: `blur(${isMobile ? 8 : 10}px)`
                      }}
                    />
                    
                    {/* Animated Border (Desktop only) */}
                    {!isMobile && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          borderColor: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          border: '2px solid',
                          margin: '-2px'
                        }}
                      />
                    )}
                  </Link>
                </motion.div>

                {/* Additional Mobile CTA */}
                {isMobile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4"
                  >
                    <Link
                      to="/how-it-works"
                      className="text-green-600 font-medium text-sm flex items-center justify-center gap-1"
                    >
                      Learn how it works
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.section>

          {/* Features Section - Mobile Optimized */}
          <motion.div
            style={{ y: featuresYSpring }}
            initial="hidden"
            whileInView="visible"
            viewport={{ 
              once: true,
              amount: isMobile ? 0.1 : 0.3,
              margin: isMobile ? "0px" : "-100px"
            }}
            variants={{ 
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { staggerChildren: isMobile ? 0.15 : 0.2 }
              }
            }}
            className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16'} max-w-7xl mx-auto mb-16 sm:mb-32`}
          >
            {[
              { 
                title: "Scan Products", 
                desc: "Instant barcode scanning for food items and cosmetics.",
                icon: "📱",
                color: "#10B981",
                details: "Scan any product in seconds with our advanced camera technology."
              },
              { 
                title: "Health Score", 
                desc: "Get a clear score based on nutrition, additives, and ingredients.",
                icon: "⭐",
                color: "#059669",
                details: "Comprehensive analysis with personalized recommendations."
              },
              { 
                title: "Privacy First", 
                desc: "No ads, no data sharing — your health, your control.",
                icon: "🔒",
                color: "#047857",
                details: "Your data stays encrypted and private on your device."
              },
              // Additional features for better content
              { 
                title: "Smart Insights", 
                desc: "AI-powered analysis of ingredients and nutrition facts.",
                icon: "🤖",
                color: "#7C3AED",
                details: "Get intelligent suggestions for healthier alternatives."
              },
              { 
                title: "Allergen Alert", 
                desc: "Instant warnings for common allergens and sensitivities.",
                icon: "⚠️",
                color: "#DC2626",
                details: "Customizable alerts based on your dietary needs."
              },
              { 
                title: "Save History", 
                desc: "Track your scanning history and health progress.",
                icon: "📊",
                color: "#0EA5E9",
                details: "Visualize your journey to healthier eating habits."
              }
            ].slice(0, isMobile ? 3 : 6).map((item, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.9 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { 
                      type: "spring",
                      stiffness: isMobile ? 80 : 100,
                      damping: isMobile ? 25 : 20,
                      delay: idx * (isMobile ? 0.1 : 0.15)
                    }
                  }
                }}
                whileHover={!isMobile ? {
                  y: -15,
                  scale: 1.05,
                  rotateX: 5,
                  rotateY: idx % 2 === 0 ? 5 : -5,
                  boxShadow: "0px 30px 80px rgba(16,185,129,0.25)"
                } : undefined}
                whileTap={isMobile ? { scale: 0.98 } : undefined}
                className="group relative cursor-pointer"
              >
                {/* Card Background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-white to-green-50/30 rounded-3xl shadow-lg backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-500 ${isMobile ? 'p-4' : 'p-8'}`} />
                
                {/* Animated Glow (Desktop only) */}
                {!isMobile && (
                  <motion.div
                    className="absolute -inset-4 -z-10 rounded-3xl opacity-0 group-hover:opacity-100"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: `conic-gradient(from 0deg, transparent, ${item.color}40, transparent)`,
                      filter: 'blur(20px)'
                    }}
                  />
                )}
                
                {/* Content */}
                <div className={`relative ${isMobile ? 'p-4' : 'p-8'}`}>
                  {/* Icon Container */}
                  <motion.div
                    whileHover={!isMobile ? { 
                      scale: 1.2,
                      rotate: [0, -10, 10, 0]
                    } : undefined}
                    transition={{ duration: 0.5 }}
                    className={`mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white to-green-100 flex items-center justify-center shadow-lg group-hover:shadow-xl ${isMobile ? 'w-16 h-16' : 'w-24 h-24'}`}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={isMobile ? 'text-2xl' : 'text-4xl'}
                    >
                      {item.icon}
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3 
                    whileHover={!isMobile ? { scale: 1.05, color: item.color } : undefined} 
                    className={`font-bold text-green-800 text-center mb-2 ${isMobile ? 'text-lg' : 'text-2xl'}`}
                  >
                    {item.title}
                  </motion.h3>
                  
                  <motion.p 
                    className={`text-gray-600 text-center ${isMobile ? 'text-sm mb-2' : 'leading-relaxed mb-4'}`}
                    whileHover={!isMobile ? { x: 5 } : undefined}
                  >
                    {item.desc}
                  </motion.p>
                  
                  {/* Additional Details (Visible on hover for desktop) */}
                  {!isMobile && (
                    <motion.p 
                      className="text-gray-500 text-sm text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ y: 10 }}
                      whileHover={{ y: 0 }}
                    >
                      {item.details}
                    </motion.p>
                  )}
                  
                  {/* Hover Indicator (Desktop only) */}
                  {!isMobile && (
                    <motion.div
                      className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-0 group-hover:opacity-100"
                      whileHover={{ width: "80px" }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-16 sm:mb-24"
          >
            <h2 className={`font-bold text-center mb-8 ${isMobile ? 'text-xl' : 'text-2xl'} text-green-800`}>
              Trusted by Health-Conscious Users
            </h2>
            
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-8'} text-center`}>
              {[
                { value: "10K+", label: "Products Scanned", color: "#10B981" },
                { value: "4.8★", label: "User Rating", color: "#059669" },
                { value: "100%", label: "Privacy Score", color: "#047857" },
                { value: "24/7", label: "Support", color: "#7C3AED" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm"
                  whileHover={!isMobile ? { scale: 1.05 } : undefined}
                  whileTap={isMobile ? { scale: 0.95 } : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <motion.div
                    className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'} mb-2`}
                    style={{ color: stat.color }}
                    animate={{ 
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
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

          {/* How It Works Section - Mobile Only */}
          {isMobile && (
            <motion.section
              className="max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="text-center mb-8"
                initial={{ y: -20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-green-800 mb-3">
                  How It Works
                </h2>
                <p className="text-gray-600 text-sm">
                  Get started in 3 simple steps
                </p>
              </motion.div>

              <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-300 to-emerald-400 z-0" />
                
                {[
                  {
                    step: "1",
                    icon: "📱",
                    title: "Scan Barcode",
                    description: "Point your camera at any food product",
                    color: "#10B981"
                  },
                  {
                    step: "2",
                    icon: "⚡",
                    title: "Instant Analysis",
                    description: "Get health score & nutrition insights",
                    color: "#059669"
                  },
                  {
                    step: "3",
                    icon: "💡",
                    title: "Make Better Choices",
                    description: "Receive smart recommendations",
                    color: "#047857"
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="relative mb-8 last:mb-0"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step indicator */}
                      <div className="relative">
                        <motion.div
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-green-50 border-2 flex items-center justify-center shadow-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          style={{ borderColor: item.color }}
                        >
                          <span className="text-lg">{item.icon}</span>
                        </motion.div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">
                          {item.step}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <h3 className="font-bold text-green-800 text-lg mb-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Action Button */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center gap-2 text-green-600 font-medium text-sm"
                >
                  <span>See detailed guide</span>
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </motion.section>
          )}

                    {/* Enhanced CTA Section - Desktop Optimized */}
          {!isMobile && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative py-20 px-8 lg:px-12 max-w-6xl mx-auto rounded-3xl overflow-hidden mb-20"
            >
              {/* Clean White Background with Subtle Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 rounded-3xl" />
              
              {/* Subtle Border with Gradient */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-br from-green-100/40 to-emerald-100/20" />
              
              {/* Animated Background Elements */}
              <motion.div
                className="absolute inset-0 -z-10 overflow-hidden rounded-3xl"
                animate={{
                  background: [
                    'radial-gradient(circle at 0% 0%, rgba(34,197,94,0.03) 0%, transparent 50%)',
                    'radial-gradient(circle at 100% 0%, rgba(16,185,129,0.03) 0%, transparent 50%)',
                    'radial-gradient(circle at 0% 0%, rgba(34,197,94,0.03) 0%, transparent 50%)'
                  ]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <div className="relative z-10 text-center">
                {/* Main Heading with Animation */}
                <motion.div
                  className="mb-12"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <motion.h2
                    className="font-heading text-4xl lg:text-5xl font-bold mb-4"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
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
                    Join 50,000+ Health Champions
                  </motion.h2>
                  
                  <motion.p
                    className="text-gray-600 text-lg max-w-2xl mx-auto"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    Transforming lives one scan at a time
                  </motion.p>
                </motion.div>


                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {[
                    {
                      icon: "🔒",
                      title: "100% Private",
                      description: "Your data never leaves your device"
                    },
                    {
                      icon: "⚡",
                      title: "Instant Results",
                      description: "Get insights in under 2 seconds"
                    },
                    {
                      icon: "📊",
                      title: "AI-Powered",
                      description: "Advanced analysis of 10,000+ products"
                    }
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.2 }}
                      whileHover={{ 
                        y: -5,
                        backgroundColor: "rgba(255,255,255,0.4)",
                        boxShadow: "0 20px 60px rgba(16,185,129,0.15)"
                      }}
                    >
                      <div className="text-3xl mb-4">{feature.icon}</div>
                      <h3 className="font-bold text-green-800 text-lg mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Improved Content with Better Messaging */}
                <motion.div
                  className="space-y-6 text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{ 
                    hidden: { opacity: 0 },
                    visible: { 
                      opacity: 1,
                      transition: { staggerChildren: 0.3 }
                    }
                  }}
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 p-6 rounded-2xl border border-green-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">🎯</div>
                      <div className="text-left">
                        <h4 className="font-semibold text-green-700 mb-2">
                          Take Control of Your Health Journey
                        </h4>
                        <p className="text-gray-700">
                          Every scan empowers you with knowledge. Make informed choices about 
                          what you consume, understand ingredients, and track your nutrition 
                          effortlessly. Transform your eating habits with data-driven insights.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { delay: 0.4 } }
                    }}
                    className="bg-gradient-to-r from-green-50/50 to-teal-50/50 p-6 rounded-2xl border border-green-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">🌱</div>
                      <div className="text-left">
                        <h4 className="font-semibold text-green-700 mb-2">
                          Join a Community Committed to Better Health
                        </h4>
                        <p className="text-gray-700">
                          Be part of a growing movement of health-conscious individuals who 
                          value transparency, education, and smart consumption. Share 
                          discoveries, learn from others, and grow together on your wellness 
                          journey.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Enhanced CTA Button */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-12"
                >
                  <Link
                    to="/select-scan"
                    className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-14 py-5 rounded-full text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Button Content */}
                    <motion.div
                      className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-500"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{
                        backgroundSize: '200% 200%'
                      }}
                    />
                    
                    <span className="relative z-10 flex items-center gap-3">
                      <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="text-2xl"
                      >
                        ✨
                      </motion.span>
                      Start Your Free Trial
                      <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="text-2xl"
                      >
                        ✨
                      </motion.span>
                    </span>
                    
                    <motion.span
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative z-10 ml-2 text-2xl"
                    >
                      →
                    </motion.span>
                    
                    {/* Button Glow Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
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
                        background: "radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)",
                        filter: "blur(12px)"
                      }}
                    />
                  </Link>
                  
                </motion.div>
              </div>
            </motion.section>
          )}
        </motion.div>
      </div>
    </div>
  );
}








