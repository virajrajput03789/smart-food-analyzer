import React, { useRef, useEffect, useState, useCallback, useMemo, Suspense } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useVelocity,
  useReducedMotion,
  AnimatePresence
} from "framer-motion";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import kaedeAnim from "../assets/kaede.json";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";

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

// Typing Animation Component (Updated with new fonts)
const TypingAnimation = React.memo(({ text, speed = 50, className = "", delay = 0, variant = "body" }) => {
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

  const typographyStyle = TYPOGRAPHY_CONFIG[variant] || TYPOGRAPHY_CONFIG.body;

  return (
    <div className={`inline-flex items-center ${className}`} style={typographyStyle}>
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
    </div>
  );
});

TypingAnimation.displayName = 'TypingAnimation';

// Rest of the code remains EXACTLY THE SAME from here...
// ============================================
// PERFORMANCE BUDGETS & MONITORING
// ============================================

const PERF_BUDGET = {
  fps: 60,
  memory: 50, // MB
  interactionDelay: 100, // ms
  maxParticlesMobile: 150,
  maxParticlesTablet: 300,
  maxParticlesDesktop: 500,
  scrollThrottle: 16, // ~60fps
  resizeDebounce: 150
};

// Performance monitoring utility
const usePerformanceMonitor = () => {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.duration > PERF_BUDGET.interactionDelay) {
            console.warn('[Performance] Long task detected:', {
              name: entry.name,
              duration: entry.duration.toFixed(2) + 'ms',
              startTime: entry.startTime.toFixed(2)
            });
          }
        });
      });
      
      // Monitor paint timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          console.log('[Performance] Paint:', {
            name: entry.name,
            startTime: entry.startTime.toFixed(2),
            duration: entry.duration?.toFixed(2)
          });
        });
      });
      
      // Monitor memory if available
      if ('memory' in performance) {
        const checkMemory = () => {
          const memory = performance.memory;
          const usedMB = memory.usedJSHeapSize / 1048576;
          if (usedMB > PERF_BUDGET.memory) {
            console.warn(`[Performance] High memory usage: ${usedMB.toFixed(2)}MB`);
          }
        };
        const memoryInterval = setInterval(checkMemory, 10000);
        return () => clearInterval(memoryInterval);
      }
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.log('[Performance] Observer not supported:', e);
      }
      
      return () => {
        longTaskObserver.disconnect();
        paintObserver.disconnect();
      };
    }
  }, []);
};

// Throttle utility for performance
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

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const PREMIUM_SPRINGS = {
  ultraSmooth: {
    stiffness: 180,
    damping: 32,
    mass: 0.6,
    restDelta: 0.0001,
    restSpeed: 0.0001
  },
  smooth: {
    stiffness: 150,
    damping: 28,
    mass: 0.5,
    restDelta: 0.0001,
    restSpeed: 0.0001
  },
  responsive: {
    stiffness: 140,
    damping: 30,
    mass: 0.7,
    restDelta: 0.001,
    restSpeed: 0.001
  }
};

const PREMIUM_EASING = {
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeOutCirc: [0, 0.55, 0.45, 1],
  easeOutQuint: [0.22, 1, 0.36, 1]
};

const FEATURES_DATA = [
  { 
    title: "Scan Products", 
    description: "Instant barcode scanning for food items and cosmetics.",
    icon: "📱",
    color: "#10B981"
  },
  { 
    title: "Health Score", 
    description: "Get a clear score based on nutrition, additives, and ingredients.",
    icon: "⭐",
    color: "#059669"
  },
  { 
    title: "Privacy First", 
    description: "No ads, no data sharing — your health, your control.",
    icon: "🔒",
    color: "#047857"
  },
  { 
    title: "Smart Insights", 
    description: "AI-powered analysis of ingredients and nutrition facts.",
    icon: "🤖",
    color: "#7C3AED"
  },
  { 
    title: "Allergen Alert", 
    description: "Instant warnings for common allergens and sensitivities.",
    icon: "⚠️",
    color: "#DC2626"
  },
  { 
    title: "Save History", 
    description: "Track your scanning history and health progress.",
    icon: "📊",
    color: "#0EA5E9"
  }
];

const STATS_DATA = [
  { value: "10K+", label: "Products Scanned", color: "#10B981" },
  { value: "4.8★", label: "User Rating", color: "#059669" },
  { value: "100%", label: "Privacy Score", color: "#047857" },
  { value: "24/7", label: "Support", color: "#7C3AED" }
];

// ============================================
// WEB WORKER FOR PARTICLE CALCULATIONS
// ============================================

class ParticleWorker {
  constructor() {
    this.worker = null;
    this.initWorker();
  }

