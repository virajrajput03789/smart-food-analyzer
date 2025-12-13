import React, { useState, useEffect, useRef, useCallback} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './FireBase';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
  AnimatePresence
} from 'framer-motion';
import Particles from 'react-tsparticles';

const originalConsole = { ...console };

// Ignore only COOP warnings
console.warn = (msg, ...args) => {
  if (!msg.includes('Cross-Origin-Opener-Policy')) {
    originalConsole.warn(msg, ...args);
  }
};

// Optimized Micro Interaction Component
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
          width: isMobile ? '16px' : '20px',
          height: isMobile ? '16px' : '20px',
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
        initial={{ x: x - (isMobile ? 10 : 15), y: y - (isMobile ? 10 : 15), scale: 0, opacity: 0.7 }}
        animate={{
          scale: [0, 1.5],
          opacity: [0.7, 0]
        }}
        transition={{ duration: isMobile ? 0.6 : 0.8 }}
        style={{
          width: isMobile ? '24px' : '30px',
          height: isMobile ? '24px' : '30px',
          background: color,
          filter: 'blur(4px)'
        }}
      />
    );
  }
  
  return null;
};

// Optimized Interactive Background
const InteractiveBackground = React.memo(({ isMobile }) => {
  const [interactions, setInteractions] = useState([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && interactions.length < (isMobile ? 4 : 8)) {
        const type = Math.random() > 0.5 ? 'sparkle' : 'pulse';
        const colors = ['#10B981', '#34D399', '#22C55E', '#059669'];
        setInteractions(prev => [...prev.slice(-(isMobile ? 3 : 5)), {
          id: Date.now(),
          type,
          x: Math.random() * 100 + '%',
          y: Math.random() * 100 + '%',
          color: colors[Math.floor(Math.random() * colors.length)]
        }]);
      }
    }, isMobile ? 1200 : 800);
    
    return () => clearInterval(interval);
  }, [interactions.length, isMobile]);
  
  // Cleanup old interactions
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setInteractions(prev => prev.filter(int => Date.now() - int.id < 2000));
    }, 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {interactions.map(interaction => (
          <MicroInteraction key={interaction.id} {...interaction} isMobile={isMobile} />
        ))}
      </AnimatePresence>
    </div>
  );
});

// Optimized Floating Icon Component
const FloatingIcon = React.memo(({ icon, color, initialX, initialY, delay, isMobile }) => (
  <motion.div
    className="absolute pointer-events-none"
    initial={{ x: initialX, y: initialY, scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1, 1, 0],
      opacity: [0, 1, 1, 0],
      y: [initialY, initialY - (isMobile ? 60 : 100)],
      rotate: [0, 360]
    }}
    transition={{
      duration: isMobile ? 3 : 4,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 10 + 5
    }}
    style={{
      color,
      fontSize: isMobile ? '18px' : '24px',
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
    }}
  >
    {icon}
  </motion.div>
));

