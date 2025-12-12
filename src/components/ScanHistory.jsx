import { useEffect, useState, useRef, useCallback } from "react";
import { auth, db } from "./FireBase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
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

// 🔥 Home.jsx style glowing card
const GlowingCard = ({ children, glowColor = "#22c55e", className = "", isMobile }) => (
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

function ScanHistory() {
  const containerRef = useRef(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isDeletingAll, setIsDeletingAll] = useState(false);

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

  // Touch move handler
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
  }, []);

  // Mobile-optimized Particle Background
  const particleOptions = {
    particles: {
      number: { 
        value: isMobile ? 30 : 40, 
        density: { 
          enable: true, 
          value_area: isMobile ? 400 : 500 
        } 
      },
      color: { value: ["#22c55e", "#10b981", "#34d399", "#a7f3d0"] },
      shape: { type: "circle" },
      opacity: { 
        value: isMobile ? 0.1 : 0.12, 
        random: true, 
        animation: { 
          enable: true, 
          speed: 1, 
          minimumValue: 0.05 
        } 
      },
      size: { 
        value: isMobile ? 2 : 2.5, 
        random: true, 
        animation: { 
          enable: true, 
          speed: 2, 
          minimumValue: 1 
        } 
      },
      move: {
        enable: true,
        speed: isMobile ? 0.2 : 0.25,
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

  // Fetch scan history
  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "scanHistory"),
          where("uid", "==", user.uid),
          orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => {
          const scan = { id: doc.id, ...doc.data() };

          // Auto-detect type if not set
          if (!scan.type) {
            const name = (scan.productName || "").toLowerCase();
            if (
              name.includes("cream") ||
              name.includes("lotion") ||
              name.includes("shampoo") ||
              name.includes("face") ||
              name.includes("nivea") ||
              name.includes("moisturizer") ||
              name.includes("serum") ||
              name.includes("cleanser") ||
              name.includes("toner")
            ) {
              scan.type = "cosmetic";
            } else {
              scan.type = "food";
            }
          }

          return scan;
        });

        setScans(data);
      } catch (error) {
        console.error("Error fetching scan history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Handle single scan deletion
  const handleDelete = async (scanId) => {
    const confirm = window.confirm("Are you sure you want to delete this scan?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "scanHistory", scanId));
      setScans((prev) => prev.filter((scan) => scan.id !== scanId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // FIXED: Handle delete all scans
  const handleDeleteAll = async () => {
    if (!scans.length) return;
    
    const confirm = window.confirm(`Are you sure you want to delete all ${scans.length} scans? This action cannot be undone.`);
    if (!confirm) return;

    setIsDeletingAll(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get all scan documents for the current user
      const q = query(
        collection(db, "scanHistory"),
        where("uid", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      
      // Use batch delete for better performance
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      // Clear local state
      setScans([]);
      
      // Show success message
      alert(`Successfully deleted ${snapshot.size} scans!`);
      
    } catch (err) {
      console.error("Delete all failed:", err);
      alert("Failed to delete all scans. Please try again.");
    } finally {
      setIsDeletingAll(false);
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
          className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-screen-md mx-auto"
        >
          <div className="relative w-fit mx-auto mb-8">
            <div className="h-8 w-48 bg-gradient-to-r from-green-200 to-emerald-200 rounded animate-pulse mx-auto" />
            <div className="h-1 w-32 bg-green-200 rounded mt-2 mx-auto" />
          </div>

          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`
                bg-white/70 backdrop-blur-sm rounded-2xl p-4 animate-pulse
                ${isMobile ? 'space-y-3' : 'space-y-4'}
              `}>
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
        {/* TITLE - FIXED TEXT VISIBILITY */}
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
            Scan History
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

        {/* EMPTY STATE */}
        {scans.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={!isMobile ? { scale: 1.02 } : {}}
            className={`
              text-center p-8 rounded-3xl backdrop-blur-sm
              ${isMobile ? 'bg-white/80' : 'bg-white/90'}
            `}
          >
            <div className="relative w-32 h-32 mx-auto mb-4">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 blur-lg"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative text-6xl">📦</div>
            </div>
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
              className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}
            >
              No scans found. Try scanning a product!
            </motion.p>
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
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className={`space-y-${isMobile ? '4' : '6'}`}
          >
            {scans.map((scan, index) => (
              <motion.li
                key={scan.id}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <GlowingCard
                  glowColor={
                    scan.type === "cosmetic"
                      ? "#ec4899"
                      : scan.type === "food"
                      ? "#22c55e"
                      : "#9ca3af"
                  }
                  isMobile={isMobile}
                >
                  <div className={`space-y-${isMobile ? '2' : '3'}`}>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`
                        font-bold text-gray-800 truncate
                        ${isMobile ? 'text-base' : 'text-lg'}
                      `}>
                        {scan.productName || "Unknown Product"}
                      </h3>

                      <motion.span
                        whileHover={!isMobile ? { scale: 1.1 } : {}}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          relative px-2 py-1 rounded text-white text-xs font-semibold z-10
                          flex-shrink-0
                          ${isMobile ? 'text-[10px]' : ''}
                          ${scan.type === "cosmetic"
                            ? "bg-gradient-to-r from-pink-500 to-rose-500"
                            : scan.type === "food"
                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                            : "bg-gradient-to-r from-gray-500 to-gray-400"}
                        `}
                      >
                        {scan.type || "unknown"}
                        <span className="absolute inset-0 rounded border border-white/30 animate-ping opacity-60" />
                      </motion.span>
                    </div>

                    {/* Details */}
                    <div className={`text-gray-600 space-y-${isMobile ? '1' : '2'}`}>
                      <p className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <span className="font-medium">Barcode:</span>
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {scan.barcode || "N/A"}
                        </span>
                      </p>

                      {scan.nutritionScore && (
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            Nutrition Score:
                          </span>
                          <motion.span
                            whileHover={!isMobile ? { scale: 1.05 } : {}}
                            className="relative inline-block"
                          >
                            <span
                              className={`
                                px-2 py-1 rounded text-white font-bold z-10 relative
                                ${isMobile ? 'text-xs' : 'text-sm'}
                                ${scan.nutritionScore?.value >= 80
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                  : scan.nutritionScore?.value >= 50
                                  ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                                  : "bg-gradient-to-r from-red-500 to-rose-500"}
                              `}
                            >
                              {scan.nutritionScore?.value} ({scan.nutritionScore?.grade})
                            </span>
                            <span
                              className="absolute inset-0 rounded border-2 border-white/30 animate-ping"
                              style={{ animationDuration: "2s" }}
                            />
                          </motion.span>
                        </div>
                      )}

                      <p className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                        <span className="font-medium">Scanned At:</span>{" "}
                        {scan.timestamp?.seconds
                          ? new Date(scan.timestamp.seconds * 1000).toLocaleString()
                          : "Unknown"}
                      </p>
                    </div>

                    {/* Image */}
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
                          className={`
                            rounded shadow-md ring-2 ring-transparent hover:ring-green-400
                            ${isMobile ? 'w-20' : 'w-24'}
                          `}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded" />
                      </motion.div>
                    )}

                    {/* Delete Button */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(scan.id)}
                      className={`
                        mt-2 px-3 py-1.5 rounded text-white font-medium relative overflow-hidden
                        bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-md
                        transition-all duration-200
                        ${isMobile ? 'text-xs w-full' : ''}
                      `}
                    >
                      Delete Scan
                      <span className="absolute inset-0 bg-white/10 animate-ping rounded pointer-events-none opacity-30" />
                    </motion.button>
                  </div>
                </GlowingCard>
              </motion.li>
            ))}
          </motion.ul>
        )}

        {/* Stats for Mobile */}
        {scans.length > 0 && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-100/50"
          >
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-green-700">
                {scans.length} scan{scans.length !== 1 ? 's' : ''} total
              </p>
              <div className="flex justify-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Food: {scans.filter(s => s.type === 'food').length}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  Cosmetic: {scans.filter(s => s.type === 'cosmetic').length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Clear All Button for Desktop */}
      {scans.length > 0 && !isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6 z-20"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteAll}
            disabled={isDeletingAll}
            className={`
              px-4 py-2 text-white rounded-full font-medium shadow-lg hover:shadow-xl 
              transition-all duration-300 relative overflow-hidden flex items-center gap-2
              ${isDeletingAll 
                ? 'bg-gradient-to-r from-gray-500 to-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-rose-500 to-red-500'
              }
            `}
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
            {!isDeletingAll && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)",
                  filter: "blur(8px)"
                }}
              />
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Clear All Button for Mobile */}
      {scans.length > 0 && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="sticky bottom-4 z-20 px-4"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteAll}
            disabled={isDeletingAll}
            className={`
              w-full py-3 text-white rounded-full font-medium shadow-lg
              transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2
              ${isDeletingAll 
                ? 'bg-gradient-to-r from-gray-500 to-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-rose-500 to-red-500'
              }
            `}
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
              `Clear All (${scans.length})`
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

export default ScanHistory;
