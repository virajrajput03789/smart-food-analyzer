import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { auth, db } from "./FireBase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";

// ============================================
// FONT STYLES & TYPOGRAPHY SYSTEM (SCAN HISTORY PAGE)
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
const Typography = memo(({ 
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

// ============================================
// EXISTING CODE CONTINUES BELOW (NO OTHER CHANGES)
// ============================================

// Memoized motion configs to prevent re-renders
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

// Optimized MicroInteraction with memo
const MicroInteraction = memo(({ type, x, y, color, isMobile }) => {
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
});

MicroInteraction.displayName = 'MicroInteraction';

// Memoized InteractiveBackground
const InteractiveBackground = memo(({ isMobile }) => {
  const [interactions, setInteractions] = useState([]);
  
  useEffect(() => {
    let animationFrameId;
    let lastTime = 0;
    
    const updateInteractions = (currentTime) => {
      if (!lastTime || currentTime - lastTime > (isMobile ? 1500 : 1000)) {
        if (Math.random() > 0.7 && interactions.length < (isMobile ? 3 : 6)) {
          const type = Math.random() > 0.5 ? 'sparkle' : 'pulse';
          const colors = ['#10B981', '#34D399', '#22C55E', '#059669'];
          setInteractions(prev => [
            ...prev.slice(-(isMobile ? 2 : 5)),
            {
              id: Date.now(),
              type,
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              color: colors[Math.floor(Math.random() * colors.length)]
            }
          ]);
        }
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(updateInteractions);
    };
    
    animationFrameId = requestAnimationFrame(updateInteractions);
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {interactions.map(interaction => (
        <MicroInteraction key={interaction.id} {...interaction} isMobile={isMobile} />
      ))}
    </div>
  );
});

InteractiveBackground.displayName = 'InteractiveBackground';

// Optimized GlowingCard with memo
const GlowingCard = memo(({ children, glowColor = "#22c55e", className = "", isMobile }) => (
  <motion.div
    className={`relative rounded-2xl p-[1.5px] overflow-hidden ${className}`}
    style={{
      background: `linear-gradient(135deg, ${glowColor}40, transparent)`,
      boxShadow: `0 0 20px ${glowColor}40`,
    }}
    whileHover={!isMobile ? { scale: 1.02 } : {}}
    whileTap={isMobile ? { scale: 0.98 } : {}}
    transition={{ duration: 0.3 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent backdrop-blur-sm rounded-2xl opacity-0 hover:opacity-100 transition-all duration-500" />
    <div className={`relative rounded-2xl bg-white/90 backdrop-blur-xl z-10 ${isMobile ? 'p-3' : 'p-4'}`}>
      {children}
    </div>
  </motion.div>
));

GlowingCard.displayName = 'GlowingCard';

// Optimized FloatingIcons with useMemo for positions
const FloatingIcons = memo(({ isMobile }) => {
  const iconPositions = useMemo(() => 
    Array.from({ length: isMobile ? 8 : 15 }).map(() => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
      scale: Math.random() * 0.5 + 0.3,
      duration: 8 + Math.random() * 8,
      xMovement: Math.random() * 10 - 5
    }))
  , [isMobile]);
  
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {iconPositions.map((pos, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${
            isMobile ? 'w-1 h-1' : 'w-2 h-2'
          } bg-gradient-to-br from-green-300/30 to-emerald-400/30 blur-sm`}
          initial={{
            x: pos.x,
            y: pos.y,
            scale: pos.scale,
          }}
          animate={{
            y: ["0%", "-15%", "0%"],
            x: ["0%", `${pos.xMovement}%`, "0%"],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: pos.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

FloatingIcons.displayName = 'FloatingIcons';

// Memoized ScanItem component for better list performance
const ScanItem = memo(({ scan, isMobile, onDelete }) => {
  const handleDelete = useCallback(() => {
    onDelete(scan);
  }, [scan, onDelete]);
  
  const scanTime = useMemo(() => {
    if (scan.timestamp?.seconds) return new Date(scan.timestamp.seconds * 1000).toLocaleString();
    return "Unknown";
  }, [scan.timestamp]);
  
  const glowColor = useMemo(() => 
    scan.type === "cosmetic" ? "#ec4899" : 
    scan.type === "food" ? "#22c55e" : "#9ca3af"
  , [scan.type]);
  
  return (
    <motion.li
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <GlowingCard glowColor={glowColor} isMobile={isMobile}>
        <div className={`space-y-${isMobile ? '2' : '3'}`}>
          <div className="flex justify-between items-start gap-2">
            <Typography as="h3" variant="subheading" className="text-gray-800 truncate flex-1">
              {scan.productName || "Unknown Product"}
            </Typography>
            <motion.span
              whileHover={!isMobile ? { scale: 1.1 } : {}}
              whileTap={{ scale: 0.95 }}
              className={`relative px-2 py-1 rounded text-white text-xs font-semibold z-10 flex-shrink-0 ${
                isMobile ? 'text-[10px]' : ''
              } ${scan.type === "cosmetic"
                ? "bg-gradient-to-r from-pink-500 to-rose-500"
                : scan.type === "food"
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-gray-500 to-gray-400"}`}
            >
              {scan.type || "unknown"}
            </motion.span>
          </div>
          
          <div className={`text-gray-600 space-y-${isMobile ? '1' : '2'}`}>
            <Typography variant="body" className="flex items-center gap-1">
              <span className="font-medium">Barcode:</span>
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                {scan.barcode || "N/A"}
              </span>
            </Typography>
            
            {scan.nutritionScore && (
              <div className="flex items-center gap-2">
                <Typography variant="accent" className="font-medium">
                  {scan.type === "cosmetic" ? "Safety Score:" : "Nutrition Score:"}
                </Typography>
                <motion.span
                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                  className="relative inline-block"
                >
                  <span
                    className={`px-2 py-1 rounded text-white font-bold z-10 relative ${
                      isMobile ? 'text-xs' : 'text-sm'
                    } ${scan.nutritionScore?.value >= 80
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : scan.nutritionScore?.value >= 50
                      ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                      : "bg-gradient-to-r from-red-500 to-rose-500"}`}
                  >
                    {scan.nutritionScore?.value} ({scan.nutritionScore?.grade})
                  </span>
                </motion.span>
              </div>
            )}
            
            <Typography variant="body" className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              <span className="font-medium">Scanned At:</span> {scanTime}
            </Typography>
          </div>
          
          {scan.image && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={!isMobile ? { scale: 1.05 } : {}}
              transition={{ duration: 0.3 }}
              className={`relative ${isMobile ? 'mt-1' : 'mt-2'}`}
            >
              <img
                src={scan.image}
                alt={scan.productName}
                className={`rounded shadow-md ring-2 ring-transparent hover:ring-green-400 ${
                  isMobile ? 'w-20' : 'w-24'
                }`}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded" />
            </motion.div>
          )}
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className={`mt-2 px-3 py-1.5 rounded text-white font-medium relative overflow-hidden
              bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-md transition-all duration-200 ${
                isMobile ? 'text-xs w-full' : ''
              }`}
            style={TYPOGRAPHY_CONFIG.button}
          >
            Delete Scan
          </motion.button>
        </div>
      </GlowingCard>
    </motion.li>
  );
});

ScanItem.displayName = 'ScanItem';

// Memoized ClearAllButton components
const ClearAllButtonDesktop = memo(({ isDeletingAll, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={isDeletingAll}
    className={`px-4 py-2 text-white rounded-full font-medium shadow-lg hover:shadow-xl 
      transition-all duration-300 relative overflow-hidden flex items-center gap-2 ${
        isDeletingAll 
          ? 'bg-gradient-to-r from-gray-500 to-gray-400 cursor-not-allowed' 
          : 'bg-gradient-to-r from-rose-500 to-red-500'
      }`}
    style={TYPOGRAPHY_CONFIG.button}
  >
    {isDeletingAll ? (
      <>
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Deleting...
      </>
    ) : (
      'Clear All'
    )}
  </motion.button>
));

ClearAllButtonDesktop.displayName = 'ClearAllButtonDesktop';

const ClearAllButtonMobile = memo(({ isDeletingAll, onClick, scansLength }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={isDeletingAll}
    className={`w-full py-3 text-white rounded-full font-medium shadow-lg
      transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 ${
        isDeletingAll 
          ? 'bg-gradient-to-r from-gray-500 to-gray-400 cursor-not-allowed' 
          : 'bg-gradient-to-r from-rose-500 to-red-500'
      }`}
    style={TYPOGRAPHY_CONFIG.button}
  >
    {isDeletingAll ? (
      <>
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Deleting All Scans...
      </>
    ) : (
      `Clear All (${scansLength})`
    )}
  </motion.button>
));

ClearAllButtonMobile.displayName = 'ClearAllButtonMobile';

function ScanHistory() {
  const containerRef = useRef(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  
  // Refs for performance optimization
  const ripplesRef = useRef([]);
  ripplesRef.current = ripples;
  const lastInteractionTime = useRef(0);
  const resizeTimeout = useRef(null);

  // Optimized mobile detection with debounce
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const handleResize = () => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(checkMobile, 50);
    };
    
    checkMobile();
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    };
  }, []);

  // Optimized scroll animations
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

  // Optimized particle options with useMemo
  const particleOptions = useMemo(() => ({
    particles: {
      number: { 
        value: isMobile ? 20 : 30, // Reduced for performance
        density: { 
          enable: true, 
          value_area: isMobile ? 300 : 400 
        } 
      },
      color: { value: ["#22c55e", "#10b981", "#34d399", "#a7f3d0"] },
      shape: { type: "circle" },
      opacity: { 
        value: isMobile ? 0.08 : 0.1, 
        random: true, 
        animation: { 
          enable: false, // Disabled for better performance
          speed: 1, 
          minimumValue: 0.05 
        } 
      },
      size: { 
        value: isMobile ? 1.5 : 2, // Reduced for performance
        random: true, 
        animation: { 
          enable: false, // Disabled for better performance
          speed: 2, 
          minimumValue: 1 
        } 
      },
      move: {
        enable: true,
        speed: isMobile ? 0.15 : 0.2, // Reduced for performance
        direction: "none",
        random: true,
        straight: false,
        outMode: "bounce",
        attract: { enable: false } // Disabled for performance
      }
    },
    interactivity: {
      events: {
        onhover: { enable: !isMobile, mode: "repulse" },
        onclick: { enable: false } // Disabled for performance
      }
    },
    detectRetina: true,
    fps_limit: 60, // Limit FPS for performance
    retina_detect: false // Disabled for better performance
  }), [isMobile]);

  // Optimized interaction handler with throttling
  const handleInteraction = useCallback((e) => {
    const now = Date.now();
    if (now - lastInteractionTime.current < 100) return; // Throttle interactions
    lastInteractionTime.current = now;

    if (
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

    const newRipple = {
      id: Date.now(),
      x,
      y,
      color,
      isMobile
    };

    // Limit ripples to 3 for performance
    setRipples(prev => [...prev.slice(-2), newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, isMobile ? 400 : 600);
  }, [isMobile]);

  // Optimized move handler with throttling
  const handleMove = useCallback((e) => {
    requestAnimationFrame(() => {
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
    });
  }, []);

  // Optimized fetch with caching
  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [cosmeticScansSnapshot, foodScansSnapshot] = await Promise.all([
          getDocs(collection(db, "cosmeticScans")),
          getDocs(collection(db, "scanHistory"))
        ]);

        const allScans = [];

        // Process scans
        cosmeticScansSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === user.uid) {
            allScans.push({
              id: doc.id,
              ...data,
              type: "cosmetic",
              productName: data.productName || data.name || "Cosmetic Product",
              image: data.imageUrl || data.image || "",
              nutritionScore: data.safetyScore ? {
                value: data.safetyScore,
                grade: data.safetyLevel || "Unknown"
              } : (data.safety_score ? {
                value: data.safety_score,
                grade: data.safety_level || "Unknown"
              } : null),
              timestamp: data.timestamp || data.scannedAt || { seconds: Date.now() / 1000 }
            });
          }
        });

        foodScansSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.uid === user.uid) {
            allScans.push({
              id: doc.id,
              ...data,
              type: data.type || "food"
            });
          }
        });

        // Sort scans
        allScans.sort((a, b) => {
          const getTime = (scan) => {
            if (scan.timestamp?.seconds) return scan.timestamp.seconds * 1000;
            if (scan.timestamp?.toDate) return scan.timestamp.toDate().getTime();
            if (scan.scannedAt?.seconds) return scan.scannedAt.seconds * 1000;
            return new Date(scan.timestamp || 0).getTime();
          };
          return getTime(b) - getTime(a);
        });
        
        setScans(allScans);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Optimized delete handler
  const handleDelete = useCallback(async (scan) => {
    if (!window.confirm("Are you sure you want to delete this scan?")) return;

    try {
      const collectionName = scan.type === 'cosmetic' ? 'cosmeticScans' : 'scanHistory';
      await deleteDoc(doc(db, collectionName, scan.id));
      setScans((prev) => prev.filter((s) => s.id !== scan.id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete scan. Please try again.");
    }
  }, []);

  // Optimized delete all handler
  const handleDeleteAll = useCallback(async () => {
    if (!scans.length) return;
    
    if (!window.confirm(`Are you sure you want to delete all ${scans.length} scans?`)) return;

    setIsDeletingAll(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const [cosmeticSnapshot, foodSnapshot] = await Promise.all([
        getDocs(collection(db, "cosmeticScans")),
        getDocs(collection(db, "scanHistory"))
      ]);

      const batch = writeBatch(db);
      
      cosmeticSnapshot.forEach((doc) => {
        if (doc.data().userId === user.uid) {
          batch.delete(doc.ref);
        }
      });
      
      foodSnapshot.forEach((doc) => {
        if (doc.data().uid === user.uid) {
          batch.delete(doc.ref);
        }
      });

      await batch.commit();
      setScans([]);
    } catch (err) {
      console.error("Delete all error:", err);
      alert("Failed to delete all scans. Please try again.");
    } finally {
      setIsDeletingAll(false);
    }
  }, [scans.length]);

  // Optimized loading skeleton
  if (loading) {
    return (
      <div 
        ref={containerRef}
        className="relative min-h-screen bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 overflow-hidden"
      >
        <Particles key={isMobile ? 'mobile' : 'desktop'} className="absolute inset-0 -z-10" options={particleOptions} />
        <FloatingIcons isMobile={isMobile} />
        
        <motion.div
          style={{ y: heroYSpring }}
          className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-screen-md mx-auto"
        >
          <div className="relative w-fit mx-auto mb-8">
            <div className="h-8 w-48 bg-gradient-to-r from-green-200 to-emerald-200 rounded animate-pulse mx-auto" />
            <div className="h-1 w-32 bg-green-200 rounded mt-2 mx-auto" />
          </div>

          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="h-5 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                  <div className="h-5 w-16 bg-gradient-to-r from-green-200 to-emerald-200 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                  <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                </div>
                <div className="h-20 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchMove={handleMove}
      className="relative min-h-screen bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 overflow-hidden cursor-default"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-y'
      }}
    >
      {/* Particle Background */}
      <Particles key={isMobile ? 'mobile' : 'desktop'} className="absolute inset-0 -z-10" options={particleOptions} />
      
      {/* Interactive Background */}
      <InteractiveBackground isMobile={isMobile} />
      
      {/* Floating Icons */}
      <FloatingIcons isMobile={isMobile} />

      {/* Ripple Effects - Optimized */}
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
                scale: [0, ripple.isMobile ? 2 : 3],
                opacity: [0.6, 0],
                width: [ripple.isMobile ? 20 : 30, ripple.isMobile ? 80 : 120],
                height: [ripple.isMobile ? 20 : 30, ripple.isMobile ? 80 : 120],
                x: [ripple.x - (ripple.isMobile ? 10 : 15), ripple.x - (ripple.isMobile ? 40 : 60)],
                y: [ripple.y - (ripple.isMobile ? 10 : 15), ripple.y - (ripple.isMobile ? 40 : 60)]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: ripple.isMobile ? 0.5 : 0.7,
                ease: "easeOut"
              }}
              style={{
                filter: `blur(${ripple.isMobile ? 6 : 8}px)`,
                mixBlendMode: "screen"
              }}
            />
          ))}
        </AnimatePresence>

        {/* Touch Trail */}
        <motion.div
          className="absolute pointer-events-none rounded-full"
          animate={{
            x: touchPosition.x - (isMobile ? 4 : 6),
            y: touchPosition.y - (isMobile ? 4 : 6)
          }}
          transition={{
            type: "spring",
            stiffness: isMobile ? 600 : 500,
            damping: isMobile ? 35 : 30
          }}
          style={{
            width: isMobile ? 8 : 12,
            height: isMobile ? 8 : 12,
            background: "radial-gradient(circle, rgba(34,197,94,0.15), rgba(16,185,129,0.05))",
            border: `1px solid rgba(34,197,94,${isMobile ? 0.15 : 0.2})`,
            filter: 'blur(1px)'
          }}
        />
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
        className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-screen-md mx-auto"
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
            style={TYPOGRAPHY_CONFIG.heading}
            style={{
              ...TYPOGRAPHY_CONFIG.heading,
              background: 'linear-gradient(90deg, #059669, #10B981, #34D399, #10B981, #059669)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Scan History
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

        {/* Empty State */}
        {scans.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={!isMobile ? { scale: 1.02 } : {}}
            className={`text-center p-8 rounded-3xl backdrop-blur-sm ${
              isMobile ? 'bg-white/80' : 'bg-white/90'
            }`}
          >
            <div className="relative w-32 h-32 mx-auto mb-4">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 blur-lg"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative text-6xl">📦</div>
            </div>
            <Typography variant="body" className="text-gray-600">
              No scans found. Try scanning a product!
            </Typography>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              <a
                href="/select-scan"
                className={`inline-flex items-center gap-2 text-green-600 font-medium ${
                  isMobile ? 'text-sm' : ''
                }`}
                style={TYPOGRAPHY_CONFIG.accent}
              >
                <span>Start Scanning</span>
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </a>
            </motion.div>
          </motion.div>
        ) : (
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }, // Reduced stagger
            }}
            className="space-y-4"
          >
            {scans.map((scan) => (
              <ScanItem
                key={scan.id}
                scan={scan}
                isMobile={isMobile}
                onDelete={handleDelete}
              />
            ))}
          </motion.ul>
        )}

        {/* Mobile Stats */}
        {scans.length > 0 && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-100/50"
          >
            <div className="text-center space-y-2">
              <Typography variant="accent" className="text-green-700 font-medium">
                {scans.length} scan{scans.length !== 1 ? 's' : ''} total
              </Typography>
              <div className="flex justify-center gap-4 text-xs text-gray-600">
                <Typography variant="body" className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Food: {scans.filter(s => s.type === 'food').length}
                </Typography>
                <Typography variant="body" className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  Cosmetic: {scans.filter(s => s.type === 'cosmetic').length}
                </Typography>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Clear All Buttons */}
      {scans.length > 0 && !isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6 z-20"
        >
          <ClearAllButtonDesktop
            isDeletingAll={isDeletingAll}
            onClick={handleDeleteAll}
          />
        </motion.div>
      )}

      {scans.length > 0 && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="sticky bottom-4 z-20 px-4"
        >
          <ClearAllButtonMobile
            isDeletingAll={isDeletingAll}
            onClick={handleDeleteAll}
            scansLength={scans.length}
          />
        </motion.div>
      )}
    </div>
  );
}

export default memo(ScanHistory);