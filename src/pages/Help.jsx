// Ultra Optimized Help Component with Zero Lag
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useMotionValue, 
  useTransform,
  useSpring 
} from "framer-motion";

// Typing Animation Component
const TypingAnimation = React.memo(({ text, speed = 50, className = "", delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    if (isComplete) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isComplete]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{displayedText}</span>
      {!isComplete && (
        <motion.div
          animate={{ 
            opacity: [1, 0, 1],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block w-[2px] h-6 ml-1 bg-gradient-to-b from-green-400 to-emerald-600"
        />
      )}
      {isComplete && (
        <motion.span
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block w-[2px] h-6 ml-1 bg-gradient-to-b from-green-400 to-emerald-600"
        />
      )}
    </span>
  );
});

// Device Detection Hook
const usePremiumDeviceDetection = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    touchCapable: false,
    reducedMotion: false,
    highRefreshRate: false,
    canHover: true
  });
  
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highRefreshRate = window.matchMedia('(min-resolution: 192dpi)').matches;
      const canHover = window.matchMedia('(hover: hover)').matches;
      
      setDevice({
        isMobile,
        isTablet,
        isDesktop,
        touchCapable,
        reducedMotion,
        highRefreshRate,
        canHover
      });
    };
    
    checkDevice();
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkDevice, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverQuery = window.matchMedia('(hover: hover)');
    
    const handleMotionChange = () => checkDevice();
    
    motionQuery.addEventListener('change', handleMotionChange);
    hoverQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
      hoverQuery.removeEventListener('change', handleMotionChange);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  return device;
};

// Premium Spring Configurations
const PREMIUM_SPRINGS = {
  ultraSmooth: { stiffness: 200, damping: 35, mass: 0.5, restDelta: 0.0001, restSpeed: 0.0001 },
  smooth: { stiffness: 180, damping: 30, mass: 0.6, restDelta: 0.0001, restSpeed: 0.0001 },
  responsive: { stiffness: 160, damping: 28, mass: 0.7, restDelta: 0.001, restSpeed: 0.001 },
  bouncy: { stiffness: 220, damping: 25, mass: 0.5, restDelta: 0.001, restSpeed: 0.001 },
  mobile: { stiffness: 150, damping: 30, mass: 0.7, restDelta: 0.005, restSpeed: 0.005 },
  hover: { stiffness: 400, damping: 25, mass: 0.3, restDelta: 0.0001, restSpeed: 0.0001 }
};

// Premium Easing Curves
const PREMIUM_EASING = {
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeOutCirc: [0, 0.55, 0.45, 1],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeOutQuint: [0.22, 1, 0.36, 1],
  premiumEnter: [0.32, 0.94, 0.6, 1],
  premiumExit: [0.76, 0, 0.24, 1],
  mobileEase: [0.25, 0.46, 0.45, 0.94],
  hoverEase: [0.4, 0, 0.2, 1],
  smoothBounce: [0.68, -0.55, 0.265, 1.55]
};

