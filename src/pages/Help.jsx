// Ultra Optimized Help Component with Zero Lag
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loadSlim } from 'tsparticles-slim';

// Performance Monitoring Hook (Dev only)
const usePerformanceMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      let frameCount = 0;
      let lastTime = performance.now();
      
      const checkFPS = () => {
        frameCount++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          if (fps < 50) {
            console.warn(`Performance Warning: FPS dropped to ${fps}`);
          }
          frameCount = 0;
          lastTime = currentTime;
        }
        requestAnimationFrame(checkFPS);
      };
      
      requestAnimationFrame(checkFPS);
    }
  }, []);
};

// Optimized Section Component
const HelpSection = React.memo(({ section, idx, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const animationFrameRef = useRef(null);
  
  const handleMouseEnter = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (!isMobile) {
      animationFrameRef.current = requestAnimationFrame(() => {
        setIsHovered(true);
      });
    }
  }, [isMobile]);
  
  const handleMouseLeave = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (!isMobile) {
      animationFrameRef.current = requestAnimationFrame(() => {
        setIsHovered(false);
      });
    }
  }, [isMobile]);
  
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: idx * 0.1, type: "spring", stiffness: 100, damping: 20, mass: 0.5 }}
      whileHover={!isMobile ? {
        y: -8,
        boxShadow: "0px 20px 60px rgba(16,185,129,0.12)",
        transition: { type: "spring", stiffness: 200, damping: 15, mass: 0.3 }
      } : undefined}
      whileTap={isMobile ? { scale: 0.98 } : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
            whileHover={!isMobile ? { 
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
              animate={isHovered && !isMobile ? { 
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
              whileHover={!isMobile ? { 
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
                    whileHover={!isMobile ? { 
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
                  {subIdx + 1}. {sub.title}
                </h3>
                {sub.description && (
                  <p className="text-gray-600 mb-2 text-sm sm:text-base">{sub.description}</p>
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
                whileHover={!isMobile ? { x: 3 } : undefined}
                style={{ transform: 'translateZ(0)' }}
              >
                {section.description}
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
                  {section.note}
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

// Optimized Contact Card Component
const ContactCard = React.memo(({ icon, title, children, isMobile, href, to, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const content = (
    <motion.div
      whileHover={!isMobile ? { scale: 1.03 } : undefined}
      whileTap={{ scale: 0.97 }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className="bg-white rounded-xl p-5 sm:p-6 border border-green-200 hover:border-green-400 transition-all duration-300 gpu-accelerated"
      style={{ transform: 'translateZ(0)' }}
    >
      <motion.div
        animate={isHovered && !isMobile ? {
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const Help = () => {
  usePerformanceMonitor();
  
  const [isMobile, setIsMobile] = useState(false);
  const lastResizeTime = useRef(0);
  const resizeTimeoutRef = useRef(null);
  
  // Optimized mobile detection with throttling
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      }
    };
    
    checkMobile();
    
    const handleResize = () => {
      const now = Date.now();
      if (now - lastResizeTime.current > 200) {
        lastResizeTime.current = now;
        checkMobile();
      }
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [isMobile]);
  
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
      className="relative min-h-screen flex flex-col bg-gradient-to-b from-white via-green-50/80 to-emerald-50/60 overflow-hidden font-sans performance-optimized"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-y',
        overscrollBehavior: 'none'
      }}
    >
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
            duration: 8, 
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
            duration: 7, 
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
      <div className="relative z-10 flex-grow">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans"
        >
          {/* Hero Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto mb-8 sm:mb-12 text-center"
          >
            <motion.h1
              className={`font-bold tracking-tight ${isMobile ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'} mb-3 sm:mb-4 will-change-transform`}
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
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transform: 'translateZ(0)'
              }}
            >
              Help & Support
              <br />
              <span className={isMobile ? 'text-lg sm:text-2xl' : 'text-2xl sm:text-3xl'}>
                PureScan
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
              Welcome to the PureScan Help Center! This page will guide you through scanning products, understanding results, fixing common issues, and contacting support.
            </motion.p>

            {/* Animated Underline */}
            <motion.div
              className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-4 sm:mt-6 mx-auto"
              initial={{ width: 0 }}
              animate={{ width: isMobile ? "40%" : "30%" }}
              transition={{ duration: 1.2, delay: 0.5 }}
              style={{ 
                height: isMobile ? '2px' : '3px',
                transform: 'translateZ(0)'
              }}
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
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mt-8 sm:mt-12"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-green-200/50 relative overflow-hidden gpu-accelerated">
              {/* Background Elements */}
              <div className="absolute -top-10 -right-10 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-400/10 to-emerald-400/5 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-teal-400/10 to-green-400/5 blur-2xl" />
              
              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-5xl sm:text-6xl mb-4 sm:mb-6"
                  style={{ transform: 'translateZ(0)' }}
                >
                  📬
                </motion.div>
                
                <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'} text-green-800 mb-3 sm:mb-4`}>
                  Need Help? Contact Us
                </h2>
                
                <p className="text-gray-600 max-w-xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
                  If you face any issue, feel free to reach out. Our support team is ready to assist you.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <ContactCard
                    icon="📧"
                    title="Email Support"
                    isMobile={isMobile}
                    href="mailto:purescan.helpdesk@gmail.com"
                  >
                    <a 
                      href="mailto:purescan.helpdesk@gmail.com"
                      className="text-green-600 hover:text-green-700 font-medium block mt-2"
                    >
                      purescan.helpdesk@gmail.com
                    </a>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Response within 24 hours
                    </p>
                  </ContactCard>
                  
                  <ContactCard
                    icon="📋"
                    title="Support Form"
                    isMobile={isMobile}
                    to="/contactUs"
                  >
                    <p className="text-gray-600 mb-3 text-sm sm:text-base">
                      Available on the Contact Us page
                    </p>
                    <Link 
                      to="/contactUs"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
                    >
                      Go to Contact Form
                    </Link>
                  </ContactCard>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <Link 
                    to="/"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm sm:text-base group"
                  >
                    <motion.span
                      animate={{ x: [-2, 0, -2] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-lg"
                    >
                      ←
                    </motion.span>
                    <span>Back to Home</span>
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
            </div>
          </motion.section>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-green-200 text-center"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-3xl sm:text-4xl mb-3 sm:mb-4"
              style={{ transform: 'translateZ(0)' }}
            >
              🙏
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-1.5 sm:mb-2">
              Thank you for using PureScan
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Your trust motivates us to keep improving.
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