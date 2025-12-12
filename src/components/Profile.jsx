import { useEffect, useState, useRef, useCallback } from "react";
import { auth } from "./FireBase";
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

// Micro Interaction Component
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
          width: isMobile ? '12px' : '16px',
          height: isMobile ? '12px' : '16px',
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
        initial={{ x: x - (isMobile ? 8 : 12), y: y - (isMobile ? 8 : 12), scale: 0, opacity: 0.7 }}
        animate={{
          scale: [0, 1.5],
          opacity: [0.7, 0]
        }}
        transition={{ duration: isMobile ? 0.6 : 0.8 }}
        style={{
          width: isMobile ? '20px' : '24px',
          height: isMobile ? '20px' : '24px',
          background: color,
          filter: 'blur(4px)'
        }}
      />
    );
  }
  
  return null;
};

// Interactive Background
const InteractiveBackground = ({ isMobile }) => {
  const [interactions, setInteractions] = useState([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && interactions.length < (isMobile ? 3 : 6)) {
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
    }, isMobile ? 1500 : 1000);
    
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

// Glowing Card Component
const GlowingCard = ({ children, glowColor = "#22c55e", className = "", isMobile, tilt = true }) => (
  <motion.div
    className={`relative rounded-2xl p-[1.5px] overflow-hidden ${className}`}
    style={{
      background: `linear-gradient(135deg, ${glowColor}40, transparent)`,
      boxShadow: `0 0 20px ${glowColor}40`,
    }}
    whileHover={!isMobile && tilt ? { scale: 1.02 } : {}}
    whileTap={isMobile ? { scale: 0.98 } : {}}
    transition={{ duration: 0.3 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent backdrop-blur-sm rounded-2xl opacity-0 hover:opacity-100 transition-all duration-500" />
    <div className={`relative rounded-2xl bg-white/90 backdrop-blur-xl z-10 ${isMobile ? 'p-4' : 'p-6'}`}>
      {children}
    </div>
  </motion.div>
);

// Floating Icons Component
const FloatingIcons = ({ isMobile }) => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {Array.from({ length: isMobile ? 12 : 20 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${
            isMobile ? 'w-1 h-1' : 'w-2 h-2'
          } bg-gradient-to-br from-green-300/30 to-emerald-400/30 blur-sm`}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            scale: Math.random() * 0.5 + 0.3,
          }}
          animate={{
            y: ["0%", "-15%", "0%"],
            x: ["0%", `${Math.random() * 10 - 5}%`, "0%"],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 8 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

function Profile() {
  const containerRef = useRef(null);
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });

  // Mouse position for 3D tilt
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  // Scroll animations
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start start", "end end"] 
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -40 : -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, isMobile ? 0.95 : 0.9]);
  const heroYSpring = useSpring(heroY, { 
    stiffness: isMobile ? 140 : 160, 
    damping: isMobile ? 35 : 30 
  });

  // Enhanced click/touch handler
  const handleInteraction = useCallback((e) => {
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
      'rgba(16, 185, 129, 0.6)',
      'rgba(52, 211, 153, 0.6)',
      'rgba(34, 197, 94, 0.6)',
      'rgba(5, 150, 105, 0.6)'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Create ripple
    const newRipple = {
      id: Date.now(),
      x,
      y,
      color,
      isMobile
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, isMobile ? 600 : 800);
  }, [isMobile]);

  // Mouse move handler for 3D tilt
  const handleMouseMove = useCallback((e) => {
    if (isMobile) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = ((centerY - y) / centerY) * 6;
    
    setMousePosition({ x: rotateX, y: rotateY });
  }, [isMobile]);

  // Touch move handler
  const handleTouchMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    if (!touch) return;

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setTouchPosition({ x, y });
  }, []);

  // Mobile-optimized Particle Background
  const particleOptions = {
    particles: {
      number: { 
        value: isMobile ? 25 : 35, 
        density: { 
          enable: true, 
          value_area: isMobile ? 350 : 450 
        } 
      },
      color: { value: ["#22c55e", "#10b981", "#34d399", "#a7f3d0"] },
      shape: { type: "circle" },
      opacity: { 
        value: isMobile ? 0.08 : 0.1, 
        random: true, 
        animation: { 
          enable: true, 
          speed: 1, 
          minimumValue: 0.05 
        } 
      },
      size: { 
        value: isMobile ? 1.5 : 2, 
        random: true, 
        animation: { 
          enable: true, 
          speed: 2, 
          minimumValue: 1 
        } 
      },
      move: {
        enable: true,
        speed: isMobile ? 0.15 : 0.2,
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

  // Fetch user data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle name update
  const handleNameUpdate = async () => {
    if (newName.trim() === "") {
      toast.error("Please enter a name");
      return;
    }

    setIsUpdating(true);
    
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      await auth.currentUser.reload();
      
      // Force refresh user info
      const updatedUser = auth.currentUser;
      setUser({ ...updatedUser });
      setNewName("");
      
      toast.success("Name updated successfully! 🎉", {
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.1)',
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
          border: '1px solid rgba(255,255,255,0.1)',
        }
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div 
        ref={containerRef}
        className="relative min-h-screen bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 overflow-hidden"
      >
        <Particles className="absolute inset-0 -z-10" options={particleOptions} />
        <FloatingIcons isMobile={isMobile} />
        
        <motion.div
          style={{ y: heroYSpring }}
          className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-md mx-auto"
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

  // Not logged in state
  if (!user) {
    return (
      <div 
        ref={containerRef}
        className="relative min-h-screen bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 overflow-hidden flex items-center justify-center"
      >
        <Particles className="absolute inset-0 -z-10" options={particleOptions} />
        <FloatingIcons isMobile={isMobile} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md"
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
      className="relative min-h-screen bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 overflow-hidden font-sans cursor-default"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-y'
      }}
    >
      {/* Enhanced Particle Background */}
      <Particles className="absolute inset-0 -z-10" options={particleOptions} />
      
      {/* Interactive Background Layer */}
      <InteractiveBackground isMobile={isMobile} />
      
      {/* Floating Icons */}
      <FloatingIcons isMobile={isMobile} />

      {/* Background Blobs */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full pointer-events-none"
            animate={{ 
              opacity: [0.15, 0.25, 0.15],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-200 via-emerald-200 to-teal-100 blur-[120px]" />
          </motion.div>

          <motion.div
            className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] rounded-full pointer-events-none"
            animate={{ 
              opacity: [0.15, 0.22, 0.15],
              scale: [1, 1.08, 1]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-100 via-emerald-100 to-green-200 blur-[120px]" />
          </motion.div>
        </>
      )}

      {/* Ripple Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              className="absolute pointer-events-none rounded-full"
              initial={{
                scale: 0,
                opacity: 0.6,
                x: ripple.x - (ripple.isMobile ? 10 : 15),
                y: ripple.y - (ripple.isMobile ? 10 : 15),
                width: ripple.isMobile ? 20 : 30,
                height: ripple.isMobile ? 20 : 30,
                background: `radial-gradient(circle, ${ripple.color}, ${ripple.color.replace('0.6', '0.2')})`
              }}
              animate={{
                scale: [0, ripple.isMobile ? 2 : 3, ripple.isMobile ? 2.5 : 3.5],
                opacity: [0.6, 0.2, 0],
                width: [
                  ripple.isMobile ? 20 : 30, 
                  ripple.isMobile ? 80 : 120, 
                  ripple.isMobile ? 100 : 150
                ],
                height: [
                  ripple.isMobile ? 20 : 30, 
                  ripple.isMobile ? 80 : 120, 
                  ripple.isMobile ? 100 : 150
                ],
                x: [
                  ripple.x - (ripple.isMobile ? 10 : 15), 
                  ripple.x - (ripple.isMobile ? 40 : 60), 
                  ripple.x - (ripple.isMobile ? 50 : 75)
                ],
                y: [
                  ripple.y - (ripple.isMobile ? 10 : 15), 
                  ripple.y - (ripple.isMobile ? 40 : 60), 
                  ripple.y - (ripple.isMobile ? 50 : 75)
                ]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: ripple.isMobile ? 0.7 : 1,
                ease: "easeOut"
              }}
              style={{
                filter: `blur(${ripple.isMobile ? 6 : 8}px)`,
                mixBlendMode: "screen"
              }}
            />
          ))}
        </AnimatePresence>

        {/* Touch Trail Effect */}
        {isMobile && (
          <motion.div
            className="absolute pointer-events-none rounded-full"
            animate={{
              x: touchPosition.x - 4,
              y: touchPosition.y - 4
            }}
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 35
            }}
            style={{
              width: 8,
              height: 8,
              background: "radial-gradient(circle, rgba(34,197,94,0.15), rgba(16,185,129,0.05))",
              border: `1px solid rgba(34,197,94,0.15)`,
              filter: 'blur(1px)'
            }}
          />
        )}
      </div>

      {/* Main Content */}
      <motion.div
        style={{ 
          y: heroYSpring,
          opacity: heroOpacity
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-md mx-auto"
      >
        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-fit mx-auto mb-8"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`
              font-extrabold tracking-wide text-center
              ${isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}
            `}
            style={{
              background: 'linear-gradient(90deg, #059669, #10B981, #34D399, #10B981, #059669)',
              backgroundSize: '300% 300%',
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
            transition={{ duration: 0.4 }}
            whileHover={!isMobile ? { scaleX: 1.1 } : {}}
            className={`h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded origin-left mx-auto ${
              isMobile ? 'w-24' : 'w-32'
            }`}
          />
        </motion.div>

        {/* PROFILE CARD with 3D Tilt */}
        <motion.div
          style={{
            rotateX: !isMobile ? mousePosition.x : 0,
            rotateY: !isMobile ? mousePosition.y : 0,
          }}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
        >
          <GlowingCard glowColor="#10B981" isMobile={isMobile} tilt={false}>
            <div className="space-y-6 text-center">
              {/* Profile Image */}
              {user.photoURL ? (
                <motion.div
                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                  whileTap={isMobile ? { scale: 0.95 } : {}}
                  className="relative w-32 h-32 mx-auto"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 blur-lg"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="relative w-full h-full rounded-full border-4 border-white shadow-xl"
                  />
                </motion.div>
              ) : (
                <motion.div
                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                  className="relative w-32 h-32 mx-auto"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-5xl text-green-600 font-bold">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : "👤"}
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-green-300 to-emerald-300 blur-lg"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
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
                  <div className="group">
                    <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                    <motion.p
                      whileHover={!isMobile ? { scale: 1.02, x: 5 } : {}}
                      className={`font-bold text-gray-800 ${
                        isMobile ? 'text-lg' : 'text-xl'
                      }`}
                    >
                      {user.displayName || (
                        <span className="text-gray-400 italic">No name set</span>
                      )}
                    </motion.p>
                  </div>

                  <div className="group">
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <motion.p
                      whileHover={!isMobile ? { scale: 1.02, x: 5 } : {}}
                      className={`font-medium text-gray-700 ${
                        isMobile ? 'text-base' : 'text-lg'
                      }`}
                    >
                      {user.email}
                    </motion.p>
                  </div>

                  <div className="group">
                    <p className="text-sm font-medium text-gray-500 mb-1">User ID</p>
                    <motion.p
                      whileHover={!isMobile ? { scale: 1.02, x: 5 } : {}}
                      className={`font-mono text-gray-600 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      } break-all`}
                    >
                      {user.uid}
                    </motion.p>
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
          transition={{ delay: 0.2 }}
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
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <div className="relative">
                  <motion.input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new display name"
                    whileFocus={!isMobile ? { 
                      scale: 1.02, 
                      boxShadow: "0 0 15px rgba(52, 211, 153, 0.3)" 
                    } : {}}
                    className={`
                      w-full px-4 py-3 bg-white/90 border border-green-200 
                      rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 
                      focus:ring-offset-1 placeholder-gray-400
                      ${isMobile ? 'text-sm' : ''}
                    `}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-100/20 to-emerald-100/20 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ opacity: 1 }}
                  />
                </div>

                <motion.button
                  onClick={handleNameUpdate}
                  disabled={isUpdating || newName.trim() === ""}
                  whileHover={!isMobile && !isUpdating && newName.trim() !== "" ? { 
                    scale: 1.05, 
                    boxShadow: "0px 6px 20px rgba(16,185,129,0.4)" 
                  } : {}}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-full py-3 rounded-lg font-medium relative overflow-hidden
                    transition-all duration-300
                    ${isUpdating 
                      ? 'bg-gradient-to-r from-gray-400 to-gray-300 cursor-not-allowed' 
                      : newName.trim() === ""
                      ? 'bg-gradient-to-r from-gray-300 to-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg'
                    }
                  `}
                >
                  {/* Animated liquid effect */}
                  {!isUpdating && newName.trim() !== "" && (
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                    />
                  )}
                  
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
                  
                  {!isUpdating && newName.trim() !== "" && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        background: "radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)",
                        filter: "blur(8px)"
                      }}
                    />
                  )}
                </motion.button>
              </motion.div>

              {/* Tips */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-center text-gray-500 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}
              >
                Your display name will be visible across the app
              </motion.p>
            </div>
          </GlowingCard>
        </motion.div>

        {/* Account Stats for Mobile */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-green-100/50"
          >
            <h4 className="font-semibold text-green-700 text-center mb-3 text-sm">
              Account Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              {[
                { label: "Created", value: user.metadata?.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                  : "N/A" 
                },
                { label: "Last Login", value: user.metadata?.lastSignInTime 
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                  : "N/A" 
                },
                { label: "Verified", value: user.emailVerified ? "✅ Yes" : "❌ No" },
                { label: "Provider", value: "Email" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/70 rounded-xl p-2"
                >
                  <div className="text-xs font-medium text-green-700 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions for Desktop */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-green-100/50"
          >
            <h4 className="font-semibold text-green-700 text-center mb-4">
              Account Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { label: "Account Created", value: user.metadata?.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString() 
                  : "Unknown" 
                },
                { label: "Last Login", value: user.metadata?.lastSignInTime 
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString() 
                  : "Unknown" 
                },
                { label: "Email Verified", value: user.emailVerified ? "✅ Yes" : "❌ No" },
                { label: "Provider", value: user.providerData?.[0]?.providerId || "Email" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/70 rounded-xl p-3"
                >
                  <div className="text-xs font-medium text-green-700 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Profile;