  initWorker() {
    if (typeof Worker !== 'undefined') {
      const workerCode = `
        self.onmessage = function(e) {
          const { count, isMobile, isTablet } = e.data;
          const positions = new Float32Array(count * 3);
          
          for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
          }
          
          self.postMessage({ positions });
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
    }
  }

  generateParticles(count, isMobile, isTablet) {
    return new Promise((resolve) => {
      if (!this.worker) {
        // Fallback to main thread
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        resolve(positions);
        return;
      }

      this.worker.onmessage = (e) => {
        resolve(e.data.positions);
      };
      
      this.worker.postMessage({ count, isMobile, isTablet });
    });
  }

  cleanup() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}

// Optimized Three.js Shader Material
const createOptimizedParticleMaterial = () => {
  return useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        pointTexture: { value: null }
      },
      vertexShader: `
        uniform float time;
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        
        void main() {
          vColor = customColor;
          vec3 pos = position;
          pos.y += sin(time + position.x) * 0.001;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        
        void main() {
          vec4 texColor = texture2D(pointTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor, texColor.a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    return material;
  }, []);
};

// ============================================
// ANTI-GRAVITY SPECIFIC ANIMATIONS
// ============================================

// Custom Cursor like Antigravity
const CustomAntigravityCursor = React.memo(({ mousePosition, isHovering }) => {
  return (
    <motion.div
      className="fixed pointer-events-none z-50 will-change-transform"
      style={{
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`,
      }}
      animate={{
        scale: isHovering ? 1.5 : 1,
        opacity: isHovering ? 0.7 : 0.3,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28
      }}
    >
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-green-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '24px',
            height: '24px',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Inner dot */}
        <motion.div
          className="absolute rounded-full bg-green-500"
          animate={{
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '6px',
            height: '6px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Glow effect */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '40px',
            height: '40px',
            left: '50%',
            top: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.4), transparent 70%)',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(8px)'
          }}
        />
      </div>
    </motion.div>
  );
});

CustomAntigravityCursor.displayName = 'CustomAntigravityCursor';

// Particle System for Background (Antigravity Style) - OPTIMIZED
function ParticleSystem({ count = 500, isMobile, isTablet }) {
  const points = useRef();
  const time = useRef(0);
  const particleWorker = useRef(new ParticleWorker());
  const [particlesPosition, setParticlesPosition] = useState(null);
  
  // Optimized particle count based on performance budget
  const optimizedCount = useMemo(() => {
    if (isMobile) return Math.min(count, PERF_BUDGET.maxParticlesMobile);
    if (isTablet) return Math.min(count, PERF_BUDGET.maxParticlesTablet);
    return Math.min(count, PERF_BUDGET.maxParticlesDesktop);
  }, [count, isMobile, isTablet]);

  // Generate particles in web worker
  useEffect(() => {
    let mounted = true;
    
    const generateParticles = async () => {
      performance.mark('particleGenerationStart');
      
      const positions = await particleWorker.current.generateParticles(
        optimizedCount,
        isMobile,
        isTablet
      );
      
      if (mounted) {
        setParticlesPosition(positions);
        performance.mark('particleGenerationEnd');
        performance.measure(
          'Particle Generation',
          'particleGenerationStart',
          'particleGenerationEnd'
        );
      }
    };
    
    generateParticles();
    
    return () => {
      mounted = false;
      particleWorker.current.cleanup();
    };
  }, [optimizedCount, isMobile, isTablet]);

  useFrame((state) => {
    if (points.current && particlesPosition) {
      time.current += 0.05;
      
      // Use requestAnimationFrame timing for smooth updates
      const delta = state.clock.getDelta();
      points.current.rotation.x += delta * 0.05;
      points.current.rotation.y += delta * 0.03;
      
      // Update positions less frequently for performance
      if (state.clock.elapsedTime % 0.1 < delta) {
        const positions = points.current.geometry.attributes.position.array;
        for (let i = 0; i < optimizedCount; i++) {
          const idx = i * 3;
          positions[idx + 1] += Math.sin(time.current + i) * 0.001;
        }
        points.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  if (!particlesPosition) return null;

  return (
    <Points ref={points} positions={particlesPosition} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#10B981"
        size={isMobile ? 0.01 : 0.015}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

const AntigravityBackground = React.memo(({ isMobile, isTablet }) => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        performance={{ min: 0.5 }} // Lower precision for better performance
      >
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          <ParticleSystem 
            count={500} 
            isMobile={isMobile} 
            isTablet={isTablet} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
});

AntigravityBackground.displayName = 'AntigravityBackground';

// Antigravity-Scale Particle Background
const AntigravityParticleBackground = React.memo(({ isMobile, isTablet }) => {
  // Optimized particle count based on device
  const particleCount = useMemo(() => {
    if (isMobile) return Math.min(80, PERF_BUDGET.maxParticlesMobile / 2);
    if (isTablet) return Math.min(120, PERF_BUDGET.maxParticlesTablet / 2);
    return Math.min(200, PERF_BUDGET.maxParticlesDesktop / 2);
  }, [isMobile, isTablet]);
  
  const particles = useMemo(() => 
    Array.from({ length: particleCount }, (_, i) => {
      const size = Math.random() * (isMobile ? 2 : 3) + 1;
      const colors = [
        'rgba(16, 185, 129, 0.15)',
        'rgba(52, 211, 153, 0.15)',
        'rgba(34, 197, 94, 0.15)',
        'rgba(5, 150, 105, 0.15)'
      ];
      
      return {
        id: i,
        size,
        color: colors[i % 4],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        xRange: (Math.random() - 0.5) * (isMobile ? 40 : 80),
        yRange: (Math.random() - 0.5) * (isMobile ? 40 : 80),
        duration: Math.random() * 8 + 10,
        delay: i * 0.02,
        rotation: Math.random() * 360
      };
    })
  , [particleCount, isMobile]);
  
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            background: particle.color,
            left: particle.left,
            top: particle.top,
            willChange: 'transform',
            transform: 'translate3d(0,0,0)',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
          animate={{
            x: [0, particle.xRange, 0, -particle.xRange, 0],
            y: [0, particle.yRange, 0, -particle.yRange, 0],
            opacity: [0.1, 0.3, 0.1, 0.3, 0.1],
            scale: [1, 1.3, 1, 1.3, 1],
            rotate: [0, particle.rotation, particle.rotation * 2]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
            times: [0, 0.25, 0.5, 0.75, 1]
          }}
        />
      ))}
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        animate={{
          opacity: [0.05, 0.15, 0.05],
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.3), rgba(34,197,94,0.2), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform, opacity'
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
        animate={{
          opacity: [0.05, 0.15, 0.05],
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 30, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        style={{
          background: 'radial-gradient(circle, rgba(253,224,71,0.2), rgba(34,197,94,0.15), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform, opacity'
        }}
      />
    </div>
  );
});

AntigravityParticleBackground.displayName = 'AntigravityParticleBackground';

// Bouncing Icons Animation (Antigravity Style) - OPTIMIZED
const BouncingIcons = React.memo(({ isMobile }) => {
  const icons = ["📱", "⭐", "🔒", "🤖", "⚠️", "📊", "🔍", "✨", "💚", "🍎"];
  
  // Optimized count for performance
  const iconCount = isMobile ? 6 : 10;
  
  return (
    <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
      {icons.slice(0, iconCount).map((icon, idx) => (
        <motion.div
          key={idx}
          className="absolute"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
          }}
          animate={{
            y: [
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`
            ],
            x: [
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`
            ],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            fontSize: isMobile ? "1.5rem" : "2rem",
            opacity: 0.1,
            willChange: 'transform'
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>
  );
});

BouncingIcons.displayName = 'BouncingIcons';

// Enhanced Hover Effect Component (Antigravity Style) - OPTIMIZED
const AntigravityHoverEffect = React.memo(({ children, intensity = 1, isMobile, reducedMotion }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  // Throttled mouse move handler
  const handleMouseMove = useCallback(throttle((e) => {
    if (isMobile || reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * intensity * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * intensity * 20;
    setMousePosition({ x, y });
  }, PERF_BUDGET.scrollThrottle), [isMobile, reducedMotion, intensity]);

  return (
    <motion.div
      ref={ref}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      animate={{
        rotateY: isHovered ? mousePosition.x : 0,
        rotateX: isHovered ? -mousePosition.y : 0,
        scale: isHovered ? 1.02 : 1,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 30,
          mass: 0.5
        }
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {children}
      
      {isHovered && !isMobile && !reducedMotion && (
        <>
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{
              background: `radial-gradient(600px circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(16,185,129,0.1), transparent 50%)`,
            }}
            transition={{ duration: 0.3 }}
          />
          
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </>
      )}
    </motion.div>
  );
});

AntigravityHoverEffect.displayName = 'AntigravityHoverEffect';

// Video Player Hover Effect
const VideoHoverEffect = React.memo(({ children, isMobile, reducedMotion }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Throttled mouse move handler
  const handleMouseMove = useCallback(throttle((e) => {
    if (isMobile || reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, PERF_BUDGET.scrollThrottle), [isMobile, reducedMotion]);

  return (
    <div 
      className="relative overflow-hidden rounded-3xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      
      {!isMobile && !reducedMotion && (
        <>
          <motion.div
            className="absolute pointer-events-none rounded-full will-change-transform"
            animate={{
              scale: isHovered ? 1 : 0,
              opacity: isHovered ? 0.8 : 0,
              x: mousePosition.x - 40,
              y: mousePosition.y - 40
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            style={{
              width: 80,
              height: 80,
              background: "radial-gradient(circle, rgba(16,185,129,0.4), transparent 70%)",
              filter: "blur(10px)",
              willChange: 'transform, opacity'
            }}
          />
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.8
            }}
            transition={{
              duration: 0.3
            }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-white text-3xl"
              >
                ▶
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
});

VideoHoverEffect.displayName = 'VideoHoverEffect';

// Slider Component with Antigravity Animation
const AntigravitySlider = React.memo(({ items, isMobile }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.type.includes('mouse') ? e.clientX : e.touches[0].clientX);
  };

  const handleDragMove = useCallback(throttle((e) => {
    if (!isDragging) return;
    
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  }, PERF_BUDGET.scrollThrottle), [isDragging, startX]);

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    if (Math.abs(translateX) > 100) {
      if (translateX > 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (translateX < 0 && currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }
    setTranslateX(0);
  };

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-3xl">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ willChange: 'transform' }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              className="w-full flex-shrink-0"
              whileHover={!isMobile ? { scale: 1.02 } : undefined}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="bg-gradient-to-br from-white to-green-50/30 rounded-3xl p-8 m-4 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    className="text-3xl"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: idx * 0.2
                    }}
                  >
                    {item.icon}
                  </motion.div>
                  <Typography variant="subheading" className="text-green-800 font-bold">{item.title}</Typography>
                </div>
                <Typography variant="body" className="text-gray-600">{item.description}</Typography>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Slider Controls */}
      <div className="flex justify-center gap-4 mt-6">
        {items.map((_, idx) => (
          <motion.button
            key={idx}
            className={`w-3 h-3 rounded-full ${
              idx === currentIndex ? 'bg-green-500' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(idx)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={idx === currentIndex ? {
              scale: [1, 1.2, 1],
              transition: { duration: 2, repeat: Infinity }
            } : {}}
          />
        ))}
      </div>
    </div>
  );
});

AntigravitySlider.displayName = 'AntigravitySlider';

// Modal Animation Component
const AnimatedModal = React.memo(({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl p-8 max-w-2xl w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

AnimatedModal.displayName = 'AnimatedModal';

// ============================================
// LAZY LOADED COMPONENTS
// ============================================

const LazyLottieAnimation = React.lazy(() => 
  import('lottie-react').then(module => ({
    default: ({ animationData, ...props }) => (
      <module.default animationData={animationData} {...props} />
    )
  }))
);

const LazyThreeScene = React.lazy(() => 
  Promise.all([
    import('@react-three/fiber'),
    import('@react-three/drei')
  ]).then(([fiber, drei]) => ({
    default: ({ children }) => (
      <fiber.Canvas>
        <drei.Suspense fallback={null}>
          {children}
        </drei.Suspense>
      </fiber.Canvas>
    )
  }))
);

// ============================================
// OPTIMIZED CUSTOM HOOKS
// ============================================

const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    touchCapable: false,
    reducedMotion: false,
    screenWidth: 1024
  });
  
  useEffect(() => {
    performance.mark('deviceDetectionStart');
    
    const checkDevice = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        touchCapable,
        reducedMotion,
        screenWidth: width
      });
      
      performance.mark('deviceDetectionEnd');
      performance.measure(
        'Device Detection',
        'deviceDetectionStart',
        'deviceDetectionEnd'
      );
    };
    
    checkDevice();
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkDevice, PERF_BUDGET.resizeDebounce);
    };
    
