import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { HiOutlineMenuAlt3, HiX, HiArrowRight, HiPlus, HiLogout, HiLogin, HiUserAdd } from 'react-icons/hi';

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

// Optimized RippleEffect
const RippleEffect = React.memo(({ x, y, color, isMobile }) => (
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
      mixBlendMode: "screen",
      willChange: "transform, opacity"
    }}
  />
));

RippleEffect.displayName = 'RippleEffect';

// Optimized ParticleEffect
const ParticleEffect = React.memo(({ x, y, color, size, life }) => (
  <motion.div
    className="absolute pointer-events-none rounded-full"
    initial={{ x, y, opacity: 1, scale: 1 }}
    animate={{ x, y, opacity: life, scale: life }}
    style={{
      width: size,
      height: size,
      background: color,
      boxShadow: `0 0 10px ${color}80`,
      willChange: "transform, opacity",
      transform: "translateZ(0)",
      backfaceVisibility: "hidden"
    }}
  />
));

ParticleEffect.displayName = 'ParticleEffect';

// FloatingElement with mobile optimization
const FloatingElement = React.memo(({ index, isMobile }) => {
  const config = useMemo(() => [
    { className: 'w-8 h-8 bg-emerald-700/20 top-4 right-1/4', duration: 8 },
    { className: 'w-6 h-6 bg-emerald-600/15 top-6 left-1/4', duration: 10 },
    { className: 'w-4 h-4 bg-emerald-500/10 bottom-6 right-1/3', duration: 12 }
  ][index], [index]);

  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${config.className}`}
      animate={
        isMobile ? {} : {
          y: [0, -15, 0],
          x: [0, 8, 0],
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1]
        }
      }
      transition={
        isMobile ? {} : {
          duration: config.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.5
        }
      }
      style={{
        transform: "translateZ(0)",
        willChange: "transform"
      }}
    />
  );
});

FloatingElement.displayName = 'FloatingElement';

// Premium Hover Card - Clean and Professional
const PremiumHoverCard = React.memo(({ children, className = "", isMobile = false }) => {
  const cardRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Subtle background gradient on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovering ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "linear-gradient(135deg, rgba(6, 95, 70, 0.1) 0%, rgba(4, 120, 87, 0.05) 100%)",
          willChange: "opacity"
        }}
      />
      
      {/* Elegant border animation */}
      <motion.div
        className="absolute inset-0 rounded-lg border border-transparent"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isHovering ? 1 : 0,
          borderColor: isHovering ? "rgba(16, 185, 129, 0.2)" : "transparent"
        }}
        transition={{ duration: 0.3 }}
        style={{
          willChange: "opacity, border-color"
        }}
      />
      
      {/* Content with subtle lift effect */}
      <motion.div
        className="relative z-10"
        animate={{
          y: isHovering ? -2 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        style={{
          willChange: "transform"
        }}
      >
        {children}
      </motion.div>
    </div>
  );
});

PremiumHoverCard.displayName = 'PremiumHoverCard';

// Professional Text Hover Effect
const ProfessionalHoverText = React.memo(({ children, className = "", active = false }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <span className="relative z-10 transition-colors duration-200">
        {children}
      </span>
      
      {/* Underline animation */}
      <motion.span
        className="absolute -bottom-1 left-0 h-px bg-emerald-500"
        initial={{ width: active ? "100%" : 0 }}
        animate={{ width: isHovering || active ? "100%" : 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
        style={{
          willChange: "width"
        }}
      />
      
      {/* Text color transition */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovering ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          willChange: "opacity"
        }}
      >
        {children}
      </motion.span>
    </span>
  );
});

ProfessionalHoverText.displayName = 'ProfessionalHoverText';

// Elegant Icon Hover
const ElegantIconHover = React.memo(({ children, className = "", size = "md" }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7"
  };
  
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        x: isHovering ? 2 : 0
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      style={TYPOGRAPHY_CONFIG.button}
    >
      {/* Icon with color transition */}
      <motion.div
        animate={{
          color: isHovering ? "#10B981" : "currentColor"
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
});

ElegantIconHover.displayName = 'ElegantIconHover';

function Header() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  // State with lazy initialization
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0, active: false });
  const [ripples, setRipples] = useState([]);
  const [clickEffects, setClickEffects] = useState([]);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  
  // Refs for performance optimization
  const containerRef = useRef(null);
  const scrollAnimationRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const particleAnimationRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Memoized constants
  const navLinks = useMemo(() => [
    { label: "Home", path: "/home" },
    { label: "About Us", path: "/aboutUs" },
    { label: "Contact Us", path: "/contactUs" },
    { label: "History", path: "/history", auth: true },
    { label: "Profile", path: "/profile", auth: true },
  ], []);

  // Optimized device detection with ResizeObserver
  useEffect(() => {
    const handleResize = (entries) => {
      const entry = entries[0];
      if (!entry) return;
      
      const width = entry.contentRect.width;
      const mobile = width < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      }
    };

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(handleResize);
      if (containerRef.current) {
        resizeObserverRef.current.observe(containerRef.current);
      }
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isMobile]);

  // Ultra-optimized scroll handler
  useEffect(() => {
    let ticking = false;
    let lastY = window.scrollY;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = Math.abs(currentY - lastY);
          
          setIsAtTop(currentY < 10);
          
          if (delta > 5) {
            setIsVisible(currentY < lastY || currentY < 100);
          }
          
          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset header on navigation with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsAtTop(window.scrollY < 10);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Optimized mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [2, -2]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [-1, 1]);
  const rotateYSpring = useSpring(rotateY, { stiffness: 100, damping: 30 });
  const rotateXSpring = useSpring(rotateX, { stiffness: 100, damping: 30 });

  // Touch/mouse handlers
  const handlePointerMove = useCallback((e) => {
    if (isMobile || menuOpen) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    
    setHoverPosition({ x, y, active: true });
    mouseX.set((x / rect.width) - 0.5);
    mouseY.set((y / rect.height) - 0.5);
  }, [isMobile, menuOpen, mouseX, mouseY]);

  // Touch start handler for mobile
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [isMobile]);

  // Optimized click handler
  const handleClick = useCallback((e) => {
    if (clickTimeoutRef.current) {
      cancelAnimationFrame(clickTimeoutRef.current);
    }
    
    clickTimeoutRef.current = requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (isMobile) {
        const colors = ['#065F46'];
        const color = colors[0];
        
        const newRipple = {
          id: Date.now(),
          x,
          y,
          color,
          isMobile
        };
        
        setRipples(prev => {
          const updated = [...prev, newRipple];
          return updated.slice(-2);
        });
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      } else {
        const colors = ['#065F46', '#047857'];
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
          return updated.slice(-3);
        });
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 800);
      }
    });
  }, [isMobile]);

  // Cleanup animations
  useEffect(() => {
    return () => {
      if (particleAnimationRef.current) {
        cancelAnimationFrame(particleAnimationRef.current);
      }
      if (clickTimeoutRef.current) {
        cancelAnimationFrame(clickTimeoutRef.current);
      }
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, []);

  // Optimized logout handler
  const handleLogout = useCallback(async () => {
    await signOut(auth);
    toast.success("Logged out successfully!");
    navigate('/login');
  }, [navigate]);

  // Memoized filtered nav links
  const filteredNavLinks = useMemo(() => 
    navLinks.filter(link => !link.auth || user), 
    [navLinks, user]
  );

  // Professional Desktop Navigation
  const renderDesktopNav = useMemo(() => {
    return (
      <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-gray-100 font-medium text-sm lg:text-base">
        {filteredNavLinks.map((link, idx) => (
          <PremiumHoverCard
            key={link.path}
            className="group"
            isMobile={isMobile}
          >
            <Link
              to={link.path}
              className={`relative px-5 lg:px-6 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === link.path 
                  ? "text-white font-semibold" 
                  : "text-gray-300 hover:text-white"
              }`}
              prefetch="intent"
            >
              <span className="relative z-10 flex items-center gap-3 lg:gap-4">
                <Typography variant="accent">
                  <ProfessionalHoverText 
                    className="font-medium"
                    active={location.pathname === link.path}
                  >
                    {link.label}
                  </ProfessionalHoverText>
                </Typography>
                
                <ElegantIconHover size="sm">
                  <HiArrowRight className="text-emerald-400/0 group-hover:text-emerald-400 transition-colors duration-200" />
                </ElegantIconHover>
              </span>
              
              {/* Active indicator */}
              {location.pathname === link.path && (
                <motion.div
                  className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                  layoutId="activeIndicator"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  style={{
                    willChange: "transform"
                  }}
                />
              )}
            </Link>
          </PremiumHoverCard>
        ))}

        <div className="flex items-center gap-3 lg:gap-4">
          {user ? (
            <PremiumHoverCard isMobile={isMobile}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-600 hover:to-green-600 text-white px-6 lg:px-7 py-3 lg:py-3.5 rounded-lg font-semibold transition-all duration-200 overflow-hidden"
                aria-label="Logout"
                style={TYPOGRAPHY_CONFIG.button}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <ElegantIconHover size="md">
                    <HiLogout className="text-white group-hover:text-emerald-100 transition-colors" />
                  </ElegantIconHover>
                  <Typography variant="button">
                    <ProfessionalHoverText className="font-semibold">
                      Logout
                    </ProfessionalHoverText>
                  </Typography>
                </span>
                
                {/* Hover background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    willChange: "transform"
                  }}
                />
              </motion.button>
            </PremiumHoverCard>
          ) : (
            <>
              <PremiumHoverCard isMobile={isMobile}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/signin"
                    className="group relative inline-flex items-center gap-3 px-5 lg:px-6 py-3 lg:py-3.5 rounded-lg font-medium transition-all duration-200 border border-emerald-600/30 hover:border-emerald-500/50 text-emerald-300 hover:text-white bg-emerald-900/20 hover:bg-emerald-800/30"
                    prefetch="intent"
                    style={TYPOGRAPHY_CONFIG.button}
                  >
                    <ElegantIconHover size="md">
                      <HiUserAdd className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    </ElegantIconHover>
                    
                    <Typography variant="button">
                      <ProfessionalHoverText className="font-semibold">
                        Sign Up
                      </ProfessionalHoverText>
                    </Typography>
                  </Link>
                </motion.div>
              </PremiumHoverCard>
              
              <PremiumHoverCard isMobile={isMobile}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-600 hover:to-green-600 text-white px-6 lg:px-7 py-3 lg:py-3.5 rounded-lg font-semibold transition-all duration-200 overflow-hidden"
                    prefetch="intent"
                    style={TYPOGRAPHY_CONFIG.button}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <ElegantIconHover size="md">
                        <HiLogin className="text-white group-hover:text-emerald-100 transition-colors" />
                      </ElegantIconHover>
                      <Typography variant="button">
                        <ProfessionalHoverText className="font-semibold">
                          Log In
                        </ProfessionalHoverText>
                      </Typography>
                    </span>
                    
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        willChange: "transform"
                      }}
                    />
                  </Link>
                </motion.div>
              </PremiumHoverCard>
            </>
          )}
        </div>
      </nav>
    );
  }, [filteredNavLinks, location.pathname, user, handleLogout, isMobile]);

  // Professional Mobile Drawer
  const renderMobileDrawer = useMemo(() => (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden overflow-hidden"
          style={{ transform: "translateZ(0)" }}
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 border-t border-emerald-700/30 backdrop-blur-xl px-4 sm:px-6 py-6"
            style={{ willChange: "transform" }}
          >
            <div className="space-y-2">
              {filteredNavLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: idx * 0.03,
                    type: "tween"
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{ willChange: "transform" }}
                >
                  <Link
                    to={link.path}
                    onClick={() => {
                      requestAnimationFrame(() => setMenuOpen(false));
                    }}
                    className={`group flex items-center gap-4 py-3 px-4 rounded-lg transition-all duration-150 active:scale-95 ${
                      location.pathname === link.path
                        ? "bg-gradient-to-r from-emerald-800 to-green-800 text-white font-semibold"
                        : "text-gray-300 hover:bg-emerald-800/30 active:bg-emerald-700/30"
                    }`}
                  >
                    <div className="relative">
                      {location.pathname === link.path && (
                        <motion.div
                          className="w-2 h-2 rounded-full bg-emerald-400"
                          layoutId="mobileActiveDot"
                          animate={{
                            scale: [1, 1.3, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity
                          }}
                          style={{
                            willChange: "transform"
                          }}
                        />
                      )}
                    </div>
                    
                    <Typography variant="accent" className="text-sm font-medium flex-1">
                      {link.label}
                    </Typography>
                    
                    <motion.div
                      className="opacity-0 group-hover:opacity-100"
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{
                        willChange: "transform, opacity"
                      }}
                    >
                      <HiArrowRight className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="pt-4 border-t border-emerald-700/30 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {user ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="overflow-hidden rounded-lg"
                  >
                    <button
                      onClick={() => {
                        requestAnimationFrame(() => {
                          setMenuOpen(false);
                          handleLogout();
                        });
                      }}
                      className="w-full bg-gradient-to-r from-emerald-700 to-green-700 text-white py-3 rounded-lg font-semibold active:scale-95 transition-transform flex items-center justify-center gap-3"
                      style={TYPOGRAPHY_CONFIG.button}
                    >
                      <HiLogout className="w-5 h-5" />
                      <Typography variant="button">
                        Logout
                      </Typography>
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      className="overflow-hidden rounded-lg"
                    >
                      <Link
                        to="/signin"
                        onClick={() => requestAnimationFrame(() => setMenuOpen(false))}
                        className="group block w-full text-center text-emerald-300 font-medium py-3 rounded-lg border border-emerald-600/30 active:scale-95 transition-transform bg-emerald-900/20 flex items-center justify-center gap-3"
                        style={TYPOGRAPHY_CONFIG.button}
                      >
                        <HiUserAdd className="w-5 h-5" />
                        <Typography variant="button">
                          Sign Up
                        </Typography>
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      className="overflow-hidden rounded-lg"
                    >
                      <Link
                        to="/login"
                        onClick={() => requestAnimationFrame(() => setMenuOpen(false))}
                        className="group block w-full text-center bg-gradient-to-r from-emerald-700 to-green-700 text-white py-3 rounded-lg font-semibold active:scale-95 transition-transform flex items-center justify-center gap-3"
                        style={TYPOGRAPHY_CONFIG.button}
                      >
                        <HiLogin className="w-5 h-5" />
                        <Typography variant="button">
                          Log In
                        </Typography>
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
  ), [menuOpen, filteredNavLinks, location.pathname, user, handleLogout]);

  // Professional Logo
  const renderLogo = useMemo(() => (
    <PremiumHoverCard className="cursor-pointer" isMobile={isMobile}>
      <div className="flex items-center gap-3">
        <motion.div
          className="relative"
          whileHover={{ 
            rotate: 360,
            transition: { duration: 0.6, ease: "easeInOut" }
          }}
          whileTap={{ scale: 0.9 }}
          style={{ willChange: "transform" }}
        >
          <motion.div
            className="absolute -inset-2 rounded-full"
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.2), transparent 70%)",
              filter: "blur(8px)",
              willChange: "transform, opacity"
            }}
          />
          
          <motion.img
            src="/logo1.jpg"
            alt="PureScan"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-lg relative z-10 border border-emerald-600/30 hover:border-emerald-500/50 transition-colors"
            whileHover={{ scale: 1.1 }}
            loading="eager"
            decoding="async"
            style={{ willChange: "transform" }}
          />
        </motion.div>

        <div className="relative">
          <Typography variant="heading" as={motion.h1}
            className={`font-bold text-white ${isMobile ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl'}`}
            style={{
              letterSpacing: '0.05em',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            whileHover={{ 
              scale: 1.03,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: "transform" }}
          >
            <ProfessionalHoverText className="font-extrabold tracking-tight text-2xl sm:text-3xl md:text-4xl">
              PureScan
            </ProfessionalHoverText>
          </Typography>
          
          <motion.div
            className={`bg-emerald-500 rounded-full ${isMobile ? 'h-0.5' : 'h-1'}`}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.3 }}
            whileHover={{ 
              scaleX: 1.1
            }}
            transition={{
              scaleX: { duration: 0.2 }
            }}
            style={{
              willChange: "transform"
            }}
          />
        </div>
      </div>
    </PremiumHoverCard>
  ), [isMobile]);

  return (
    <>
      <div className="h-16 md:h-20" />
      
      <motion.header
        ref={containerRef}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handlePointerMove}
        onMouseMove={handlePointerMove}
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
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          willChange: "transform"
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-emerald-900/95 via-emerald-800/90 to-emerald-900/95 backdrop-blur-lg border-b border-emerald-700/20 shadow-lg"
            animate={{
              backdropFilter: isAtTop ? "blur(8px)" : "blur(12px)",
            }}
            transition={{ duration: 0.2 }}
            style={{
              transform: "translateZ(0)",
              willChange: "backdrop-filter, opacity"
            }}
          />

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <AnimatePresence>
              {clickEffects.map(particle => (
                <ParticleEffect key={particle.id} {...particle} />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {ripples.map(ripple => (
                <RippleEffect key={ripple.id} {...ripple} />
              ))}
            </AnimatePresence>

            {!isMobile && (
              <motion.div
                className="absolute pointer-events-none rounded-full"
                animate={{
                  scale: hoverPosition.active ? 1 : 0,
                  opacity: hoverPosition.active ? 0.1 : 0,
                  x: hoverPosition.x - 60,
                  y: hoverPosition.y - 60
                }}
                transition={{
                  type: "tween",
                  duration: 0.15
                }}
                style={{
                  width: 120,
                  height: 120,
                  background: "radial-gradient(circle, rgba(6, 95, 70, 0.2), transparent 70%)",
                  filter: "blur(20px)",
                  willChange: "transform, opacity"
                }}
              />
            )}
          </div>

          {!isMobile && [0, 1, 2].map((i) => (
            <FloatingElement key={i} index={i} isMobile={isMobile} />
          ))}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between relative">
            {renderLogo}

            {renderDesktopNav}

            <PremiumHoverCard className="md:hidden" isMobile={isMobile}>
              <motion.button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-emerald-800 to-green-800 border border-emerald-600/20 hover:border-emerald-500/40 flex items-center justify-center shadow active:scale-95 transition-all group"
                aria-label="Toggle menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                style={TYPOGRAPHY_CONFIG.button}
              >
                <AnimatePresence mode="wait">
                  {menuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2, type: "tween" }}
                    >
                      <HiX className="text-white text-lg sm:text-xl relative z-10" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2, type: "tween" }}
                    >
                      <HiOutlineMenuAlt3 className="text-white text-lg sm:text-xl relative z-10" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </PremiumHoverCard>
          </div>

          {renderMobileDrawer}
        </div>
      </motion.header>
    </>
  );
}

export default React.memo(Header);