import React, { useEffect, useRef, useState, useCallback } from "react";
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

// Mobile-optimized Interactive Background with HOVER EFFECTS
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

// REUSABLE SECTION COMPONENT - ENHANCED WITH HOVER EFFECTS
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
          delay: index * 0.1
        }
      }}
      viewport={{ once: true, margin: "-50px" }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      whileHover={!isMobile ? {
        y: -15,
        scale: 1.02,
        boxShadow: "0px 25px 70px rgba(16,185,129,0.25)",
        transition: { type: "spring", stiffness: 200, damping: 15 }
      } : undefined}
      whileTap={isMobile ? { scale: 0.98 } : undefined}
      className="group relative cursor-pointer mb-8"
    >
      {/* Card Background with HOVER EFFECT */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={isHovered && !isMobile ? {
          background: [
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(220,252,231,0.7) 100%)",
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(187,247,208,0.8) 100%)",
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(220,252,231,0.7) 100%)"
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white to-green-50/30 backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-500 rounded-2xl" />
      </motion.div>
      
      {/* Animated Glow on Hover */}
      {!isMobile && (
        <motion.div
          className="absolute -inset-4 -z-10 rounded-2xl"
          animate={isHovered ? {
            opacity: 0.6,
            scale: 1.05,
            rotate: [0, 5, -5, 0]
          } : {
            opacity: 0,
            scale: 1
          }}
          transition={{ 
            duration: 0.8,
            rotate: { duration: 4, repeat: Infinity }
          }}
          style={{
            background: `radial-gradient(circle at center, #10B98140, transparent 70%)`,
            filter: 'blur(25px)'
          }}
        />
      )}
      
      {/* Floating Icons on Hover */}
      {!isMobile && isHovered && (
        <>
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 text-2xl"
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 0.7, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ color: '#10B981' }}
          >
            🔒
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -left-2 w-8 h-8 text-2xl"
            initial={{ scale: 0, opacity: 0, rotate: 45 }}
            animate={{ scale: 1, opacity: 0.7, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            style={{ color: '#34D399' }}
          >
            ⭐
          </motion.div>
        </>
      )}
      
      {/* Content */}
      <div className="relative p-6">
        {/* Section Header with HOVER EFFECT */}
        <motion.div 
          className="flex items-center gap-3 mb-4"
          whileHover={!isMobile ? { x: 10 } : undefined}
        >
          <motion.div
            className="w-2 h-8 rounded-full bg-gradient-to-b from-green-500 to-emerald-500"
            animate={isHovered && !isMobile ? {
              scaleY: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.h2 
            animate={isHovered && !isMobile ? {
              scale: 1.05,
              x: 5,
              textShadow: "0px 2px 10px rgba(16,185,129,0.3)"
            } : {}}
            className="font-bold text-green-800 text-xl"
          >
            {title}
          </motion.h2>
        </motion.div>
        
        {/* Section Content with HOVER EFFECT */}
        <motion.div 
          className="text-gray-600 leading-relaxed"
          animate={isHovered && !isMobile ? {
            x: 5,
            color: "#374151"
          } : {}}
        >
          {typeof children === "string" ? (
            <p className="hover:text-green-700 transition-colors duration-300">{children}</p>
          ) : (
            <ul className="list-disc pl-6 space-y-2">
              {React.Children.map(children, (child, idx) => (
                <motion.li
                  key={idx}
                  className="hover:text-green-700 hover:font-medium transition-all duration-300"
                  whileHover={!isMobile ? {
                    x: 5,
                    scale: 1.02
                  } : undefined}
                >
                  {child}
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
        
        {/* Animated Underline on Hover */}
        {!isMobile && (
          <motion.div
            className="absolute bottom-4 left-6 right-6 h-0.5"
            animate={isHovered ? {
              background: "linear-gradient(90deg, #10B981, #34D399, #22C55E)",
              scaleX: 1
            } : {
              background: "transparent",
              scaleX: 0
            }}
            transition={{ duration: 0.3 }}
            style={{ originX: 0 }}
          />
        )}
      </div>
    </motion.div>
  );
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PrivacyPolicy() {
  const containerRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const [hoverGlow, setHoverGlow] = useState({ x: 0, y: 0, active: false });
  const [isMobile, setIsMobile] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [cardHover, setCardHover] = useState(false);

  // Mobile detection
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

  // Enhanced mouse tracking with HOVER EFFECTS
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, isMobile ? 0.98 : 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, isMobile ? 0.9 : 0.8]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -30 : -60]);
  
  const contentYSpring = useSpring(contentY, { 
    stiffness: isMobile ? 150 : 180, 
    damping: isMobile ? 32 : 28 
  });
  const heroScaleSpring = useSpring(heroScale, { 
    stiffness: isMobile ? 180 : 200, 
    damping: isMobile ? 40 : 35 
  });

  // Enhanced ripple effect handler
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

    const newRipple = {
      id: Date.now(),
      x,
      y,
      color,
      type: 'ripple',
      isMobile
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, isMobile ? 900 : 1200);
  }, [isMobile]);

  // Enhanced move handler with HOVER EFFECTS
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
  }, [isMobile]);

  // Enhanced mouse effects with HOVER EFFECTS
  useEffect(() => {
    if (isMobile) return;

    const onMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      
      mouseX.set(nx);
      mouseY.set(ny);
      
      // Create sparkles on mouse move occasionally
      if (Math.random() > 0.9) {
        const colors = ['#10B981', '#34D399', '#22C55E'];
        const sparkle = {
          id: Date.now(),
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: 'sparkle',
          isMobile: false
        };
        
        setRipples(prev => [...prev.slice(-10), sparkle]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== sparkle.id));
        }, 600);
      }
    };

    const onLeave = () => {
      animate(mouseX, 0, { type: "spring", stiffness: 100, damping: 15 });
      animate(mouseY, 0, { type: "spring", stiffness: 100, damping: 15 });
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
  }, [isMobile, mouseX, mouseY]);

  // Particle Background with HOVER INTERACTIVITY
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
        onhover: { 
          enable: !isMobile, 
          mode: "grab",
          parallax: { enable: true, force: 60, smooth: 10 }
        },
        onclick: { enable: true, mode: "push" }
      }
    },
    detectRetina: true
  };

  const sections = [
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
      content: "For privacy inquiries, contact us via the Contact page or email: support@purescan.example"
    }
  ];

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
      
      {/* Enhanced Particle Background with HOVER EFFECTS */}
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

        {/* Enhanced Hover Glow with ANIMATION */}
        {!isMobile && (
          <motion.div
            className="absolute pointer-events-none rounded-full"
            animate={{
              scale: hoverGlow.active ? [1, 1.1, 1] : 0,
              opacity: hoverGlow.active ? [0.2, 0.3, 0.2] : 0,
              x: hoverGlow.x - 75,
              y: hoverGlow.y - 75
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              opacity: { duration: 2, repeat: Infinity }
            }}
            style={{
              width: 150,
              height: 150,
              background: "radial-gradient(circle, rgba(34,197,94,0.4), rgba(16,185,129,0.15), transparent 70%)",
              filter: "blur(20px)"
            }}
          />
        )}

        {/* Touch/Mouse Trail Effect with HOVER ANIMATION */}
        <motion.div
          className="absolute pointer-events-none rounded-full"
          animate={{
            x: touchPosition.x - (isMobile ? 6 : 8),
            y: touchPosition.y - (isMobile ? 6 : 8),
            scale: hoverGlow.active ? [1, 1.2, 1] : 1
          }}
          transition={{
            x: { type: "spring", stiffness: isMobile ? 600 : 500, damping: isMobile ? 35 : 30 },
            y: { type: "spring", stiffness: isMobile ? 600 : 500, damping: isMobile ? 35 : 30 },
            scale: { duration: 0.8, repeat: Infinity }
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

      {/* Enhanced Background Orbs with HOVER EFFECTS */}
      {!isMobile && (
        <>
          <motion.div
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
            whileHover={{
              opacity: 0.3,
              scale: 1.2,
              transition: { duration: 0.5 }
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 via-emerald-400 to-teal-300 blur-[140px]" />
          </motion.div>

          <motion.div
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
            whileHover={{
              opacity: 0.3,
              scale: 1.15,
              transition: { duration: 0.5 }
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-emerald-300 to-green-400 blur-[140px]" />
          </motion.div>
        </>
      )}

      {/* Animated Background Shapes with HOVER EFFECTS */}
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
      <div className="relative z-10 flex-grow py-8 sm:py-12">
        <motion.div
          style={{ 
            scale: heroScaleSpring,
            opacity: heroOpacity,
            y: contentYSpring
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-gray-900 px-4 sm:px-6 lg:px-8"
          onMouseEnter={() => !isMobile && setCardHover(true)}
          onMouseLeave={() => !isMobile && setCardHover(false)}
        >
          {/* Hero Section with HOVER EFFECTS */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mb-12 sm:mb-16 relative"
          >
            {/* Hero Background Glow with HOVER ANIMATION */}
            {!isMobile && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-3xl"
                animate={cardHover ? {
                  opacity: [0.15, 0.25, 0.15],
                  scale: [1, 1.1, 1]
                } : {
                  opacity: [0.1, 0.2, 0.1],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 4,
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
              whileHover={!isMobile ? { 
                scale: 1.02,
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
                whileHover={!isMobile ? {
                  scale: 1.03,
                  textShadow: "0px 0px 20px rgba(16,185,129,0.5)"
                } : undefined}
                className={`font-bold tracking-tight ${isMobile ? 'text-3xl' : 'text-4xl sm:text-5xl'} mb-6`}
                style={{
                  background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Privacy Policy
              </motion.h1>
              
              {/* Animated Underline with HOVER EFFECT */}
              <motion.div
                className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-8 ${isMobile ? 'h-0.5' : 'h-1'}`}
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ duration: 1.5, delay: 0.5 }}
                whileHover={!isMobile ? { 
                  scaleY: 2,
                  width: "250px"
                } : undefined}
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
                whileHover={!isMobile ? { 
                  scale: 1.03,
                  color: "#065f46",
                  x: 5
                } : undefined}
                className={`text-gray-700 max-w-2xl mx-auto leading-relaxed ${isMobile ? 'text-base' : 'text-xl'}`}
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

          {/* Back to Home Button with ENHANCED HOVER EFFECTS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12 sm:mt-16"
          >
            <motion.div
              whileHover={!isMobile ? { scale: 1.05 } : undefined}
              whileTap={{ scale: 0.95 }}
              className="relative inline-block"
            >
              <Link
                to="/"
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-semibold hover:shadow-3xl transition-all duration-300 overflow-hidden px-10 py-4 shadow-2xl"
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-2xl"
                >
                  ←
                </motion.span>
                <span className="relative z-10">Back to Home</span>
                
                {/* Button Glow Effect on Hover */}
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
                
                {/* Animated Border on Hover */}
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
                
                {/* Hover Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-emerald-500/20 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
