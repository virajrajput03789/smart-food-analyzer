import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

// Scanner Card Component (EXACTLY LIKE YOUR CARD)
const ScannerCard = memo(({ 
  type, 
  config, 
  isMobile, 
  isHovered, 
  onClick, 
  onHoverStart, 
  onHoverEnd,
  cardVariants // Pass cardVariants as prop
}) => {
  const [isTapped, setIsTapped] = useState(false);
  
  const cardBorderColor = type === 'food' ? 'border-green-100/50' : 'border-pink-100/50';
  const iconBgFrom = type === 'food' ? 'from-green-100' : 'from-pink-100';
  const iconBgTo = type === 'food' ? 'to-emerald-100' : 'to-rose-100';
  const featureIconBg = type === 'food' ? 'bg-green-100' : 'bg-pink-100';
  const featureIconColor = type === 'food' ? 'text-green-600' : 'text-pink-600';
  const titleColor = type === 'food' ? 'text-green-800' : 'text-pink-800';
  
  return (
    <motion.div
      variants={cardVariants}
      custom={type === 'food' ? 0 : 1}
      className="w-full max-w-md lg:max-w-lg"
      whileHover={!isMobile ? {
        y: -15,
        transition: { 
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      } : {}}
    >
      <motion.div
        className={`relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full h-full ${cardBorderColor}`}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onClick={onClick}
        onTouchStart={() => setIsTapped(true)}
        onTouchEnd={() => setIsTapped(false)}
        whileHover={!isMobile ? {
          boxShadow: type === 'food' 
            ? '0 25px 50px rgba(72,187,120,0.7)' 
            : '0 25px 50px rgba(236,72,153,0.7)',
          transition: { duration: 0.3 }
        } : {}}
        whileTap={{ scale: 0.98 }}
        animate={isTapped ? {
          scale: 0.97,
          opacity: 0.9
        } : {}}
        style={{
          willChange: 'transform, box-shadow',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Card Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <motion.div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${iconBgFrom} ${iconBgTo} flex items-center justify-center mb-4`}
            animate={isHovered && !isMobile ? {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="text-3xl sm:text-4xl">{config.icon}</span>
          </motion.div>
          
          <Typography variant="subheading" className={`text-2xl sm:text-3xl font-bold ${titleColor} mb-2`}>
            {config.title}
          </Typography>
          
          <Typography variant="body" className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            {config.description}
          </Typography>
        </div>

        {/* Features List */}
        <div className="mb-6 sm:mb-8 space-y-3">
          {config.features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center gap-3"
            >
              <div className={`w-6 h-6 rounded-full ${featureIconBg} flex items-center justify-center`}>
                <span className={`${featureIconColor} text-sm`}>✓</span>
              </div>
              <Typography variant="body" className="text-gray-700 text-sm sm:text-base">
                {feature}
              </Typography>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.button
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          whileHover={!isMobile ? {
            scale: 1.05,
            boxShadow: type === 'food' 
              ? '0 25px 50px rgba(72,187,120,0.7)' 
              : '0 25px 50px rgba(236,72,153,0.7)',
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.8
            }
          } : {}}
          whileTap={{
            scale: isMobile ? 0.97 : 0.95,
            transition: { duration: 0.1 }
          }}
          onClick={onClick}
          className={`w-full flex items-center justify-center gap-3 ${type === 'food' 
            ? 'bg-gradient-to-r from-green-600 via-emerald-500 to-green-400' 
            : 'bg-gradient-to-r from-pink-500 via-rose-400 to-pink-300'} 
            text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold shadow-lg 
            relative overflow-hidden active:scale-95 transition-transform duration-150`}
          style={{
            ...TYPOGRAPHY_CONFIG.button,
            willChange: 'transform, box-shadow',
            transform: 'translateZ(0)',
            WebkitFontSmoothing: 'antialiased'
          }}
          aria-label={`Scan ${type} products`}
        >
          <span className="text-xl sm:text-2xl">{config.emoji}</span>
          <span>{config.buttonText}</span>
          
          {/* Shimmer effect */}
          {isHovered && !isMobile && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)'
              }}
            />
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
});

ScannerCard.displayName = 'ScannerCard';

const ScanTypeSelector = memo(() => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const lastTapTimeRef = useRef(0);
  const containerRef = useRef(null);

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice, { passive: true });

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  // Navigation handler
  const handleSelect = useCallback((type) => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 1000) return;
    lastTapTimeRef.current = now;

    if (type === 'food') navigate('/scan');
    else if (type === 'cosmetics') navigate('/scan-cosmetics');
  }, [navigate]);

  // Scanner configurations
  const scannerConfigs = useMemo(() => ({
    food: {
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #059669 100%)',
      lightColor: '#34D399',
      darkColor: '#059669',
      emoji: '🥗🍎🥑',
      icon: '🍽️',
      title: 'Food Scanner',
      description: 'Scan food products for nutritional analysis and health insights',
      features: ['Nutritional Info', 'Ingredients', 'Allergens', 'Health Score'],
      buttonText: 'Scan Food'
    },
    cosmetics: {
      gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #DB2777 100%)',
      lightColor: '#F472B6',
      darkColor: '#DB2777',
      emoji: '💄🧴✨',
      icon: '🪞',
      title: 'Cosmetics Scanner',
      description: 'Analyze cosmetic products for safety and ingredient quality',
      features: ['Ingredient Safety', 'Skin Compatibility', 'Quality Rating', 'Allergy Check'],
      buttonText: 'Scan Cosmetics'
    }
  }), []);

  // Animation variants - Define them here
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative min-h-screen w-full bg-gradient-to-b from-gray-50 via-white to-gray-100 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          animate={{
            opacity: [0.03, 0.06, 0.03],
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -15, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.1), rgba(52,211,153,0.05), transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full"
          animate={{
            opacity: [0.02, 0.05, 0.02],
            scale: [1, 1.08, 1],
            x: [0, -15, 0],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.1), rgba(244,114,182,0.05), transparent 70%)',
            filter: 'blur(50px)'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col items-center justify-center py-8 sm:py-12">
        
        {/* Header Section */}
        <motion.div
          variants={titleVariants}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <Typography 
            variant="heading" 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4"
          >
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
              className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-400 bg-[length:300%_auto] bg-clip-text text-transparent"
            >
              Choose Scanner
            </motion.span>
          </Typography>
          
          <Typography 
            variant="body" 
            className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-4"
          >
            Select the type of product you want to analyze
          </Typography>
          
          <motion.div
            className="h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto"
            initial={{ width: 0 }}
            animate={{ width: isMobile ? "100px" : "150px" }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          />
        </motion.div>

        {/* Cards Container */}
        <motion.div
          variants={cardContainerVariants}
          className="w-full max-w-6xl mx-auto"
        >
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6 sm:gap-8 md:gap-12`}>
            
            {/* Food Scanner Card */}
            <motion.div variants={cardVariants}>
              <ScannerCard
                type="food"
                config={scannerConfigs.food}
                isMobile={isMobile}
                isHovered={hoveredCard === 'food'}
                onClick={() => handleSelect('food')}
                onHoverStart={() => !isMobile && setHoveredCard('food')}
                onHoverEnd={() => !isMobile && setHoveredCard(null)}
                cardVariants={cardVariants} // Pass cardVariants as prop
              />
            </motion.div>

            {/* Cosmetics Scanner Card */}
            <motion.div variants={cardVariants}>
              <ScannerCard
                type="cosmetics"
                config={scannerConfigs.cosmetics}
                isMobile={isMobile}
                isHovered={hoveredCard === 'cosmetics'}
                onClick={() => handleSelect('cosmetics')}
                onHoverStart={() => !isMobile && setHoveredCard('cosmetics')}
                onHoverEnd={() => !isMobile && setHoveredCard(null)}
                cardVariants={cardVariants} // Pass cardVariants as prop
              />
            </motion.div>

          </div>
        </motion.div>

        {/* Divider & OR Text */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center my-8 sm:my-12"
          >
            <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <Typography 
              variant="accent" 
              className="mx-6 text-gray-500 text-sm font-medium bg-white px-4 py-2 rounded-full border border-gray-200"
            >
              OR
            </Typography>
            <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </motion.div>
        )}

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 sm:mt-12 md:mt-16 text-center"
        >
          <Typography 
            variant="subheading" 
            className="text-xl sm:text-2xl text-gray-700 mb-4 sm:mb-6"
          >
            Both Scanners Include:
          </Typography>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {['Instant Results', 'AI Powered', '100% Private', 'Free to Use'].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mb-2">
                  <span className="text-white text-sm">✓</span>
                </div>
                <Typography variant="body" className="text-gray-600 text-xs sm:text-sm">
                  {feature}
                </Typography>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 sm:mt-12 text-center"
        >
          <Typography 
            variant="body" 
            className="text-gray-500 text-sm sm:text-base"
          >
            Simply tap on a scanner to begin your analysis
          </Typography>
        </motion.div>

      </div>
    </motion.div>
  );
});

ScanTypeSelector.displayName = 'ScanTypeSelector';

export default ScanTypeSelector;