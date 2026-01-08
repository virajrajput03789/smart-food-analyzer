import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from "../components/FireBase";
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useSpring, 
  useTransform
} from 'framer-motion';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';

function Header() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0, active: false });
  const [ripples, setRipples] = useState([]);
  const [clickEffects, setClickEffects] = useState([]);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const containerRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll behavior for header with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollThreshold = 100;
          const scrollDelta = 5; // Minimum scroll amount to trigger hide/show
          
          // Check if at top
          setIsAtTop(currentScrollY < 10);
          
          if (currentScrollY < scrollThreshold) {
            // At or near the top of the page
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY + scrollDelta) {
            // Scrolling down significantly
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY - scrollDelta) {
            // Scrolling up significantly
            setIsVisible(true);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Reset header visibility when navigating to a new page
  useEffect(() => {
    setIsVisible(true);
    setLastScrollY(0);
    setIsAtTop(true);
  }, [location.pathname]);

  // Mouse position tracking for desktop effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [8, -8]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [-6, 6]);
  const rotateYSpring = useSpring(rotateY, { stiffness: 200, damping: 25 });
  const rotateXSpring = useSpring(rotateX, { stiffness: 200, damping: 25 });

  // Handle mouse movement for hover effects
  const handleMouseMove = (e) => {
    if (isMobile) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoverPosition({ x, y, active: true });
    
    // Update mouse position for 3D effects
    const nx = (x / rect.width) - 0.5;
    const ny = (y / rect.height) - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  // Click ripple effect handler
  const handleClick = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create ripple effect
    const colors = ['#065F46', '#047857', '#059669', '#10B981'];
    const color = colors[Math.floor(Math.random() * colors.length)];

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
    }, 800);

    // Create click particle effect
    createClickParticles(e);
  }, [isMobile]);

  // Create particle explosion effect on click
  const createClickParticles = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const particles = [];

    // Create 8-12 particles in a circle
    const particleCount = 8 + Math.floor(Math.random() * 5);
    const colors = ['#065F46', '#047857', '#059669', '#10B981', '#34D399'];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;
      const size = 4 + Math.random() * 6;
      
      particles.push({
        id: Date.now() + i,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity,
        angle,
        size,
        life: 1
      });
    }

    setClickEffects(prev => [...prev, ...particles]);

    // Animate particles
    const interval = setInterval(() => {
      setClickEffects(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + Math.cos(p.angle) * p.velocity,
          y: p.y + Math.sin(p.angle) * p.velocity,
          life: p.life - 0.02,
          size: p.size * 0.98
        })).filter(p => p.life > 0);

        if (updated.length === 0) {
          clearInterval(interval);
        }
        return updated;
      });
    }, 16);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out successfully!");
    navigate('/login');
  };

  const navLinks = [
    { label: "Home", path: "/home" },
    { label: "About Us", path: "/aboutUs" },
    { label: "Contact Us", path: "/contactUs" },
    { label: "History", path: "/history", auth: true },
    { label: "Profile", path: "/profile", auth: true },
  ];

  // Ripple Effect Component
  const RippleEffect = ({ x, y, color }) => (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      initial={{
        scale: 0,
        opacity: 0.7,
        x: x - 15,
        y: y - 15,
        width: 30,
        height: 30,
      }}
      animate={{
        scale: [0, 3, 3.5],
        opacity: [0.7, 0.3, 0],
        width: [30, 120, 140],
        height: [30, 120, 140],
        x: [x - 15, x - 60, x - 70],
        y: [y - 15, y - 60, y - 70]
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.9,
        ease: "easeOut"
      }}
      style={{
        background: `radial-gradient(circle, ${color}80, ${color}40)`,
        filter: "blur(8px)",
        mixBlendMode: "screen"
      }}
    />
  );

  // Particle Effect Component
  const ParticleEffect = ({ x, y, color, size, life }) => (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      initial={{
        x,
        y,
        opacity: 1,
        scale: 1
      }}
      animate={{
        x,
        y,
        opacity: life,
        scale: life
      }}
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 10px ${color}80`
      }}
    />
  );

  return (
    <>
      {/* Spacer div to prevent content from hiding behind fixed header */}
      <div className="h-16 md:h-20" />
      
      {/* Header with proper fixed positioning */}
      <motion.header
        ref={containerRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPosition({ x: 0, y: 0, active: false })}
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          mass: 1
        }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Header Content Container */}
        <div className="relative">
          {/* Background with blur effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-emerald-900/95 via-emerald-800/90 to-emerald-900/95 backdrop-blur-xl border-b border-emerald-700/50 shadow-2xl"
            animate={{
              backdropFilter: isAtTop ? "blur(8px)" : "blur(12px)",
              boxShadow: isAtTop 
                ? "0 8px 32px rgba(0, 0, 0, 0.1)" 
                : "0 8px 32px rgba(0, 0, 0, 0.3)"
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Effects Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Click Particles */}
            <AnimatePresence>
              {clickEffects.map(particle => (
                <ParticleEffect key={particle.id} {...particle} />
              ))}
            </AnimatePresence>

            {/* Ripple Effects */}
            <AnimatePresence>
              {ripples.map(ripple => (
                <RippleEffect key={ripple.id} {...ripple} />
              ))}
            </AnimatePresence>

            {/* Hover Glow Effect (Desktop only) */}
            {!isMobile && (
              <motion.div
                className="absolute pointer-events-none rounded-full"
                animate={{
                  scale: hoverPosition.active ? 1 : 0,
                  opacity: hoverPosition.active ? 0.3 : 0,
                  x: hoverPosition.x - 60,
                  y: hoverPosition.y - 60
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25
                }}
                style={{
                  width: 120,
                  height: 120,
                  background: "radial-gradient(circle, rgba(6, 95, 70, 0.4), rgba(4, 120, 87, 0.2), transparent 70%)",
                  filter: "blur(20px)"
                }}
              />
            )}
          </div>

          {/* Animated Background Pattern */}
          <motion.div
            className="absolute inset-0 -z-10 opacity-10"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Animated Background Gradient */}
          <motion.div
            className="absolute inset-0 -z-10"
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: "radial-gradient(circle at 50% 0%, rgba(6, 95, 70, 0.3), transparent 60%)",
              filter: "blur(30px)"
            }}
          />

          {/* Floating Elements (Desktop only) */}
          {!isMobile && [1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full pointer-events-none ${
                i === 1 ? 'w-8 h-8 bg-emerald-700/20 top-4 right-1/4' :
                i === 2 ? 'w-6 h-6 bg-emerald-600/15 top-6 left-1/4' :
                'w-4 h-4 bg-emerald-500/10 bottom-6 right-1/3'
              }`}
              animate={{
                y: [0, -15, 0],
                x: [0, 8, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}

          {/* Main Header Content */}
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">
            {/* Logo + Name */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 relative group cursor-pointer"
            >
              {/* Logo Container with Enhanced Effects */}
              <motion.div
                className="relative"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{
                  rotate: [0, 360],
                  transition: { duration: 1 }
                }}
              >
                {/* Glowing Halo */}
                <motion.div
                  className="absolute -inset-3 rounded-full"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: "radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent 70%)",
                    filter: "blur(12px)"
                  }}
                />
                
                <motion.img
                  src="/logo1.jpg"
                  alt="Smart Food Analyzer Logo"
                  className="w-12 h-12 rounded-full object-cover shadow-2xl relative z-10 border-2 border-emerald-600/50"
                  whileTap={{ scale: 0.9 }}
                  drag
                  dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                  dragElastic={0.2}
                />
              </motion.div>

              {/* PureScan Text - Simple White */}
              <div className="relative">
                <motion.h1
                  className={`font-bold text-white ${isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-4xl'}`}
                  style={{
                    letterSpacing: '0.05em',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                    transition: { type: "spring", stiffness: 400 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  PureScan
                </motion.h1>
                
                {/* Simple White Underline */}
                <motion.div
                  className={`bg-white rounded-full ${isMobile ? 'h-1' : 'h-1.5'}`}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.3 }}
                  whileHover={{ scaleX: 1.2 }}
                />
              </div>
            </motion.div>

            {/* Desktop Navigation - Enhanced */}
            <nav className="hidden md:flex items-center gap-8 text-gray-100 font-medium text-sm">
              {navLinks.map((link, idx) =>
                (!link.auth || user) && (
                  <motion.div
                    key={link.path}
                    className="relative group"
                    style={{ 
                      rotateY: rotateYSpring,
                      rotateX: rotateXSpring 
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <Link
                      to={link.path}
                      className={`relative px-4 py-2.5 transition-all duration-300 rounded-xl group ${
                        location.pathname === link.path 
                          ? "text-white font-semibold" 
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {link.label}
                        <motion.span
                          className="text-xs opacity-0 group-hover:opacity-100"
                          initial={{ x: -5 }}
                          animate={{ x: 0 }}
                        >
                          →
                        </motion.span>
                      </span>
                      
                      {/* Hover Background Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-900/30 to-green-900/20"
                        initial={{ scale: 0, opacity: 0 }}
                        whileHover={{ 
                          scale: 1,
                          opacity: 1,
                          transition: { duration: 0.3 }
                        }}
                      />
                      
                      {/* Active Indicator */}
                      {location.pathname === link.path && (
                        <motion.div
                          className="absolute -bottom-2 left-3 right-3 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full shadow-lg"
                          layoutId="activeIndicator"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      
                      {/* Hover Border Animation */}
                      <motion.div
                        className="absolute inset-0 rounded-xl border border-emerald-500/30"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                  </motion.div>
                )
              )}

              {/* Auth Buttons */}
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {user ? (
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 30px rgba(6, 95, 70, 0.4)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Button Glow Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl"
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
                        filter: "blur(10px)"
                      }}
                    />
                    
                    <span className="relative z-10">Logout</span>
                    
                    {/* Animated Icon */}
                    <motion.svg
                      className="w-5 h-5 relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </motion.svg>
                    
                    {/* Button Border Animation */}
                    <motion.div
                      className="absolute inset-0 rounded-xl"
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
                  </motion.button>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/signin"
                        className="relative text-emerald-300 font-medium hover:text-white transition-colors duration-300 group"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Sign Up
                          <motion.span
                            className="text-lg"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 0.5 }}
                          >
                            +
                          </motion.span>
                        </span>
                        <motion.span
                          className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 10px 30px rgba(6, 95, 70, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/login"
                        className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        {/* Button Glow Effect */}
                        <motion.div
                          className="absolute inset-0 rounded-xl"
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
                            filter: "blur(10px)"
                          }}
                        />
                        
                        <span className="relative z-10">Log In</span>
                        
                        {/* Animated Icon */}
                        <motion.svg
                          className="w-5 h-5 relative z-10"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </motion.svg>
                        
                        {/* Button Border Animation */}
                        <motion.div
                          className="absolute inset-0 rounded-xl"
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
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </nav>

            {/* Enhanced Mobile Menu Toggle */}
            <motion.div 
              className="md:hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-800 to-green-800 border border-emerald-600/50 flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all group"
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{
                    opacity: [0.15, 0.3, 0.15],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: "radial-gradient(circle, rgba(16,185,129,0.3), transparent 70%)"
                  }}
                />
                
                {/* Pulse Ring Effect */}
                {menuOpen && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-emerald-400/50"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                )}
                
                <AnimatePresence mode="wait">
                  {menuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3, type: "spring" }}
                    >
                      <HiX className="text-white text-xl" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.3, type: "spring" }}
                    >
                      <HiOutlineMenuAlt3 className="text-white text-xl" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          </div>

          {/* Enhanced Mobile Drawer */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="md:hidden overflow-hidden"
              >
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 border-t border-emerald-700/50 shadow-2xl backdrop-blur-xl px-6 py-8"
                >
                  {/* Drawer Background Effects */}
                  <motion.div
                    className="absolute inset-0 -z-10"
                    animate={{
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      background: "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.15), transparent 60%)",
                      filter: "blur(20px)"
                    }}
                  />

                  <div className="space-y-3">
                    {navLinks.map((link, idx) =>
                      (!link.auth || user) && (
                        <motion.div
                          key={link.path}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: idx * 0.05 + 0.2,
                            type: "spring",
                            stiffness: 200 
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            to={link.path}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-4 py-4 px-5 rounded-xl transition-all duration-300 active:scale-95 group ${
                              location.pathname === link.path
                                ? "bg-gradient-to-r from-emerald-800 to-green-800 text-white font-semibold border border-emerald-600/50 shadow-lg"
                                : "text-gray-300 hover:bg-emerald-800/50 hover:text-white active:bg-emerald-700/50"
                            }`}
                          >
                            {/* Animated Dot Indicator */}
                            <motion.div
                              className="relative"
                              whileHover={{ scale: 1.2 }}
                            >
                              {location.pathname === link.path && (
                                <motion.div
                                  className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 shadow-lg"
                                  layoutId="mobileActiveDot"
                                  animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [1, 0.7, 1]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity
                                  }}
                                />
                              )}
                              {!location.pathname === link.path && (
                                <div className="w-2 h-2 rounded-full bg-emerald-600/30 group-hover:bg-emerald-400/50" />
                              )}
                            </motion.div>
                            
                            <span className="text-sm font-medium flex-1">{link.label}</span>
                            
                            <motion.div
                              className="opacity-0 group-hover:opacity-100"
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              →
                            </motion.div>
                          </Link>
                        </motion.div>
                      )
                    )}

                    {/* Mobile Auth Buttons */}
                    <motion.div
                      className="pt-6 border-t border-emerald-700/50 space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {user ? (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full bg-gradient-to-r from-emerald-700 to-green-700 text-white py-4 rounded-xl font-semibold shadow-lg active:shadow-md transition-all relative overflow-hidden group"
                        >
                          {/* Button Effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600"
                            initial={{ x: "-100%" }}
                            whileTap={{ x: 0 }}
                            transition={{ duration: 0.3 }}
                          />
                          <span className="relative z-10">Logout</span>
                        </motion.button>
                      ) : (
                        <>
                          <motion.div
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              to="/signin"
                              onClick={() => setMenuOpen(false)}
                              className="block w-full text-center text-emerald-300 font-medium py-4 rounded-xl border-2 border-emerald-600/50 hover:bg-emerald-800/30 active:bg-emerald-700/30 transition-all group"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                Sign Up
                                <motion.span
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ duration: 0.5 }}
                                >
                                  +
                                </motion.span>
                              </span>
                            </Link>
                          </motion.div>
                          
                          <motion.div
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              to="/login"
                              onClick={() => setMenuOpen(false)}
                              className="block w-full text-center bg-gradient-to-r from-emerald-700 to-green-700 text-white py-4 rounded-xl font-semibold shadow-lg active:shadow-md transition-all relative overflow-hidden group"
                            >
                              {/* Button Effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600"
                                initial={{ x: "-100%" }}
                                whileTap={{ x: 0 }}
                                transition={{ duration: 0.3 }}
                              />
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                Log In
                                <motion.svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  animate={{ x: [0, 3, 0] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </motion.svg>
                              </span>
                            </Link>
                          </motion.div>
                        </>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
}

export default Header;