    window.addEventListener("resize", handleResize, { passive: true });
    
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => {
      setDeviceInfo(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    
    motionMediaQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  return deviceInfo;
};

// Optimized scroll hook with passive listeners
const useOptimizedScroll = () => {
  const [scrollState, setScrollState] = useState({
    y: 0,
    velocity: 0,
    isScrolling: false
  });
  
  useEffect(() => {
    let ticking = false;
    let lastY = 0;
    let lastTime = 0;
    
    const updateScrollState = () => {
      const currentY = window.scrollY;
      const currentTime = performance.now();
      
      if (lastTime > 0) {
        const deltaY = Math.abs(currentY - lastY);
        const deltaTime = currentTime - lastTime;
        const velocity = deltaY / deltaTime;
        
        setScrollState({
          y: currentY,
          velocity,
          isScrolling: velocity > 0.5
        });
      }
      
      lastY = currentY;
      lastTime = currentTime;
      ticking = false;
    };
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return scrollState;
};

// ============================================
// OPTIMIZED COMPONENTS
// ============================================

const MicroInteraction = React.memo(({ x, y, color, isMobile }) => {
  return (
    <motion.div
      className="absolute pointer-events-none will-change-transform"
      initial={{ x, y, scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.4, 0],
        opacity: [0, 0.8, 0],
        rotate: [0, 180],
        y: [y, y - (isMobile ? 20 : 40)]
      }}
      transition={{
        duration: isMobile ? 0.4 : 0.6,
        ease: "easeOut",
        times: [0, 0.5, 1]
      }}
      style={{
        width: isMobile ? 8 : 12,
        height: isMobile ? 8 : 12,
        background: `radial-gradient(circle, ${color}60 30%, transparent 70%)`,
        borderRadius: '50%',
        transform: 'translate3d(0,0,0)',
        backfaceVisibility: 'hidden',
        perspective: 1000
      }}
    />
  );
});

MicroInteraction.displayName = 'MicroInteraction';

const InteractiveBackground = React.memo(({ isMobile, isTablet }) => {
  const [interactions, setInteractions] = useState([]);
  const particleCount = useMemo(() => {
    if (isMobile) return Math.min(15, PERF_BUDGET.maxParticlesMobile / 10);
    if (isTablet) return Math.min(25, PERF_BUDGET.maxParticlesTablet / 12);
    return Math.min(40, PERF_BUDGET.maxParticlesDesktop / 10);
  }, [isMobile, isTablet]);
  
  useEffect(() => {
    const colors = ['#10B981', '#34D399', '#22C55E', '#059669'];
    
    const interval = setInterval(() => {
      if (interactions.length < particleCount) {
        const newInteraction = {
          id: Date.now(),
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
        
        setInteractions(prev => [
          ...prev.slice(-(particleCount - 1)),
          newInteraction
        ]);
        
        setTimeout(() => {
          setInteractions(prev => prev.filter(i => i.id !== newInteraction.id));
        }, 1500);
      }
    }, isMobile ? 200 : 100);
    
    return () => clearInterval(interval);
  }, [interactions.length, particleCount, isMobile]);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      {interactions.map(interaction => (
        <MicroInteraction
          key={interaction.id}
          x={interaction.x}
          y={interaction.y}
          color={interaction.color}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
});

InteractiveBackground.displayName = 'InteractiveBackground';

const ParticleBackground = React.memo(({ isMobile, isTablet }) => {
  const particleCount = useMemo(() => {
    if (isMobile) return Math.min(40, PERF_BUDGET.maxParticlesMobile / 4);
    if (isTablet) return Math.min(60, PERF_BUDGET.maxParticlesTablet / 5);
    return Math.min(80, PERF_BUDGET.maxParticlesDesktop / 6);
  }, [isMobile, isTablet]);
  
  const particles = useMemo(() => 
    Array.from({ length: particleCount }, (_, i) => {
      const size = isMobile ? Math.random() * 2 + 1 : Math.random() * 3 + 1;
      const colors = ['#22c55e20', '#10b98120', '#34d39920', '#05966920'];
      
      return {
        id: i,
        size,
        color: colors[i % 4],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        xRange: (Math.random() - 0.5) * (isMobile ? 30 : 50),
        yRange: (Math.random() - 0.5) * (isMobile ? 30 : 50),
        duration: Math.random() * 4 + 6,
        delay: i * 0.05
      };
    })
  , [particleCount, isMobile]);
  
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            background: particle.color,
            left: particle.left,
            top: particle.top,
            willChange: 'transform',
            transform: 'translate3d(0,0,0)'
          }}
          animate={{
            x: [0, particle.xRange],
            y: [0, particle.yRange],
            opacity: [0.1, 0.25, 0.1],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
            times: [0, 0.5, 1]
          }}
        />
      ))}
    </div>
  );
});

ParticleBackground.displayName = 'ParticleBackground';

const ScrollProgress = React.memo(({ scrollYProgress }) => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 z-50 origin-left will-change-transform"
      style={{ 
        scaleX: scrollYProgress,
        transform: 'translate3d(0,0,0)',
        willChange: 'transform'
      }}
    />
  );
});