// Throttle Utility Function
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Optimized Section Component
const HelpSection = React.memo(({ section, idx, isMobile, reducedMotion, canHover }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        delay: idx * 0.1, 
        type: "spring", 
        stiffness: 100, 
        damping: 20, 
        mass: 0.5 
      }}
      whileHover={(!reducedMotion && canHover) ? {
        y: -8,
        boxShadow: "0px 20px 60px rgba(16,185,129,0.12)",
        transition: PREMIUM_SPRINGS.hover
      } : undefined}
      whileTap={isMobile ? { scale: 0.98 } : undefined}
      onHoverStart={() => !reducedMotion && canHover && setIsHovered(true)}
      onHoverEnd={() => !reducedMotion && canHover && setIsHovered(false)}
      className="group relative cursor-pointer will-change-transform"
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-green-50/30 rounded-2xl sm:rounded-3xl shadow-lg backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-300 gpu-accelerated" />
      
      {/* Content */}
      <div className="relative p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Icon */}
          <motion.div
            whileHover={(!reducedMotion && canHover) ? { 
              scale: 1.1,
              rotate: [0, -5, 5, 0]
            } : undefined}
            transition={{ duration: 0.5 }}
            className={`mx-auto sm:mx-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-green-100 flex items-center justify-center shadow-lg group-hover:shadow-xl gpu-accelerated ${
              isMobile ? 'w-14 h-14 mb-4' : 'w-20 h-20'
            }`}
            style={{ 
              background: `linear-gradient(135deg, white, ${section.color}15)`,
              transform: 'translateZ(0)'
            }}
          >
            <motion.span
              animate={(isHovered && !reducedMotion) ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 0.5 }}
              className={isMobile ? 'text-2xl' : 'text-3xl'}
              style={{ transform: 'translateZ(0)' }}
            >
              {section.icon}
            </motion.span>
          </motion.div>
          
          {/* Text Content */}
          <div className="flex-1">
            <motion.h2 
              whileHover={(!reducedMotion && canHover) ? { 
                scale: 1.02, 
                x: 3 
              } : undefined} 
              className={`font-bold text-green-800 mb-3 sm:mb-4 ${
                isMobile ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
              }`}
              style={{ transform: 'translateZ(0)' }}
            >
              {section.title}
            </motion.h2>
            
            {section.points && (
              <motion.ul 
                className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {section.points.map((point, pointIdx) => (
                  <motion.li 
                    key={pointIdx}
                    className="flex items-start gap-2 text-gray-600 text-sm sm:text-base"
                    whileHover={(!reducedMotion && canHover) ? { 
                      x: 3, 
                      color: "#065f46" 
                    } : undefined}
                    style={{ transform: 'translateZ(0)' }}
                  >
                    <span className="text-green-500 mt-1 flex-shrink-0">•</span>
                    <span>{point}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
            
            {section.subsections && section.subsections.map((sub, subIdx) => (
              <motion.div 
                key={subIdx}
                className="mb-4 sm:mb-5 last:mb-0"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + subIdx * 0.05 }}
                style={{ transform: 'translateZ(0)' }}
              >
                <h3 className="font-semibold text-green-700 mb-1.5 sm:mb-2 text-base sm:text-lg">
                  <TypingAnimation 
                    text={`${subIdx + 1}. ${sub.title}`} 
                    speed={40} 
                    delay={subIdx * 100} 
                  />
                </h3>
                {sub.description && (
                  <p className="text-gray-600 mb-2 text-sm sm:text-base">
                    <TypingAnimation text={sub.description} speed={30} delay={subIdx * 150} />
                  </p>
                )}
                {sub.points && (
                  <ul className="space-y-1 ml-3 sm:ml-4">
                    {sub.points.map((point, pointIdx) => (
                      <li key={pointIdx} className="text-gray-600 flex items-start gap-2 text-sm sm:text-base">
                        <span className="text-green-400 mt-1 flex-shrink-0">◦</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
            
            {section.description && (
              <motion.p 
                className="text-gray-600 leading-relaxed text-sm sm:text-base"
                whileHover={(!reducedMotion && canHover) ? { x: 3 } : undefined}
                style={{ transform: 'translateZ(0)' }}
              >
                <TypingAnimation text={section.description} speed={30} delay={200} />
              </motion.p>
            )}
            
            {section.note && (
              <motion.div
                className="mt-3 sm:mt-4 p-3 bg-green-50/50 rounded-lg border border-green-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{ transform: 'translateZ(0)' }}
              >
                <p className="text-green-700 font-medium text-sm sm:text-base">
                  <span className="mr-2">✅</span>
                  <TypingAnimation text={section.note} speed={40} delay={300} />
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

HelpSection.displayName = 'HelpSection';

// Premium Scroll Progress Component
const PremiumScrollProgress = React.memo(({ scrollYProgress }) => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left will-change-transform bg-green-500/20"
      style={{ 
        scaleX: scrollYProgress,
        transform: 'translate3d(0,0,0)'
      }}
    >
      <motion.div
        className="h-full w-full"
        animate={{
          backgroundPosition: ['0% 0%', '100% 0%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
          backgroundSize: '400% 100%',
          willChange: 'background-position'
        }}
      />
    </motion.div>
  );
});

// Optimized Contact Card Component
const ContactCard = React.memo(({ icon, title, children, isMobile, reducedMotion, canHover, href, to, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const content = (
    <motion.div
      whileHover={(!reducedMotion && canHover) ? { scale: 1.03 } : undefined}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => !reducedMotion && canHover && setIsHovered(true)}
      onHoverEnd={() => !reducedMotion && canHover && setIsHovered(false)}
      className="bg-white rounded-xl p-5 sm:p-6 border border-green-200 hover:border-green-400 transition-all duration-300 gpu-accelerated"
      style={{ transform: 'translateZ(0)' }}
    >
      <motion.div
        animate={(isHovered && !reducedMotion) ? {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl mb-3 sm:mb-4"
      >
        {icon}
      </motion.div>
      
      <h3 className="font-semibold text-green-800 mb-2 text-lg sm:text-xl">
        {title}
      </h3>
      
      <div className="text-gray-600 text-sm sm:text-base">
        {children}
      </div>
    </motion.div>
  );
  
  if (href) {
    return (
      <a 
        href={href} 
        className="block no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }
  
  if (to) {
    return (
      <Link to={to} className="block no-underline">
        {content}
      </Link>
    );
  }
  
  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {content}
      </div>
    );
  }
  
  return content;
});

ContactCard.displayName = 'ContactCard';

// Main Help Component
const Help = () => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  
  const device = usePremiumDeviceDetection();
  const { isMobile, isTablet, reducedMotion, canHover, touchCapable } = device;
  
  // Fixed: useScroll without target parameter
  const { scrollYProgress } = useScroll();
  
  const scrollY = useMotionValue(0);
  
  // Scroll-based animations
  const heroY = useTransform(
    scrollY,
    [0, 500],
    [0, isMobile ? -15 : -30]
  );
  
  const heroOpacity = useTransform(
    scrollY,
    [0, 300],
    [1, isMobile ? 0.97 : 0.95]
  );
  
  const heroScale = useTransform(
    scrollY,
    [0, 500],
    [1, isMobile ? 0.995 : 0.99]
  );
  
  const currentSpring = isMobile ? PREMIUM_SPRINGS.mobile : 
                       isTablet ? PREMIUM_SPRINGS.responsive : 
                       PREMIUM_SPRINGS.ultraSmooth;
  
  const heroYSpring = useSpring(heroY, currentSpring);
  const heroScaleSpring = useSpring(heroScale, currentSpring);
  
  // Memoized sections data
  const sections = useMemo(() => [
    {
      icon: "📸",
      title: "How to Scan a Product",
      color: "#10B981",
      points: [
        "Open the PureScan app.",
        "Tap Scan Product button.",
        "Point your camera at the barcode.",
        "Hold steady until detection.",
        "Wait for product details to load."
      ],
      note: "Supports EAN, UPC, and QR-based product codes."
    },
    {
      icon: "🥗",
      title: "Understanding Your Scan Results",
      color: "#059669",
      subsections: [
        {
          title: "Product Image",
          description: "If available, PureScan automatically fetches the product image."
        },
        {
          title: "Product Name & Brand",
          description: "Extracted from verified product databases."
        },
        {
          title: "Ingredients Breakdown",
          description: "PureScan analyzes additives, preservatives, allergens, and nutritional red flags."
        },
        {
          title: "Health Score",
          description: "A transparent score based on ingredient safety, additive levels, sugar, salt, fat content, and processing level."
        }
      ]
    },
    {
      icon: "🔍",
      title: "If a Product Doesn't Scan",
      color: "#047857",
      points: [
        "Ensure the barcode is not damaged.",
        "Clean your camera lens.",
        "Increase lighting conditions.",
        "Hold camera 10–15 cm away.",
        "Try scanning from different angles."
      ],
      note: "If still not detected, you can manually enter the barcode."
    },
    {
      icon: "🖼️",
      title: "Product Image Not Showing?",
      color: "#7C3AED",
      points: [
        "The product is new in the market.",
        "Database doesn't have an image yet.",
        "Barcode linked to multiple variants."
      ],
      note: "PureScan will still show all available product details."
    },
    {
      icon: "⚠️",
      title: "Common Issues & Fixes",
      color: "#DC2626",
      subsections: [
        {
          title: "No Internet Connection",
          points: ["Check WiFi or mobile data", "Disable airplane mode", "Disable VPN if blocking requests"]
        },
        {
          title: "Product Not Found",
          description: "This means the product is not in the database yet. You can submit it manually using the Contact Us form."
        },
        {
          title: "App Feels Slow",
          points: ["Close background apps", "Clear browser cache", "Refresh the page"]
        }
      ]
    },
    {
      icon: "✅",
      title: "About PureScan",
      color: "#0EA5E9",
      description: "PureScan is a scanner-grade product analysis tool designed to give users accurate product data, honest ingredient breakdown, transparent health scoring, and fast scanning. We believe in truth, loyalty, and user empowerment."
    }
  ], []);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full flex flex-col bg-gradient-to-b from-white via-green-50/90 to-emerald-50/70 font-sans cursor-default"
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        transform: 'translate3d(0,0,0)',
        position: 'relative',
        minHeight: '100vh'
      }}
      data-performance-optimized="true"
      data-reduced-motion={reducedMotion}
      data-device-type={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}
    >
      {/* Premium Scroll Progress */}
      <PremiumScrollProgress scrollYProgress={scrollYProgress} />
      
      {/* Background Orbs - Optimized */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className={`absolute ${isMobile ? '-top-20 -left-20' : '-top-40 -left-40'} ${
            isMobile ? 'w-[25rem] h-[25rem]' : 'w-[35rem] h-[35rem]'
          } rounded-full pointer-events-none gpu-accelerated`}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isMobile ? 0.08 : 0.12,
            scale: [1, isMobile ? 1.03 : 1.05, 1],
          }}
          transition={{ 
            duration: reducedMotion ? 0 : 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ transform: 'translateZ(0)' }}
        >
          <div className={`w-full h-full rounded-full ${
            isMobile 
              ? 'bg-gradient-to-br from-green-300/20 via-emerald-300/15 to-teal-200/10 blur-[60px]'
              : 'bg-gradient-to-br from-green-300/40 via-emerald-300/30 to-teal-200/30 blur-[80px]'
          }`} />
        </motion.div>

        <motion.div
          className={`absolute ${isMobile ? '-right-10 -bottom-10' : '-right-20 -bottom-20'} ${
            isMobile ? 'w-[20rem] h-[20rem]' : 'w-[25rem] h-[25rem]'
          } rounded-full pointer-events-none gpu-accelerated`}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isMobile ? 0.06 : 0.1,
            scale: [1, isMobile ? 1.02 : 1.03, 1],
          }}
          transition={{ 
            duration: reducedMotion ? 0 : 7, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.5
          }}
          style={{ transform: 'translateZ(0)' }}
        >
          <div className={`w-full h-full rounded-full ${
            isMobile
              ? 'bg-gradient-to-br from-yellow-200/15 via-emerald-200/10 to-green-300/10 blur-[40px]'
              : 'bg-gradient-to-br from-yellow-200/30 via-emerald-200/20 to-green-300/20 blur-[60px]'
          }`} />
        </motion.div>
      </div>

      {/* Main Content */}
      <div 
        ref={contentRef}
        className="relative z-10 flex-grow w-full"
      >
        <motion.div
          style={{ 
            scale: heroScaleSpring,
            opacity: heroOpacity
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: reducedMotion ? 0 : 0.8,
            ease: PREMIUM_EASING.premiumEnter
          }}
          className="text-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans"
        >
          {/* Hero Section */}
          <motion.section
            style={{ y: heroYSpring }}
            className="max-w-6xl mx-auto mb-8 sm:mb-12 text-center"
          >
            <motion.h1
              className={`font-bold tracking-tight ${isMobile ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'} mb-3 sm:mb-4 will-change-transform`}
              animate={reducedMotion ? {} : {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={reducedMotion ? {} : {
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transform: 'translateZ(0)'
              }}
              whileHover={(!reducedMotion && canHover) ? {
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeInOut" }
              } : {}}
            >
              <TypingAnimation text="Help & Support" speed={70} className="block" />
              <br />
              <span className={isMobile ? 'text-lg sm:text-2xl' : 'text-2xl sm:text-3xl'}>
                <TypingAnimation text="PureScan" speed={50} delay={800} />
              </span>
            </motion.h1>
            
            <motion.p
              className={`text-gray-700 max-w-2xl mx-auto leading-relaxed ${
                isMobile ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <TypingAnimation 
                text="Welcome to the PureScan Help Center! This page will guide you through scanning products, understanding results, fixing common issues, and contacting support." 
                speed={30} 
                delay={1200}
              />
            </motion.p>

            {/* Animated Underline */}
            <motion.div
              className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-4 sm:mt-6 mx-auto"
              initial={{ width: 0 }}
              animate={{ width: isMobile ? "40%" : "30%" }}
              transition={{ 
                duration: reducedMotion ? 0 : 1.2, 
                delay: 0.5 
              }}
              style={{ 
                height: isMobile ? '2px' : '3px',
                transform: 'translateZ(0)'
              }}
              whileHover={(!reducedMotion && canHover) ? {
                scaleX: 1.2,
                transition: { duration: 0.3 }
              } : {}}
            />
          </motion.section>

          {/* Help Sections */}
          <div className="max-w-6xl mx-auto space-y-5 sm:space-y-8">
            <AnimatePresence mode="wait">
              {sections.map((section, idx) => (
                <HelpSection
                  key={idx}
                  section={section}
                  idx={idx}
                  isMobile={isMobile}
                  reducedMotion={reducedMotion}
                  canHover={canHover}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
              duration: reducedMotion ? 0 : 0.6,
              ease: PREMIUM_EASING.premiumEnter
            }}
            className="max-w-4xl mx-auto mt-8 sm:mt-12"
          >
            <motion.div
              className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-green-200/50 relative overflow-hidden gpu-accelerated"
              whileHover={(!reducedMotion && canHover) ? {
                y: -8,
                scale: 1.02,
                boxShadow: "0 25px 60px rgba(16,185,129,0.2)",
                transition: PREMIUM_SPRINGS.hover
              } : undefined}
            >
              {/* Background Elements */}
              <div className="absolute -top-10 -right-10 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-400/10 to-emerald-400/5 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-teal-400/10 to-green-400/5 blur-2xl" />
              
              <div className="relative z-10 text-center">
                <motion.div
                  animate={reducedMotion ? {} : { scale: [1, 1.05, 1] }}
                  transition={reducedMotion ? {} : { duration: 3, repeat: Infinity }}
                  className="text-5xl sm:text-6xl mb-4 sm:mb-6"
                  style={{ transform: 'translateZ(0)' }}
                >
                  📬
                </motion.div>
                
                <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'} text-green-800 mb-3 sm:mb-4`}>
                  <TypingAnimation text="Need Help? Contact Us" speed={40} />
                </h2>
                
                <p className="text-gray-600 max-w-xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
                  <TypingAnimation 
                    text="If you face any issue, feel free to reach out. Our support team is ready to assist you." 
                    speed={30} 
                    delay={500}
                  />
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <ContactCard
                    icon="📧"
                    title="Email Support"
                    isMobile={isMobile}
                    reducedMotion={reducedMotion}
                    canHover={canHover}
                    href="mailto:purescan.helpdesk@gmail.com"
                  >
                    <a 
                      href="mailto:purescan.helpdesk@gmail.com"
                      className="text-green-600 hover:text-green-700 font-medium block mt-2"
                    >
                      <TypingAnimation 
                        text="purescan.helpdesk@gmail.com" 
                        speed={20} 
                        delay={200}
                      />
                    </a>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Response within 24 hours
                    </p>
                  </ContactCard>
                  
                  <ContactCard
                    icon="📋"
                    title="Support Form"
                    isMobile={isMobile}
                    reducedMotion={reducedMotion}
                    canHover={canHover}
                    to="/contactUs"
                  >
                    <p className="text-gray-600 mb-3 text-sm sm:text-base">
                      Available on the Contact Us page
                    </p>
                    <Link 
                      to="/contactUs"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
                    >
                      <TypingAnimation text="Go to Contact Form" speed={30} />
                    </Link>
                  </ContactCard>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <Link 
                    to="/"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm sm:text-base group"
                  >
                    <motion.span
                      animate={reducedMotion ? {} : { x: [-2, 0, -2] }}
                      transition={reducedMotion ? {} : { duration: 1.5, repeat: Infinity }}
                      className="text-lg"
                    >
                      ←
                    </motion.span>
                    <span>
                      <TypingAnimation text="Back to Home" speed={30} />
                    </span>
                  </Link>
                  
                  <span className="hidden sm:inline text-gray-300">•</span>
                  
                  <Link 
                    to="/privacy"
                    className="text-gray-500 hover:text-gray-700 text-sm sm:text-base"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-green-200 text-center"
          >
            <motion.div
              animate={reducedMotion ? {} : { y: [0, -3, 0] }}
              transition={reducedMotion ? {} : { duration: 4, repeat: Infinity }}
              className="text-3xl sm:text-4xl mb-3 sm:mb-4"
              style={{ transform: 'translateZ(0)' }}
            >
              🙏
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-1.5 sm:mb-2">
              <TypingAnimation text="Thank you for using PureScan" speed={40} />
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              <TypingAnimation text="Your trust motivates us to keep improving." speed={30} />
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
              PureScan Support Center • Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </motion.footer>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;