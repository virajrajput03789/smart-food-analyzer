import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { auth } from "./FireBase";
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { debounce, throttle } from "lodash-es";

// Memoized animation variant
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

// Optimized MicroInteraction Component with memo
const MicroInteraction = memo(({ type, x, y, color, isMobile }) => {
  const sparkleAnimation = useMemo(() => ({
    initial: { x, y, scale: 0, opacity: 0 },
    animate: {
      scale: [0, 1.2, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180]
    },
    transition: { duration: isMobile ? 0.4 : 0.6 }
  }), [x, y, isMobile]);

  const pulseAnimation = useMemo(() => ({
    initial: { 
      x: x - (isMobile ? 8 : 12), 
      y: y - (isMobile ? 8 : 12), 
      scale: 0, 
      opacity: 0.7 
    },
    animate: {
      scale: [0, 1.5],
      opacity: [0.7, 0]
    },
    transition: { duration: isMobile ? 0.6 : 0.8 }
  }), [x, y, isMobile]);

  if (type === 'sparkle') {
    return (
      <motion.div
        className="absolute pointer-events-none will-change-transform"
        {...sparkleAnimation}
        style={{
          width: isMobile ? '12px' : '16px',
          height: isMobile ? '12px' : '16px',
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
        {...pulseAnimation}
        style={{
          width: isMobile ? '20px' : '24px',
          height: isMobile ? '20px' : '24px',
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

// Optimized InteractiveBackground with cleanup
const InteractiveBackground = memo(({ isMobile }) => {
  const [interactions, setInteractions] = useState([]);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    const addInteraction = () => {
      if (Math.random() > 0.7 && interactions.length < (isMobile ? 3 : 6)) {
        const type = Math.random() > 0.5 ? 'sparkle' : 'pulse';
        const colors = ['#10B981', '#34D399', '#22C55E', '#059669'];
        setInteractions(prev => {
          const newInteractions = [...prev, {
            id: Date.now(),
            type,
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            color: colors[Math.floor(Math.random() * colors.length)]
          }];
          // Keep only last 10 interactions
          return newInteractions.slice(-10);
        });
      }
    };

    timeoutRef.current = setInterval(addInteraction, isMobile ? 1500 : 1000);
    
    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [isMobile]);
  
  // Cleanup interactions
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setInteractions(prev => prev.filter(interaction => 
        Date.now() - interaction.id < (isMobile ? 1200 : 1000)
      ));
    }, 1000);
    
    return () => clearInterval(cleanupInterval);
  }, [isMobile]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {interactions.map(interaction => (
        <MicroInteraction key={interaction.id} {...interaction} isMobile={isMobile} />
      ))}
    </div>
  );
});

InteractiveBackground.displayName = 'InteractiveBackground';

// Optimized GlowingCard Component with memo
const GlowingCard = memo(({ children, glowColor = "#22c55e", className = "", isMobile, tilt = true }) => {
  const cardStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${glowColor}40, transparent)`,
    boxShadow: `0 0 20px ${glowColor}40`,
    transform: 'translateZ(0)'
  }), [glowColor]);

  return (
    <motion.div
      className={`relative rounded-2xl p-[1.5px] overflow-hidden ${className}`}
      style={cardStyle}
      whileHover={!isMobile && tilt ? { scale: 1.02 } : {}}
      whileTap={isMobile ? { scale: 0.98 } : {}}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent backdrop-blur-sm rounded-2xl opacity-0 hover:opacity-100 transition-all duration-500" />
      <div className={`relative rounded-2xl bg-white/95 backdrop-blur-xl z-10 ${isMobile ? 'p-4' : 'p-6'}`}>
        {children}
      </div>
    </motion.div>
  );
});

GlowingCard.displayName = 'GlowingCard';

// Optimized FloatingIcons with memo and reduced re-renders
const FloatingIcons = memo(({ isMobile }) => {
  const icons = useMemo(() => 
    Array.from({ length: isMobile ? 8 : 15 }).map((_, i) => {
      const initialX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
      const initialY = Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000);
      const scale = Math.random() * 0.5 + 0.3;
      const duration = 8 + Math.random() * 8;
      
      return {
        id: i,
        initialX,
        initialY,
        scale,
        duration,
        xVariation: Math.random() * 10 - 5
      };
    }), [isMobile]
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {icons.map((icon) => (
        <motion.div
          key={icon.id}
          className={`absolute rounded-full ${
            isMobile ? 'w-1 h-1' : 'w-2 h-2'
          } bg-gradient-to-br from-green-300/20 to-emerald-400/20 blur-sm will-change-transform`}
          initial={{
            x: icon.initialX,
            y: icon.initialY,
            scale: icon.scale,
            opacity: 0.2
          }}
          animate={{
            y: ["0%", "-15%", "0%"],
            x: ["0%", `${icon.xVariation}%`, "0%"],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: icon.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: 'translateZ(0)' }}
        />
      ))}
    </div>
  );
});

FloatingIcons.displayName = 'FloatingIcons';

function Profile() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mobile detection with debounce and RAF
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const debouncedCheckMobile = debounce(checkMobile, 100, { leading: true });
    
    checkMobile();
    window.addEventListener('resize', debouncedCheckMobile);
    
    return () => {
      window.removeEventListener('resize', debouncedCheckMobile);
      debouncedCheckMobile.cancel();
    };
  }, []);

  // Optimized scroll animations with useMemo
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start start", "end end"] 
  });

  const scrollConfig = useMemo(() => ({
    stiffness: isMobile ? 180 : 200,
    damping: isMobile ? 30 : 25
  }), [isMobile]);

  const heroY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -30 : -40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, isMobile ? 0.97 : 0.95]);
  const heroYSpring = useSpring(heroY, scrollConfig);

  // Throttled interaction handlers
  const handleInteraction = useCallback(throttle((e) => {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'BUTTON' ||
      e.target.tagName === 'A' ||
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
      'rgba(16, 185, 129, 0.4)',
      'rgba(52, 211, 153, 0.4)',
      'rgba(34, 197, 94, 0.4)',
      'rgba(5, 150, 105, 0.4)'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newRipple = {
      id: Date.now(),
      x,
      y,
      color,
      isMobile
    };

    setRipples(prev => {
      const updated = [...prev, newRipple];
      return updated.slice(-5); // Keep only last 5 ripples
    });

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, isMobile ? 500 : 700);
  }, isMobile ? 200 : 100), [isMobile]);

  // RAF optimized mouse move
  const handleMouseMove = useCallback(throttle((e) => {
    if (isMobile || !containerRef.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateY = ((x - centerX) / centerX) * 4; // Reduced from 8
      const rotateX = ((centerY - y) / centerY) * 3; // Reduced from 6
      
      setMousePosition({ x: rotateX, y: rotateY });
    });
  }, isMobile ? 1000 : 16), [isMobile]); // Throttle to 60fps on desktop

  const handleTouchMove = useCallback(throttle((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    if (!touch) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setTouchPosition({ x, y });
  }, 100), []);

  // Memoized particle options
  const particleOptions = useMemo(() => ({
    fpsLimit: isMobile ? 30 : 60,
    particles: {
      number: { 
        value: isMobile ? 15 : 25, // Reduced particle count
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
          speed: 0.5, // Slower animation
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
        speed: isMobile ? 0.1 : 0.15, // Slower movement
        direction: "none",
        random: true,
        straight: false,
        outMode: "bounce",
        attract: { enable: false } // Disabled heavy attract computation
      }
    },
    interactivity: {
      events: {
        onhover: { 
          enable: !isMobile, 
          mode: "repulse",
          parallax: { enable: false } // Disable parallax
        },
        onclick: { enable: true, mode: "push" }
      }
    },
    detectRetina: true,
    responsive: []
  }), [isMobile]);

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

  // Cleanup RAF
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Loading skeleton - optimized
  if (loading) {
    return (
      <div 
        ref={containerRef}
        className="relative min-h-screen bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 overflow-hidden will-change-transform"
        style={{ transform: 'translateZ(0)' }}
      >
        <Particles className="absolute inset-0" style={{ zIndex: 0 }} options={particleOptions} />
        <FloatingIcons isMobile={isMobile} />
        
        <motion.div
          style={{ y: heroYSpring }}
          className="relative z-50 p-4 sm:p-6 lg:p-8 max-w-md mx-auto"
        >
          <div className="relative w-fit mx-auto mb-8">
            <div className="h-8 w-32 bg-gradient-to-r from-green-200 to-emerald-200 rounded animate-pulse mx-auto" />
            <div className="h-1 w-24 bg-green-200 rounded mt-2 mx-auto" />
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
        <Particles className="absolute inset-0" style={{ zIndex: 0 }} options={particleOptions} />
        <FloatingIcons isMobile={isMobile} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md z-50"
        >
          <GlowingCard isMobile={isMobile} tilt={false}>
            <div className="space-y-4">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-800">Please Log In</h3>
              <p className="text-gray-600">You need to be logged in to view your profile.</p>
              <a
                href="/login"
                className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300"
              >
                Go to Login
              </a>
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
      onTouchMove={handleTouchMove}
      onMouseMove={!isMobile ? handleMouseMove : undefined}
      onMouseLeave={() => !isMobile && setMousePosition({ x: 0, y: 0 })}
      className="relative min-h-screen bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 overflow-hidden font-sans cursor-default will-change-transform"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-y',
        transform: 'translateZ(0)',
        contentVisibility: 'auto'
      }}
    >
      {/* Optimized Particle Background - FIXED z-index */}
      <Particles className="absolute inset-0" style={{ zIndex: 0 }} options={particleOptions} />
      
      {/* Interactive Background Layer - FIXED z-index */}
      <InteractiveBackground isMobile={isMobile} />
      
      {/* Floating Icons - FIXED z-index */}
      <FloatingIcons isMobile={isMobile} />

      {/* Optimized Ripple Effects - FIXED z-index */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              className="absolute pointer-events-none rounded-full will-change-transform"
              initial={{
                scale: 0,
                opacity: 0.6,
                x: ripple.x - (ripple.isMobile ? 10 : 15),
                y: ripple.y - (ripple.isMobile ? 10 : 15),
                width: ripple.isMobile ? 20 : 30,
                height: ripple.isMobile ? 20 : 30,
                background: `radial-gradient(circle, ${ripple.color}, ${ripple.color.replace('0.4', '0.1')})`
              }}
              animate={{
                scale: [0, ripple.isMobile ? 1.5 : 2, ripple.isMobile ? 2 : 2.5],
                opacity: [0.6, 0.2, 0],
                width: [
                  ripple.isMobile ? 20 : 30, 
                  ripple.isMobile ? 60 : 90, 
                  ripple.isMobile ? 80 : 120
                ],
                height: [
                  ripple.isMobile ? 20 : 30, 
                  ripple.isMobile ? 60 : 90, 
                  ripple.isMobile ? 80 : 120
                ],
                x: [
                  ripple.x - (ripple.isMobile ? 10 : 15), 
                  ripple.x - (ripple.isMobile ? 30 : 45), 
                  ripple.x - (ripple.isMobile ? 40 : 60)
                ],
                y: [
                  ripple.y - (ripple.isMobile ? 10 : 15), 
                  ripple.y - (ripple.isMobile ? 30 : 45), 
                  ripple.y - (ripple.isMobile ? 40 : 60)
                ]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: ripple.isMobile ? 0.5 : 0.7,
                ease: "easeOut"
              }}
              style={{
                filter: `blur(${ripple.isMobile ? 4 : 6}px)`,
                mixBlendMode: "screen",
                transform: 'translateZ(0)'
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Main Content - FIXED with higher z-index */}
      <motion.div
        style={{ 
          y: heroYSpring,
          opacity: heroOpacity
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 p-4 sm:p-6 lg:p-8 max-w-md mx-auto will-change-transform"
      >
                {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-fit mx-auto mb-6"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              backgroundPosition: {
                duration: 12,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            className={`
              font-extrabold tracking-wide text-center will-change-transform
              ${isMobile ? 'text-2xl' : 'text-3xl'}
            `}
            style={{
              background: 'linear-gradient(90deg, #059669, #10B981, #34D399, #10B981, #059669)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Your Profile
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            className={`h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded origin-left mx-auto ${
              isMobile ? 'w-24' : 'w-32'
            }`}
          />
        </motion.div>

        {/* PROFILE CARD with optimized 3D Tilt */}
        <motion.div
          style={{
            rotateX: !isMobile ? mousePosition.x : 0,
            rotateY: !isMobile ? mousePosition.y : 0,
            transformStyle: 'preserve-3d'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <GlowingCard glowColor="#10B981" isMobile={isMobile} tilt={false}>
            <div className="space-y-6 text-center">
              {/* Profile Image */}
              {user.photoURL ? (
                <motion.div
                  whileHover={!isMobile ? { scale: 1.03 } : {}}
                  whileTap={isMobile ? { scale: 0.95 } : {}}
                  className="relative w-32 h-32 mx-auto"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 blur-md"
                    animate={{ opacity: [0.3, 0.4, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity }}
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
                  whileHover={!isMobile ? { scale: 1.03 } : {}}
                  className="relative w-32 h-32 mx-auto"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-5xl text-green-600 font-bold">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : "👤"}
                  </div>
                </motion.div>
              )}

              {/* User Info */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-left space-y-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                    <p className={`font-bold text-gray-800 truncate ${
                      isMobile ? 'text-lg' : 'text-xl'
                    }`}>
                      {user.displayName || (
                        <span className="text-gray-400 italic">No name set</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <p className={`font-medium text-gray-700 truncate ${
                      isMobile ? 'text-base' : 'text-lg'
                    }`}>
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">User ID</p>
                    <p className={`font-mono text-gray-600 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    } break-all`}>
                      {user.uid.slice(0, 24)}...
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </GlowingCard>
        </motion.div>

        {/* UPDATE NAME FORM */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6"
        >
          <GlowingCard glowColor="#34D399" isMobile={isMobile} tilt={false}>
            <div className="space-y-4">
              <h3 className={`font-bold text-gray-800 text-center ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>
                Update Display Name
              </h3>

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
                  />
                </div>

                <motion.button
                  onClick={handleNameUpdate}
                  disabled={isUpdating || newName.trim() === ""}
                  whileHover={!isMobile && !isUpdating && newName.trim() !== "" ? { 
                    scale: 1.03,
                  } : {}}
                  whileTap={{ scale: 0.97 }}
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
                >
                  <span className="relative z-10 text-white">
                    {isUpdating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : 'Update Name'}
                  </span>
                </motion.button>
              </motion.div>

              <p className={`text-center text-gray-500 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Your display name will be visible across the app
              </p>
            </div>
          </GlowingCard>
        </motion.div>

        {/* Account Stats - optimized for both */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-100/50 ${
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
            <div
              key={idx}
              className="bg-white/90 rounded-xl p-3 text-center"
            >
              <div className={`font-medium text-green-700 mb-1 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                {stat.label}
              </div>
              <div className={`text-gray-600 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default memo(Profile);