ScrollProgress.displayName = 'ScrollProgress';

const PremiumHoverEffect = React.memo(({ children, isMobile }) => {
  const [hoverState, setHoverState] = useState({ x: 0, y: 0, active: false });
  
  // Throttled mouse move handler
  const handleMouseMove = useCallback(throttle((e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverState({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    });
  }, PERF_BUDGET.scrollThrottle), [isMobile]);
  
  const handleMouseLeave = useCallback(() => {
    setHoverState(prev => ({ ...prev, active: false }));
  }, []);
  
  return (
    <div 
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {!isMobile && (
        <motion.div
          className="absolute pointer-events-none rounded-full will-change-transform"
          animate={{
            scale: hoverState.active ? 1 : 0,
            opacity: hoverState.active ? 0.4 : 0,
            x: hoverState.x - 60,
            y: hoverState.y - 60
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          style={{
            width: 120,
            height: 120,
            background: "radial-gradient(circle, rgba(34,197,94,0.3), rgba(16,185,129,0.1), transparent 70%)",
            filter: "blur(15px)",
            willChange: 'transform, opacity'
          }}
        />
      )}
    </div>
  );
});

PremiumHoverEffect.displayName = 'PremiumHoverEffect';

const FeatureCard = React.memo(({ 
  title, 
  description, 
  icon, 
  index, 
  isMobile, 
  isTablet, 
  reducedMotion 
}) => {
  return (
    <AntigravityHoverEffect intensity={1.2} isMobile={isMobile} reducedMotion={reducedMotion}>
      <motion.div
        variants={{
          hidden: { 
            opacity: 0, 
            y: 40,
            scale: 0.9
          },
          visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: { 
              type: "spring",
              stiffness: 100,
              damping: 25,
              mass: 0.5,
              delay: index * 0.1
            }
          }
        }}
        whileHover={!isMobile && !reducedMotion ? {
          y: -12,
          scale: 1.03,
          transition: { 
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        } : undefined}
        whileTap={{ 
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
        className="group relative cursor-pointer w-full"
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-white to-green-50/30 rounded-3xl shadow-lg backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-500 ${
          isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'
        }`} />
        
        <div className={`relative ${isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'} w-full`}>
          <motion.div
            whileHover={!isMobile && !reducedMotion ? { 
              scale: 1.15,
              rotate: [0, -5, 5, 0]
            } : undefined}
            transition={{ duration: 0.5 }}
            className={`mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white to-green-100 flex items-center justify-center shadow-lg ${
              isMobile ? 'w-16 h-16' : isTablet ? 'w-20 h-20' : 'w-24 h-24'
            }`}
          >
            <motion.div
              animate={reducedMotion ? {} : { 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0]
              }}
              transition={reducedMotion ? {} : { 
                duration: 3, 
                repeat: Infinity,
                delay: index * 0.2
              }}
              className={isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'}
            >
              {icon}
            </motion.div>
          </motion.div>
          
          <Typography variant="subheading" className="text-green-800 text-center mb-2 font-bold">
            <TypingAnimation text={title} speed={30} variant="subheading" />
          </Typography>
          
          <Typography variant="body" className="text-gray-600 text-center">
            {description}
          </Typography>
        </div>
      </motion.div>
    </AntigravityHoverEffect>
  );
});

FeatureCard.displayName = 'FeatureCard';

const StatCard = React.memo(({ value, label, color, index, isMobile, reducedMotion }) => {
  return (
    <motion.div
      className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm w-full"
      initial={{ 
        opacity: 0, 
        y: 30,
        scale: 0.9
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      viewport={{ once: true }}
      transition={{ 
        type: "spring",
        stiffness: 120,
        damping: 25,
        delay: index * 0.1
      }}
      whileHover={!isMobile && !reducedMotion ? { 
        y: -5,
        scale: 1.05,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={{ scale: 0.95 }}
    >
      <div className="p-4 sm:p-6">
        <motion.div
          className={`mb-2`}
          style={{
            ...TYPOGRAPHY_CONFIG.heading,
            fontSize: isMobile ? '2rem' : '2.5rem',
            color
          }}
          animate={reducedMotion ? {} : { 
            scale: [1, 1.1, 1]
          }}
          transition={reducedMotion ? {} : { 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.3
          }}
        >
          <TypingAnimation text={value} speed={50} variant="heading" />
        </motion.div>
        <Typography variant="body" className="text-gray-600">
          {label}
        </Typography>
      </div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

// ============================================
// MAIN HOME COMPONENT
// ============================================

export default function Home() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  
  const [ripples, setRipples] = useState([]);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [scrollState, setScrollState] = useState({ velocity: 0, isScrolling: false });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const deviceInfo = useDeviceDetection();
  const { isMobile, isTablet, reducedMotion } = deviceInfo;
  
  // Performance monitoring
  usePerformanceMonitor();
  
  // Component mount performance mark
  useEffect(() => {
    performance.mark('HomeComponentMounted');
    return () => {
      performance.measure('HomeComponentLifecycle', 'HomeComponentMounted');
    };
  }, []);
  
  // Scroll progress and velocity with optimized hook
  const { scrollY, scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const optimizedScroll = useOptimizedScroll();
  
  useEffect(() => {
    const unsubscribe = scrollVelocity.on("change", (latest) => {
      const velocity = Math.abs(latest);
      setScrollState({
        velocity,
        isScrolling: velocity > 0.5
      });
    });
    
    return () => unsubscribe();
  }, [scrollVelocity]);
  
  // Optimized scroll animations
  const heroScale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 1],
    [1, 0.998, 0.995, 0.99, 0.98]
  );
  
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1, 0.95]
  );
  
  const heroY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, isMobile ? -15 : -30]
  );
  
  const heroScaleSpring = useSpring(heroScale, PREMIUM_SPRINGS.ultraSmooth);
  const heroYSpring = useSpring(heroY, PREMIUM_SPRINGS.smooth);
  
  // Enhanced mouse tracking with throttling
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    if (isMobile) return;
    
    let lastX = 0;
    let lastY = 0;
    let animationId;
    let lastUpdate = 0;
    
    const updateMousePosition = (timestamp) => {
      if (timestamp - lastUpdate < PERF_BUDGET.scrollThrottle) {
        animationId = requestAnimationFrame(updateMousePosition);
        return;
      }
      
      lastUpdate = timestamp;
      const currentX = mousePosition.x / window.innerWidth - 0.5;
      const currentY = mousePosition.y / window.innerHeight - 0.5;
      
      // Smooth interpolation
      lastX = lastX + (currentX - lastX) * 0.15;
      lastY = lastY + (currentY - lastY) * 0.15;
      
      mouseX.set(lastX);
      mouseY.set(lastY);
      
      animationId = requestAnimationFrame(updateMousePosition);
    };
    
    animationId = requestAnimationFrame(updateMousePosition);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mousePosition, isMobile, mouseX, mouseY]);
  
  // Premium 3D effects
  const rotateY = useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [3, -3]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [-2, 2]);
  const parallaxX = useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [-15, 15]);
  const parallaxYMouse = useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [-12, 12]);
  
  const rotateYSpring = useSpring(rotateY, PREMIUM_SPRINGS.ultraSmooth);
  const rotateXSpring = useSpring(rotateX, PREMIUM_SPRINGS.ultraSmooth);
  const parallaxXSpring = useSpring(parallaxX, PREMIUM_SPRINGS.smooth);
  const parallaxYMouseSpring = useSpring(parallaxYMouse, PREMIUM_SPRINGS.smooth);
  
  // Optimized ripple effect with throttling
  const handleInteraction = useCallback(throttle((e) => {
    const target = e.target;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.closest('button') ||
      target.closest('a')
    ) {
      return;
    }
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let clientX, clientY;
    if (e.touches || e.changedTouches) {
      const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
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
      'rgba(16, 185, 129, 0.8)',
      'rgba(52, 211, 153, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(5, 150, 105, 0.8)'
    ];
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: isMobile ? 0.8 : 1
    };
    
    setRipples(prev => [...prev.slice(-2), newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);
  }, PERF_BUDGET.scrollThrottle), [isMobile]);
  
  // Throttled mouse/touch movement
  const handleMove = useCallback(throttle((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let clientX, clientY;
    if (e.touches) {
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
      setMousePosition({ x: clientX, y: clientY });
    }
  }, PERF_BUDGET.scrollThrottle), [isMobile]);

  // Hover detection for interactive elements
  useEffect(() => {
    const handleElementHover = throttle((e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.hover-effect')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    }, PERF_BUDGET.scrollThrottle);
    
    if (!isMobile) {
      document.addEventListener('mouseover', handleElementHover, { passive: true });
      return () => document.removeEventListener('mouseover', handleElementHover);
    }
  }, [isMobile]);
  
  // Intersection Observer for lazy loading
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observerOptions = {
      rootMargin: '100px',
      threshold: 0.1,
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    
    return () => {
      if (contentRef.current) {
        observer.unobserve(contentRef.current);
      }
    };
  }, []);
  
  // Memoized components
  const RippleEffects = useMemo(() => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute pointer-events-none rounded-full"
            initial={{
              scale: 0,
              opacity: 0.9,
              x: ripple.x - 10,
              y: ripple.y - 10,
              width: 20,
              height: 20
            }}
            animate={{
              scale: [0, ripple.size * 3, ripple.size * 4],
              opacity: [0.9, 0.4, 0],
              width: [20, 140, 180],
              height: [20, 140, 180],
              x: [ripple.x - 10, ripple.x - 70, ripple.x - 90],
              y: [ripple.y - 10, ripple.y - 70, ripple.y - 90]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1,
              ease: PREMIUM_EASING.easeOutExpo
            }}
            style={{
              background: `radial-gradient(circle, ${ripple.color}, transparent 70%)`,
              filter: 'blur(10px)',
              mixBlendMode: 'screen',
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  ), [ripples]);
  
  const TouchTrail = useMemo(() => (
    <motion.div
      className="absolute pointer-events-none rounded-full z-30 will-change-transform"
      animate={{
        x: touchPosition.x - 5,
        y: touchPosition.y - 5,
        scale: scrollState.isScrolling ? 0.7 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 1200,
        damping: 70,
        mass: 0.2
      }}
      style={{
        width: 10,
        height: 10,
        background: "radial-gradient(circle, rgba(34,197,94,0.4), rgba(16,185,129,0.2))",
        border: '1.5px solid rgba(34,197,94,0.5)',
        filter: 'blur(0.5px)',
        willChange: 'transform'
      }}
    />
  ), [touchPosition, scrollState.isScrolling]);
  
  const BackgroundAnimation = useMemo(() => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <Suspense fallback={null}>
        {isVisible && (
          <>
            <InteractiveBackground isMobile={isMobile} isTablet={isTablet} />
            <ParticleBackground isMobile={isMobile} isTablet={isTablet} />
            <AntigravityParticleBackground isMobile={isMobile} isTablet={isTablet} />
            <AntigravityBackground isMobile={isMobile} isTablet={isTablet} />
            <BouncingIcons isMobile={isMobile} />
          </>
        )}
      </Suspense>
      
      {/* Add the custom cursor to background */}
      {!isMobile && !reducedMotion && <CustomAntigravityCursor mousePosition={mousePosition} isHovering={isHovering} />}
      
      <motion.div
        className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full"
        animate={{
          opacity: [0.08, 0.18, 0.08],
          scale: [1, 1.12, 1],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1]
        }}
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.2), rgba(34,197,94,0.15), transparent 70%)',
          filter: 'blur(100px)',
          willChange: 'transform, opacity'
        }}
      />
      
      <motion.div
        className="absolute -right-20 -bottom-20 w-[35rem] h-[35rem] rounded-full"
        animate={{
          opacity: [0.06, 0.14, 0.06],
          scale: [1, 1.08, 1],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          delay: 0.3
        }}
        style={{
          background: 'radial-gradient(circle, rgba(253,224,71,0.12), rgba(34,197,94,0.1), transparent 70%)',
          filter: 'blur(90px)',
          willChange: 'transform, opacity'
        }}
      />
    </div>
  ), [isMobile, isTablet, reducedMotion, mousePosition, isHovering, isVisible]);
  
  // Hero Lottie Animation Component with lazy loading
  const HeroLottie = useMemo(() => (
    <VideoHoverEffect isMobile={isMobile} reducedMotion={reducedMotion}>
      <motion.div
        animate={{ 
          y: [0, -12, 0]
        }}
        transition={{ 
          duration: reducedMotion ? 0 : 4,
          repeat: reducedMotion ? 0 : Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1]
        }}
        whileHover={!isMobile && !reducedMotion ? { 
          scale: 1.05,
          transition: { 
            type: "spring",
            stiffness: 400,
            damping: 25
          }
        } : undefined}
        whileTap={{ scale: 0.98 }}
        className={`${isMobile ? 'w-48 h-48' : isTablet ? 'w-64 h-64' : 'w-72 h-72'} flex-shrink-0 mx-auto lg:mx-0`}
        onClick={() => !isMobile && setShowModal(true)}
      >
        <div className={`relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-white to-green-50/50 ${
          isMobile ? 'shadow-xl' : 'shadow-2xl'
        } backdrop-blur-sm`}>
          <Suspense fallback={<div className="absolute inset-0 bg-green-100 animate-pulse" />}>
            <Lottie 
              animationData={kaedeAnim} 
              loop={!reducedMotion}
              className="absolute inset-0"
              onLoad={() => performance.mark('lottieAnimationLoaded')}
            />
          </Suspense>
        </div>
      </motion.div>
    </VideoHoverEffect>
  ), [isMobile, isTablet, reducedMotion]);
  
  // Hero Title Component
  const HeroTitle = useMemo(() => (
    <div className="relative">
      <motion.h1
        className={`font-bold tracking-tight ${
          isMobile ? 'text-3xl sm:text-4xl' : 
          isTablet ? 'text-4xl sm:text-5xl' : 
          'text-5xl sm:text-6xl lg:text-7xl'
        }`}
        animate={{
          backgroundPosition: reducedMotion ? '0% 50%' : ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: reducedMotion ? 0 : 15,
          repeat: reducedMotion ? 0 : Infinity,
          ease: "linear"
        }}
        style={{
          ...TYPOGRAPHY_CONFIG.heading,
          background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
          backgroundSize: '400% 400%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          willChange: 'background-position'
        }}
      >
        <TypingAnimation text="Eat Smarter." speed={70} variant="heading" className="block" />
        <br />
        <motion.span 
          className="text-emerald-700 block"
          style={TYPOGRAPHY_CONFIG.heading}
          animate={{ opacity: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <TypingAnimation text="Live Better." speed={70} delay={1000} variant="heading" />
        </motion.span>
      </motion.h1>
      
      <motion.div
        className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-4 ${isMobile ? 'h-0.5' : 'h-1'}`}
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ 
          duration: reducedMotion ? 0 : 1.5, 
          delay: 0.5,
          ease: PREMIUM_EASING.easeOutQuint
        }}
      />
    </div>
  ), [isMobile, isTablet, reducedMotion]);
  
  // Primary CTA Component
  const PrimaryCTA = useMemo(() => (
    <motion.div
      whileHover={!isMobile && !reducedMotion ? { 
        scale: 1.05,
        transition: { 
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      } : undefined}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      className="relative inline-block"
    >
      <Link
        to="/select-scan"
        className={`group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-semibold hover:shadow-3xl transition-all duration-300 overflow-hidden ${
          isMobile ? 'px-6 py-3 text-base shadow-lg' : 
          isTablet ? 'px-8 py-4 text-lg shadow-xl' : 
          'px-10 py-4 text-xl shadow-2xl'
        }`}
        onClick={() => performance.mark('ctaButtonClicked')}
        style={TYPOGRAPHY_CONFIG.button}
      >
        <motion.span
          animate={reducedMotion ? {} : { rotate: [0, 360] }}
          transition={reducedMotion ? {} : { 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear"
          }}
          className={isMobile ? 'text-xl' : 'text-2xl'}
        >
          🔍
        </motion.span>
        <span className="relative z-10">
          {isMobile ? 'Start Scanning' : 'Start Scanning Now'}
        </span>
      </Link>
    </motion.div>
  ), [isMobile, isTablet, reducedMotion]);
  
  // Slider Component
  const FeatureSlider = useMemo(() => (
    <AntigravitySlider 
      items={FEATURES_DATA.slice(0, 3)}
      isMobile={isMobile}
    />
  ), [isMobile]);
  
  return (
    <div 
      ref={containerRef}
      onClick={!reducedMotion ? handleInteraction : undefined}
      onTouchStart={!reducedMotion ? handleInteraction : undefined}
      onTouchMove={handleMove}
      onMouseMove={!isMobile ? handleMove : undefined}
      className="relative min-h-screen w-full flex flex-col bg-gradient-to-b from-white via-green-50/80 to-emerald-50/60 cursor-default"
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      <ScrollProgress scrollYProgress={scrollYProgress} />
      
      {BackgroundAnimation}
      
      {!reducedMotion && (
        <>
          {RippleEffects}
          {TouchTrail}
        </>
      )}
      
      <div 
        ref={contentRef}
        className="relative z-10 flex-grow w-full overflow-y-auto scroll-smooth"
        style={{
          WebkitOverflowScrolling: 'touch'
        }}
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
            ease: PREMIUM_EASING.easeOutExpo
          }}
          className="text-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 xl:px-12 w-full max-w-full relative"
        >
          {/* Premium Hero Section */}
          <motion.section
            style={{ 
              y: heroYSpring,
              rotateY: rotateYSpring,
              rotateX: rotateXSpring,
              x: parallaxXSpring,
              y: parallaxYMouseSpring
            }}
            className="max-w-7xl mx-auto mb-16 sm:mb-24 relative w-full"
          >
            <PremiumHoverEffect isMobile={isMobile}>
              <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16 w-full">
                {HeroLottie}

                <motion.div
                  className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8 min-w-0"
                >
                  {HeroTitle}
                  
                  <motion.div
                    animate={reducedMotion ? {} : { 
                      opacity: [0.9, 1, 0.9]
                    }}
                    transition={reducedMotion ? {} : { 
                      duration: 6, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`text-gray-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed ${
                      isMobile ? 'text-base sm:text-lg' : 
                      isTablet ? 'text-lg' : 
                      'text-xl'
                    }`}
                    style={TYPOGRAPHY_CONFIG.body}
                  >
                    <TypingAnimation 
                      text="PureScan helps you scan food product barcodes and understand their nutritional value and health impact — instantly." 
                      speed={30} 
                      variant="body"
                    />
                    <Typography variant="body" className={`block mt-2 text-green-600 font-semibold ${isMobile ? 'text-sm' : ''}`}>
                      <TypingAnimation 
                        text="Your health companion in every scan." 
                        speed={40} 
                        delay={2000}
                        variant="accent"
                      />
                    </Typography>
                  </motion.div>
                  
                  {PrimaryCTA}
                  
                  {isMobile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.5,
                        duration: 0.5
                      }}
                      className="mt-4"
                    >
                      <Link
                        to="/how-it-works"
                        className="text-green-600 font-medium text-sm flex items-center justify-center gap-1"
                        style={TYPOGRAPHY_CONFIG.accent}
                      >
                        <TypingAnimation text="Learn how it works" speed={30} variant="accent" />
                        <motion.span
                          animate={reducedMotion ? {} : { x: [0, 3, 0] }}
                          transition={reducedMotion ? {} : { 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          →
                        </motion.span>
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </PremiumHoverEffect>
          </motion.section>

          {/* Feature Slider */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ 
              once: true,
              rootMargin: '100px',
              threshold: 0.1
            }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-16 sm:mb-24 w-full"
          >
            <Typography variant="subheading" className="text-center mb-8 text-green-800 w-full font-bold">
              <TypingAnimation text="Featured Capabilities" speed={40} variant="subheading" />
            </Typography>
            {FeatureSlider}
          </motion.div>

          {/* Premium Features Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ 
              once: true,
              amount: isMobile ? 0.1 : 0.2,
              margin: "100px"
            }}
            variants={{ 
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { 
                  staggerChildren: isMobile ? 0.08 : 0.12,
                  delayChildren: 0.2
                }
              }
            }}
            className={`grid ${
              isMobile ? 'grid-cols-1 gap-6' : 
              isTablet ? 'grid-cols-2 gap-8' : 
              'grid-cols-3 gap-10 lg:gap-12'
            } max-w-7xl mx-auto mb-16 sm:mb-24 lg:mb-32 w-full`}
          >
            {FEATURES_DATA.slice(0, isMobile ? 3 : FEATURES_DATA.length).map((item, idx) => (
              <FeatureCard
                key={idx}
                title={item.title}
                description={item.description}
                icon={item.icon}
                index={idx}
                isMobile={isMobile}
                isTablet={isTablet}
                reducedMotion={reducedMotion}
              />
            ))}
          </motion.div>

          {/* Premium Stats Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ 
              once: true, 
              margin: "100px",
              threshold: 0.1
            }}
            transition={{ 
              duration: 0.6,
              ease: PREMIUM_EASING.easeOutExpo
            }}
            className="max-w-4xl mx-auto mb-16 sm:mb-24 w-full"
          >
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ 
                once: true,
                threshold: 0.1
              }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="subheading" className="text-center mb-8 text-green-800 w-full font-bold">
                <TypingAnimation text="Trusted by Health-Conscious Users" speed={40} variant="subheading" />
              </Typography>
            </motion.div>
            
            <div className={`grid ${
              isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-8'
            } text-center w-full`}>
              {STATS_DATA.map((stat, idx) => (
                <StatCard
                  key={idx}
                  value={stat.value}
                  label={stat.label}
                  color={stat.color}
                  index={idx}
                  isMobile={isMobile}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </motion.div>

          {/* Premium Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ 
              once: true, 
              margin: "100px",
              threshold: 0.1
            }}
            transition={{ 
              duration: 0.8,
              ease: PREMIUM_EASING.easeOutExpo
            }}
            className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto rounded-3xl overflow-hidden mb-20 w-full"
          >
            <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 opacity-20">
              <div className="absolute inset-[2px] rounded-3xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20" />
            </div>
            
            <div className="relative z-10 text-center px-4">
              <motion.h2
                className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'} mb-4`}
                style={TYPOGRAPHY_CONFIG.subheading}
                animate={reducedMotion ? {} : {
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={reducedMotion ? {} : {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <TypingAnimation 
                  text="Ready to Transform Your Health?" 
                  speed={50} 
                  variant="subheading"
                />
              </motion.h2>
              
              <motion.div
                className={`text-gray-600 mb-8 ${
                  isMobile ? 'text-sm' : 'text-lg'
                } max-w-2xl mx-auto`}
                style={TYPOGRAPHY_CONFIG.body}
                animate={reducedMotion ? {} : { opacity: [0.9, 1, 0.9] }}
                transition={reducedMotion ? {} : { duration: 4, repeat: Infinity }}
              >
                <TypingAnimation 
                  text="Join thousands who've made smarter choices with PureScan." 
                  speed={40} 
                  variant="body"
                />
              </motion.div>
              
              <motion.div
                whileHover={!isMobile && !reducedMotion ? { 
                  scale: 1.05,
                  transition: { 
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }
                } : undefined}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
                className="inline-block"
              >
                <Link
                  to="/select-scan"
                  className={`group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:shadow-3xl transition-all duration-300 overflow-hidden ${
                    isMobile ? 'px-6 py-3 text-base shadow-lg' : 'px-8 py-4 text-lg shadow-2xl'
                  }`}
                  onClick={() => performance.mark('finalCtaClicked')}
                  style={TYPOGRAPHY_CONFIG.button}
                >
                  <motion.span
                    animate={reducedMotion ? {} : { rotate: [0, 360] }}
                    transition={reducedMotion ? {} : { 
                      duration: 20, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                    className={isMobile ? 'text-xl' : 'text-2xl'}
                  >
                    ✨
                  </motion.span>
                  <span className="relative z-10">
                    <TypingAnimation text="Start Your Journey Today" speed={30} variant="accent" />
                  </span>
                  <motion.span
                    animate={reducedMotion ? {} : { rotate: [0, 360] }}
                    transition={reducedMotion ? {} : { 
                      duration: 20, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                    className={isMobile ? 'text-xl' : 'text-2xl'}
                  >
                    ✨
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Modal for Video/Detailed View */}
      <AnimatedModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <Typography variant="subheading" className="text-green-800 mb-4 font-bold">
            PureScan Demo
          </Typography>
          <Typography variant="body" className="text-gray-600 mb-6">
            Experience how PureScan transforms your health journey.
          </Typography>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
            <div className="aspect-video bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white text-6xl"
              >
                ▶
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
}