// Optimized Ripple Component
const RippleEffect = React.memo(({ ripple }) => (
  <motion.div
    className="absolute pointer-events-none rounded-full"
    initial={{
      scale: 0,
      opacity: 0.7,
      x: ripple.x - (ripple.isMobile ? 15 : 20),
      y: ripple.y - (ripple.isMobile ? 15 : 20),
      width: ripple.isMobile ? 30 : 40,
      height: ripple.isMobile ? 30 : 40,
      background: `radial-gradient(circle, ${ripple.color}, ${ripple.color.replace('0.6', '0.2')})`
    }}
    animate={{
      scale: [0, ripple.isMobile ? 3 : 4, ripple.isMobile ? 3.5 : 5],
      opacity: [0.7, 0.3, 0],
      width: [
        ripple.isMobile ? 30 : 40, 
        ripple.isMobile ? 120 : 160, 
        ripple.isMobile ? 140 : 200
      ],
      height: [
        ripple.isMobile ? 30 : 40, 
        ripple.isMobile ? 120 : 160, 
        ripple.isMobile ? 140 : 200
      ],
      x: [
        ripple.x - (ripple.isMobile ? 15 : 20), 
        ripple.x - (ripple.isMobile ? 60 : 80), 
        ripple.x - (ripple.isMobile ? 70 : 100)
      ],
      y: [
        ripple.y - (ripple.isMobile ? 15 : 20), 
        ripple.y - (ripple.isMobile ? 60 : 80), 
        ripple.y - (ripple.isMobile ? 70 : 100)
      ]
    }}
    exit={{ opacity: 0 }}
    transition={{
      duration: ripple.isMobile ? 0.9 : 1.2,
      ease: "easeOut"
    }}
    style={{
      filter: `blur(${ripple.isMobile ? 8 : 12}px)`,
      mixBlendMode: "screen"
    }}
  />
));

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ripples, setRipples] = useState([]);
  const [hoverGlow, setHoverGlow] = useState({ x: 0, y: 0, active: false });
  const [isMobile, setIsMobile] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Optimized mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    // Throttle resize events
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Optimized mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);

  // Optimized scroll animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, isMobile ? 0.98 : 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, isMobile ? 0.9 : 0.8]);
  
  const heroScaleSpring = useSpring(heroScale, { 
    stiffness: isMobile ? 180 : 200, 
    damping: isMobile ? 40 : 35 
  });

  // Optimized ripple effect handler
  const handleInteraction = useCallback((e) => {
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

    setRipples(prev => [...prev.slice(-5), newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, isMobile ? 900 : 1200);
  }, [isMobile]);

  // Optimized move handler
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
    
    if (!isMobile) {
      setHoverGlow({ x, y, active: true });
    }
  }, [isMobile]);

  // Optimized mouse effects for desktop
  useEffect(() => {
    if (isMobile) return;

    const onMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      
      mouseX.set(nx);
      mouseY.set(ny);
      
      cardX.set(nx * 15);
      cardY.set(ny * 10);
    };

    const onLeave = () => {
      animate(mouseX, 0, { type: "spring", stiffness: 100, damping: 15 });
      animate(mouseY, 0, { type: "spring", stiffness: 100, damping: 15 });
      animate(cardX, 0, { type: "spring", stiffness: 90, damping: 15 });
      animate(cardY, 0, { type: "spring", stiffness: 90, damping: 15 });
      setHoverGlow(prev => ({ ...prev, active: false }));
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", onLeave);
    }
    
    return () => {
      if (node) {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [isMobile, mouseX, mouseY, cardX, cardY]);

  // Optimized 3D rotation for card
  const rotateY = useTransform(mouseX, [-0.5, 0.5], isMobile ? [0, 0] : [2, -2]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], isMobile ? [0, 0] : [-1.5, 1.5]);
  const rotateYSpring = useSpring(rotateY, { stiffness: 200, damping: 25 });
  const rotateXSpring = useSpring(rotateX, { stiffness: 200, damping: 25 });

  // Optimized Particle options
  const particleOptions = React.useMemo(() => ({
    particles: {
      number: { 
        value: isMobile ? 40 : 60, 
        density: { 
          enable: true, 
          value_area: isMobile ? 500 : 700 
        } 
      },
      color: { value: ["#22c55e", "#10b981", "#34d399", "#059669"] },
      shape: { type: "circle" },
      opacity: { 
        value: isMobile ? 0.12 : 0.15, 
        random: true,
      },
      size: { 
        value: isMobile ? 2 : 2.5, 
        random: true,
      },
      move: {
        enable: true,
        speed: isMobile ? 0.3 : 0.4,
        direction: "none",
        random: true,
        straight: false,
        outMode: "bounce",
      }
    },
    interactivity: {
      events: {
        onhover: { enable: !isMobile, mode: "repulse" },
        onclick: { enable: true, mode: "push" }
      }
    },
    detectRetina: true
  }), [isMobile]);

  // Cleanup ripples
  useEffect(() => {
    const interval = setInterval(() => {
      setRipples(prev => prev.filter(r => Date.now() - r.id < 1500));
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/select-scan", { replace: true });
    } catch (error) {
      alert('Login failed: ' + error.code);
      console.error('Login error:', error.code, error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ loggedIn: true }, "*");
        window.close();
      }

      navigate("/select-scan", { replace: true });
    } catch (error) {
      alert('Google login failed: ' + error.code);
      console.error('Google login error:', error.code, error.message);
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchMove={handleMove}
      onMouseMove={!isMobile ? handleMove : undefined}
      onMouseLeave={() => !isMobile && setHoverGlow(prev => ({ ...prev, active: false }))}
      onTouchEnd={() => isMobile && setHoverGlow(prev => ({ ...prev, active: false }))}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50/80 to-emerald-50/60 overflow-hidden font-sans cursor-default"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-y'
      }}
    >
      {/* Interactive Background Layer */}
      <InteractiveBackground isMobile={isMobile} />
      
      {/* Optimized Particle Background */}
      <Particles
        className="absolute inset-0 -z-10"
        options={particleOptions}
        key={isMobile ? 'mobile' : 'desktop'}
      />

      {/* Ripple Effects Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        <AnimatePresence>
          {ripples.map(ripple => (
            <RippleEffect key={ripple.id} ripple={ripple} />
          ))}
        </AnimatePresence>

        {/* Hover Glow (Desktop only) */}
        {!isMobile && (
          <motion.div
            className="absolute pointer-events-none rounded-full"
            animate={{
              scale: hoverGlow.active ? 1 : 0,
              opacity: hoverGlow.active ? 0.2 : 0,
              x: hoverGlow.x - 60,
              y: hoverGlow.y - 60
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 20
            }}
            style={{
              width: 120,
              height: 120,
              background: "radial-gradient(circle, rgba(34,197,94,0.3), rgba(16,185,129,0.1), transparent 70%)",
              filter: "blur(15px)"
            }}
          />
        )}

        {/* Touch/Mouse Trail Effect */}
        <motion.div
          className="absolute pointer-events-none rounded-full"
          animate={{
            x: touchPosition.x - (isMobile ? 6 : 8),
            y: touchPosition.y - (isMobile ? 6 : 8)
          }}
          transition={{
            type: "spring",
            stiffness: isMobile ? 500 : 400,
            damping: isMobile ? 30 : 25
          }}
          style={{
            width: isMobile ? 12 : 16,
            height: isMobile ? 12 : 16,
            background: "radial-gradient(circle, rgba(34,197,94,0.15), rgba(16,185,129,0.03))",
            border: `1px solid rgba(34,197,94,${isMobile ? 0.15 : 0.2})`,
            filter: 'blur(0.5px)'
          }}
        />
      </div>

      {/* Background Orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isMobile ? 0.08 : 0.12,
          scale: [1, isMobile ? 1.05 : 1.08, 1],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-green-300/40 via-emerald-300/30 to-teal-200/30 blur-[80px]" />
      </motion.div>

      <motion.div
        className="absolute -right-20 -bottom-20 w-[25rem] h-[25rem] rounded-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isMobile ? 0.06 : 0.1,
          scale: [1, isMobile ? 1.03 : 1.05, 1],
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200/30 via-emerald-200/20 to-green-300/20 blur-[60px]" />
      </motion.div>

      {/* Main Content Container */}
      <motion.div
        style={{ 
          scale: heroScaleSpring,
          opacity: heroOpacity
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Login Card */}
        <motion.div
          style={{ 
            rotateY: rotateYSpring,
            rotateX: rotateXSpring,
            x: cardX,
            y: cardY
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          {/* Card Background Glow */}
          <motion.div
            className="absolute -inset-3 -z-10 rounded-3xl"
            animate={{
              opacity: [0.08, 0.15, 0.08],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: "radial-gradient(circle at center, rgba(34,197,94,0.12), transparent 70%)",
              filter: "blur(20px)"
            }}
          />

          {/* Main Card */}
          <div className="relative bg-white/85 backdrop-blur-sm rounded-2xl border border-green-100/50 shadow-xl p-6 sm:p-8">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <motion.h2
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="font-bold text-3xl sm:text-4xl mb-3"
                style={{
                  background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Welcome Back
              </motion.h2>
              
              <motion.p
                animate={{ 
                  opacity: [0.7, 0.9, 0.7],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-gray-600 text-sm sm:text-base"
              >
                Sign in to continue your health journey
              </motion.p>
              
              {/* Underline */}
              <motion.div
                className="h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mt-3"
                initial={{ width: 0 }}
                animate={{ width: "80px" }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </motion.div>

            {/* FORM */}
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <motion.input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  whileFocus={{ 
                    boxShadow: "0px 0px 0px 2px rgba(34,197,94,0.2)",
                    borderColor: "#22C55E"
                  }}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg 
                  focus:outline-none transition-all duration-300
                  hover:border-green-300"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <motion.input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  whileFocus={{ 
                    boxShadow: "0px 0px 0px 2px rgba(34,197,94,0.2)",
                    borderColor: "#22C55E"
                  }}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg 
                  focus:outline-none transition-all duration-300
                  hover:border-green-300"
                />
              </div>

              {/* Login Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0px 6px 20px rgba(5, 150, 105, 0.3)"
                }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md transition-all duration-300"
              >
                Login
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Button */}
            <motion.button
              onClick={handleGoogleLogin}
              whileTap={{ scale: 0.97 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)"
              }}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 rounded-lg font-medium border border-gray-300 shadow-sm transition-all duration-300"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Sign in with Google
            </motion.button>

            {/* Signup Link - FIXED DOM NESTING ERROR */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signin"
                  className="text-green-700 font-semibold hover:text-green-800 inline-flex items-center gap-1 group"
                >
                  <span>Sign up</span>
                  <motion.span
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-green-600"
                  >
                    →
                  </motion.span>
                  {/* Underline effect using span instead of div */}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300" />
                </Link>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <Link to="/terms" className="text-green-600 hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-green-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

         {/* Floating Icons (Desktop only) */}
{!isMobile && (
  <div className="absolute -top-4 -right-4 -bottom-4 -left-4 pointer-events-none">
    {[
      {icon: '🍏', color: '#10B981', x: -30, y: -20},
      {icon: '🥦', color: '#34D399', x: 40, y: -10},
      {icon: '🔒', color: '#22C55E', x: 20, y: 30},
      {icon: '📱', color: '#059669', x: -20, y: 30},
      {icon: '⭐', color: '#7C3AED', x: 30, y: -30}
    ].map((item, idx) => (
      <FloatingIcon
        key={idx}
        icon={item.icon}
        color={item.color}
        initialX={item.x}
        initialY={item.y}
        delay={idx * 0.5}
        isMobile={isMobile}
      />
    ))}
  </div>
)}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;

