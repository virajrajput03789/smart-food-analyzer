import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useMotionValue, 
  animate, 
  useSpring,
  AnimatePresence 
} from 'framer-motion';
import Particles from 'react-tsparticles';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

// Micro Interaction Component (similar to Home page)
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

// Interactive Background (similar to Home page)
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

const AboutUs = () => {
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

  // Enhanced mouse/touch tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const orb1X = useMotionValue(0);
  const orb1Y = useMotionValue(0);
  const orb2X = useMotionValue(0);
  const orb2Y = useMotionValue(0);

  // Scroll animations with mobile optimization
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start start", "end end"] 
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -60 : -140]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, isMobile ? 0.9 : 0.85]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, isMobile ? 0.98 : 0.96]);

  const heroYSpring = useSpring(heroY, { 
    stiffness: isMobile ? 140 : 160, 
    damping: isMobile ? 35 : 30 
  });
  const heroScaleSpring = useSpring(heroScale, { 
    stiffness: isMobile ? 180 : 200, 
    damping: isMobile ? 40 : 35 
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 80 : 120]);
  const orbYSpring = useSpring(orbY, { 
    stiffness: isMobile ? 120 : 140, 
    damping: isMobile ? 30 : 25 
  });

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

    // Secondary sparkles
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

    // Create occasional floating icons on hover
    if (!isMobile && Math.random() > 0.97 && floatingIcons.length < 5) {
      const icons = ['🍏', '🥦', '🥑', '🍓', '🥝', '💚', '✨', '🌱'];
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
  const rotateY = useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [12, -12]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [-8, 8]);
  const rotateYSpring = useSpring(rotateY, { stiffness: 250, damping: 28 });
  const rotateXSpring = useSpring(rotateX, { stiffness: 250, damping: 28 });

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
      className="relative min-h-screen flex flex-col bg-gradient-to-b from-white via-green-50/80 to-emerald-50/60 overflow-hidden font-sans cursor-default px-4"
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

      {/* Enhanced Background Orbs with Parallax */}
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

      {/* Main Content */}
      <div className="relative z-10 flex-grow py-8 sm:py-12">
        <motion.div
          style={{ 
            scale: heroScaleSpring,
            opacity: heroOpacity
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-gray-900 px-4 sm:px-6 lg:px-8"
        >
          {/* Hero Section */}
          <motion.section
            style={{ y: heroYSpring }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-12 sm:mb-16 relative"
          >
            {/* Hero Background Glow */}
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

            <motion.div
              className="text-center"
              whileHover={!isMobile ? { scale: 1.02 } : undefined}
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
                className={`font-bold tracking-tight ${isMobile ? 'text-4xl' : 'text-5xl sm:text-6xl'} mb-6`}
                style={{
                  background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                About Us
              </motion.h1>
              
              {/* Animated Underline */}
              <motion.div
                className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-8 ${isMobile ? 'h-0.5' : 'h-1'}`}
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ duration: 1.5, delay: 0.5 }}
                whileHover={!isMobile ? { scaleY: 2 } : undefined}
              />
              
              <motion.p
                animate={{ 
                  opacity: [0.9, 1, 0.9],
                  y: [0, -2, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`text-gray-700 max-w-3xl mx-auto leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}
              >
                PureScan is built to help people make better food choices. 
                <span className="block mt-2 text-green-600 font-semibold">
                  Your health companion in every scan.
                </span>
              </motion.p>
            </motion.div>
          </motion.section>

          {/* Content Sections - PRIVACY POLICY STYLE */}
          <motion.div
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
                transition: { staggerChildren: isMobile ? 0.1 : 0.15 }
              }
            }}
            className="max-w-4xl mx-auto"
          >
            {/* Paragraphs */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group relative cursor-pointer mb-8"
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-green-50/30 rounded-2xl backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-500 p-6" />
              
              <div className="relative p-6">
                <motion.p 
                  whileHover={!isMobile ? { x: 5 } : undefined}
                  className="text-gray-600 leading-relaxed text-center"
                >
                  PureScan is built to help people make better food choices. It scans food items, evaluates their nutritional quality, and helps users stay aware of what they consume daily.
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group relative cursor-pointer mb-8"
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-green-50/30 rounded-2xl backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-500 p-6" />
              
              <div className="relative p-6">
                <motion.p 
                  whileHover={!isMobile ? { x: 5 } : undefined}
                  className="text-gray-600 leading-relaxed text-center"
                >
                  Our goal is to simplify food awareness using modern technology and science-backed nutrition data — so that choosing healthy products becomes effortless.
                </motion.p>
              </div>
            </motion.div>

            {/* Sections in Privacy Policy Style */}
            {[
              { 
                title: "Our Mission", 
                content: "To empower everyone to eat smarter, live better, and understand food in a way that promotes lifelong wellness." 
              },
              { 
                title: "Why Choose Us", 
                content: (
                  <ul className="list-disc pl-6 space-y-2">
                    {[
                      "Instant product scanning and nutrition analysis",
                      "AI-based health recommendations",
                      "Trusted data and ingredient breakdown",
                      "Minimal design, easy to use interface",
                      "100% privacy-focused — no data sharing"
                    ].map((item, idx) => (
                      <li key={idx} className="text-gray-600 leading-relaxed">{item}</li>
                    ))}
                  </ul>
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
            ].map((section, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group relative cursor-pointer mb-8"
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-green-50/30 rounded-2xl backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-500" />
                
                {/* Content */}
                <div className="relative p-6">
                  <motion.h2 
                    whileHover={!isMobile ? { scale: 1.05, color: "#059669" } : undefined} 
                    className="font-bold text-green-800 text-center mb-4 text-xl"
                  >
                    {section.title}
                  </motion.h2>
                  
                  <motion.div 
                    className="text-gray-600 leading-relaxed"
                    whileHover={!isMobile ? { x: 5 } : undefined}
                  >
                    {typeof section.content === "string" ? (
                      <p className="text-center">{section.content}</p>
                    ) : (
                      section.content
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section for Mobile - PRIVACY POLICY STYLE */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-8 pt-6 border-t border-green-100"
            >
              <h3 className="text-lg font-semibold text-green-700 mb-4 text-center">
                Our Impact
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "50K+", label: "Users", color: "#10B981" },
                  { value: "10K+", label: "Products", color: "#059669" },
                  { value: "4.9★", label: "Rating", color: "#047857" },
                  { value: "100%", label: "Privacy", color: "#7C3AED" }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div
                      className="font-bold text-xl mb-1"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;