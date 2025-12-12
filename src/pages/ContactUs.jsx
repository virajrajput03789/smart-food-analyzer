import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  motion, 
  useMotionValue, 
  animate, 
  useTransform,
  useSpring,
  AnimatePresence,
  useScroll,
  useTransform as useScrollTransform
} from 'framer-motion';
import Particles from 'react-tsparticles';
import emailjs from '@emailjs/browser';

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

// Interactive Background
const InteractiveBackground = ({ isMobile }) => {
  const [interactions, setInteractions] = useState([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && interactions.length < (isMobile ? 4 : 8)) {
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
    }, isMobile ? 1200 : 800);
    
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

const ContactUs = () => {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const [hoverGlow, setHoverGlow] = useState({ x: 0, y: 0, active: false });
  const [floatingIcons, setFloatingIcons] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // EmailJS state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

// In ContactUs.jsx - Add at top after imports
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const YOUR_EMAIL = import.meta.env.VITE_YOUR_EMAIL;

// Add validation useEffect
useEffect(() => {
  // Debug: Check if environment variables are loading
  console.log('Environment check:', {
    mode: import.meta.env.MODE,
    firebaseKeyExists: !!import.meta.env.VITE_FIREBASE_API_KEY,
    emailjsServiceExists: !!import.meta.env.VITE_EMAILJS_SERVICE_ID,
    emailjsTemplateExists: !!import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    emailjsPublicKeyExists: !!import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  });

  if (!import.meta.env.VITE_EMAILJS_SERVICE_ID || 
      !import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 
      !import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
    console.error('❌ EmailJS environment variables are missing!');
    console.error('Please check your .env file');
  }
  
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.error('❌ Firebase environment variables are missing!');
  }
}, []);

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

  // Enhanced mouse/touch tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const orb1X = useMotionValue(0);
  const orb1Y = useMotionValue(0);
  const orb2X = useMotionValue(0);
  const orb2Y = useMotionValue(0);

  // Scroll animations
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start start", "end end"] 
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -40 : -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, isMobile ? 0.9 : 0.85]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, isMobile ? 0.98 : 0.96]);

  const heroYSpring = useSpring(heroY, { 
    stiffness: isMobile ? 140 : 160, 
    damping: isMobile ? 35 : 30 
  });
  const heroScaleSpring = useSpring(heroScale, { 
    stiffness: isMobile ? 180 : 200, 
    damping: isMobile ? 40 : 35 
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 60 : 100]);
  const orbYSpring = useSpring(orbY, { 
    stiffness: isMobile ? 120 : 140, 
    damping: isMobile ? 30 : 25 
  });

  // Enhanced click/touch handler
  const handleInteraction = useCallback((e) => {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'SELECT' ||
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

    // Main ripple
    const newRipple = {
      id: Date.now(),
      x,
      y,
      color,
      type: 'ripple',
      isMobile
    };

    // Secondary sparkles
    const sparkleCount = isMobile ? 1 : 2;
    for (let i = 0; i < sparkleCount; i++) {
      setTimeout(() => {
        const sparkle = {
          id: Date.now() + i,
          x: x + (Math.random() * (isMobile ? 30 : 40) - (isMobile ? 15 : 20)),
          y: y + (Math.random() * (isMobile ? 30 : 40) - (isMobile ? 15 : 20)),
          color: colors[Math.floor(Math.random() * colors.length)],
          type: 'sparkle',
          isMobile
        };
        setRipples(prev => [...prev, sparkle]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== sparkle.id));
        }, isMobile ? 300 : 500);
      }, i * (isMobile ? 100 : 80));
    }

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, isMobile ? 800 : 1000);
  }, [isMobile]);

  // Enhanced hover/touch move handler
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

    // Create occasional floating icons on hover
    if (!isMobile && Math.random() > 0.97 && floatingIcons.length < 4) {
      const icons = ['📧', '💬', '📱', '💭', '✉️', '📝', '🔔', '💚'];
      const colors = ['#10B981', '#34D399', '#22C55E'];
      setFloatingIcons(prev => [...prev, {
        id: Date.now(),
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        x: x,
        y: y
      }]);
    }
  }, [isMobile, floatingIcons.length]);

  // Enhanced mouse effects (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const onMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      
      mouseX.set(nx);
      mouseY.set(ny);
      
      // Enhanced orb movement
      tiltY.set(nx * 8);
      tiltX.set(ny * 6);
      orb1X.set(nx * -30);
      orb1Y.set(ny * -20);
      orb2X.set(nx * 22);
      orb2Y.set(ny * 16);
    };

    const onLeave = () => {
      [mouseX, mouseY, tiltX, tiltY, orb1X, orb1Y, orb2X, orb2Y].forEach(mv =>
        animate(mv, 0, { type: "spring", stiffness: 90, damping: 15 })
      );
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
  }, [isMobile, mouseX, mouseY, tiltX, tiltY, orb1X, orb1Y, orb2X, orb2Y]);

  // 3D rotation (desktop only)
  const rotateY = useTransform(tiltY, [-0.5, 0.5], isMobile ? [0, 0] : [-10, 10]);
  const rotateX = useTransform(tiltX, [-0.5, 0.5], isMobile ? [0, 0] : [6, -6]);
  const rotateYSpring = useSpring(rotateY, { stiffness: 250, damping: 28 });
  const rotateXSpring = useSpring(rotateX, { stiffness: 250, damping: 28 });

  const orbYSpring1 = useTransform(orb1Y, [-0.5, 0.5], [-20, 20]);
  const orbYSpring2 = useTransform(orb2Y, [-0.5, 0.5], [-18, 18]);

  // Mobile-optimized Particle Background
  const particleOptions = {
    particles: {
      number: { 
        value: isMobile ? 40 : 50, 
        density: { 
          enable: true, 
          value_area: isMobile ? 500 : 600 
        } 
      },
      color: { value: ["#22c55e", "#10b981", "#34d399", "#a7f3d0"] },
      shape: { type: "circle" },
      opacity: { 
        value: isMobile ? 0.12 : 0.15, 
        random: true, 
        animation: { 
          enable: true, 
          speed: 1, 
          minimumValue: 0.1 
        } 
      },
      size: { 
        value: isMobile ? 2.5 : 3, 
        random: true, 
        animation: { 
          enable: true, 
          speed: 2, 
          minimumValue: 1 
        } 
      },
      move: {
        enable: true,
        speed: isMobile ? 0.25 : 0.3,
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

  // Form handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear any existing error when user starts typing
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous states
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Send email using EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_email: YOUR_EMAIL,
        reply_to: formData.email,
        date: new Date().toLocaleString(),
        app_name: 'PureScan',
        subject: `New Contact Message from ${formData.name}`
      };

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully:', result);
      
      // Success
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Email sending failed:', error);
      setSubmitError('Failed to send message. Please try again later or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show toast for error/success
  useEffect(() => {
    if (submitSuccess || submitError) {
      setToastVisible(true);
      const timer = setTimeout(() => {
        setToastVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, submitError]);

  return (
    <div 
      ref={containerRef}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchMove={handleMove}
      onMouseMove={!isMobile ? handleMove : undefined}
      onMouseLeave={() => !isMobile && setHoverGlow(prev => ({ ...prev, active: false }))}
      onTouchEnd={() => isMobile && setHoverGlow(prev => ({ ...prev, active: false }))}
      className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-green-50/80 to-emerald-50/60 overflow-hidden font-sans cursor-default"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'pan-y'
      }}
    >
      {/* Toast Notifications */}
      <AnimatePresence>
        {toastVisible && (
          <div className="fixed top-6 right-6 z-50 space-y-3">
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl"
                >
                  ✨
                </motion.div>
                <div>
                  <p className="font-semibold">Message Sent!</p>
                  <p className="text-sm opacity-90">We'll get back to you soon.</p>
                </div>
              </motion.div>
            )}
            
            {submitError && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 backdrop-blur-sm"
              >
                <div className="text-2xl">⚠️</div>
                <div>
                  <p className="font-semibold">Oops!</p>
                  <p className="text-sm opacity-90">{submitError}</p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Background Layer */}
      <InteractiveBackground isMobile={isMobile} />
      
      {/* Enhanced Particle Background */}
      <Particles
        className="absolute inset-0 -z-10"
        options={particleOptions}
      />

      {/* Enhanced Ripple Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        <AnimatePresence>
          {ripples.map(ripple => (
            ripple.type === 'ripple' ? (
              <motion.div
                key={ripple.id}
                className="absolute pointer-events-none rounded-full"
                initial={{
                  scale: 0,
                  opacity: 0.7,
                  x: ripple.x - (ripple.isMobile ? 12 : 16),
                  y: ripple.y - (ripple.isMobile ? 12 : 16),
                  width: ripple.isMobile ? 24 : 32,
                  height: ripple.isMobile ? 24 : 32,
                  background: `radial-gradient(circle, ${ripple.color}, ${ripple.color.replace('0.6', '0.2')})`
                }}
                animate={{
                  scale: [0, ripple.isMobile ? 2.5 : 3, ripple.isMobile ? 3 : 3.5],
                  opacity: [0.7, 0.3, 0],
                  width: [
                    ripple.isMobile ? 24 : 32, 
                    ripple.isMobile ? 96 : 128, 
                    ripple.isMobile ? 112 : 160
                  ],
                  height: [
                    ripple.isMobile ? 24 : 32, 
                    ripple.isMobile ? 96 : 128, 
                    ripple.isMobile ? 112 : 160
                  ],
                  x: [
                    ripple.x - (ripple.isMobile ? 12 : 16), 
                    ripple.x - (ripple.isMobile ? 48 : 64), 
                    ripple.x - (ripple.isMobile ? 56 : 80)
                  ],
                  y: [
                    ripple.y - (ripple.isMobile ? 12 : 16), 
                    ripple.y - (ripple.isMobile ? 48 : 64), 
                    ripple.y - (ripple.isMobile ? 56 : 80)
                  ]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: ripple.isMobile ? 0.8 : 1,
                  ease: "easeOut"
                }}
                style={{
                  filter: `blur(${ripple.isMobile ? 6 : 8}px)`,
                  mixBlendMode: "screen"
                }}
              />
            ) : (
              <motion.div
                key={ripple.id}
                className="absolute pointer-events-none"
                initial={{
                  x: ripple.x - (ripple.isMobile ? 6 : 8),
                  y: ripple.y - (ripple.isMobile ? 6 : 8),
                  scale: 0,
                  opacity: 0,
                  rotate: 0
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180],
                  y: [ripple.y - (ripple.isMobile ? 6 : 8), ripple.y - (ripple.isMobile ? 24 : 32)]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: ripple.isMobile ? 0.5 : 0.7 }}
                style={{
                  width: ripple.isMobile ? '12px' : '16px',
                  height: ripple.isMobile ? '12px' : '16px',
                  background: `radial-gradient(circle, ${ripple.color}, transparent 70%)`,
                  borderRadius: '50%'
                }}
              />
            )
          ))}
        </AnimatePresence>

        {/* Enhanced Hover Glow (Desktop only) */}
        {!isMobile && (
          <motion.div
            className="absolute pointer-events-none rounded-full"
            animate={{
              scale: hoverGlow.active ? 1 : 0,
              opacity: hoverGlow.active ? 0.3 : 0,
              x: hoverGlow.x - 60,
              y: hoverGlow.y - 60
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25
            }}
            style={{
              width: 120,
              height: 120,
              background: "radial-gradient(circle, rgba(34,197,94,0.4), rgba(16,185,129,0.15), transparent 70%)",
              filter: "blur(16px)"
            }}
          />
        )}

        {/* Touch/Mouse Trail Effect */}
        <motion.div
          className="absolute pointer-events-none rounded-full"
          animate={{
            x: touchPosition.x - (isMobile ? 5 : 6),
            y: touchPosition.y - (isMobile ? 5 : 6)
          }}
          transition={{
            type: "spring",
            stiffness: isMobile ? 600 : 500,
            damping: isMobile ? 35 : 30
          }}
          style={{
            width: isMobile ? 10 : 12,
            height: isMobile ? 10 : 12,
            background: "radial-gradient(circle, rgba(34,197,94,0.2), rgba(16,185,129,0.05))",
            border: `2px solid rgba(34,197,94,${isMobile ? 0.15 : 0.25})`,
            filter: 'blur(1px)'
          }}
        />
      </div>

      {/* Floating Icons (Desktop only) */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <AnimatePresence>
            {floatingIcons.map(icon => (
              <motion.div
                key={icon.id}
                className="absolute pointer-events-none text-xl"
                initial={{
                  x: icon.x,
                  y: icon.y,
                  scale: 0,
                  opacity: 0,
                  rotate: 0
                }}
                animate={{
                  scale: [0, 1, 1, 0],
                  opacity: [0, 1, 1, 0],
                  y: [icon.y, icon.y - 120],
                  rotate: [0, 360]
                }}
                exit={{ opacity: 0 }}
                onAnimationComplete={() => {
                  setFloatingIcons(prev => prev.filter(i => i.id !== icon.id));
                }}
                transition={{ duration: 2.5 }}
                style={{
                  color: icon.color,
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
                }}
              >
                {icon.icon}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Enhanced Background Orbs with Parallax */}
      {!isMobile && (
        <>
          <motion.div
            style={{ y: orbYSpring, x: orb1X }}
            className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.18,
              scale: [1, 1.12, 1],
              rotate: [0, 4, 0]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-300 via-emerald-300 to-teal-200 blur-[120px]" />
          </motion.div>

          <motion.div
            style={{ y: orb2Y, x: orb2X }}
            className="absolute -right-30 -bottom-30 w-[28rem] h-[28rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.18,
              scale: [1, 1.1, 1],
              rotate: [0, -4, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 via-emerald-200 to-green-300 blur-[110px]" />
          </motion.div>
        </>
      )}

      {/* Mobile-optimized Background Orbs */}
      {isMobile && (
        <>
          <motion.div
            style={{ y: orbYSpring }}
            className="absolute -top-30 -left-30 w-[25rem] h-[25rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.12,
              scale: [1, 1.08, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-200 via-emerald-200 to-teal-100 blur-[80px]" />
          </motion.div>

          <motion.div
            style={{ y: orbYSpring }}
            className="absolute -right-15 -bottom-15 w-[20rem] h-[20rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.12,
              scale: [1, 1.06, 1]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-100 via-emerald-100 to-green-200 blur-[80px]" />
          </motion.div>
        </>
      )}

      {/* Main Content */}
      <motion.div
        style={{ 
          scale: heroScaleSpring,
          opacity: heroOpacity
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-12 py-8 sm:py-12"
      >
        {/* Main 3D Card */}
        <motion.main
          style={{ 
            y: heroYSpring, 
            opacity: heroOpacity,
            rotateY: rotateYSpring, 
            rotateX: rotateXSpring 
          }}
          whileHover={!isMobile ? { 
            scale: 1.018,
            boxShadow: "0 20px 70px rgba(16,185,129,0.35)" 
          } : {}}
          transition={{ type: "spring", stiffness: 130, damping: 18 }}
          className={`
            bg-white/90 backdrop-blur-xl rounded-3xl shadow-3xl max-w-3xl mx-auto w-full z-10 
            text-gray-800 border border-white/30 relative overflow-hidden
            ${isMobile ? 'mt-8 p-6 space-y-6' : 'mt-12 p-8 sm:p-10 space-y-8'}
          `}
        >
          {/* Header with Mobile Optimization - FIXED TEXT VISIBILITY */}
          <motion.div whileHover={{ scale: 1.02 }} className="text-center space-y-2">
            <motion.h1
              whileHover={!isMobile ? { 
                scale: 1.08, 
                textShadow: "0px 0px 20px rgba(34,197,94,0.85)" 
              } : {}}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
              className={`
                font-extrabold tracking-wide
                ${isMobile ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'}
              `}
              style={{
                background: 'linear-gradient(90deg, #059669, #10B981, #34D399, #10B981, #059669)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Contact Us
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={!isMobile ? { scaleX: 1.1 } : {}}
              className={`h-1 bg-gradient-to-r from-green-500 to-teal-400 rounded origin-left mx-auto ${
                isMobile ? 'w-24' : 'w-28'
              }`}
            />
          </motion.div>

          {/* Content & Form */}
          <motion.div className="space-y-6">
            <motion.p
              whileHover={!isMobile ? { 
                scale: 1.03, 
                color: "#065f46", 
                x: 2 
              } : {}}
              transition={{ type: "spring", stiffness: 220 }}
              className={`
                text-center text-gray-700 font-medium cursor-default
                ${isMobile ? 'text-sm sm:text-base' : 'text-base'}
              `}
            >
              Have questions, feedback, or partnership ideas? We'd love to hear from you. 
              Fill out the form below or reach us directly.
            </motion.p>

            <motion.form 
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {['name', 'email', 'message'].map((field) => (
                <motion.div
                  key={field}
                  whileHover={!isMobile ? { scale: 1.02 } : {}}
                  transition={{ type: "spring", stiffness: 250 }}
                >
                  <motion.label
                    htmlFor={field}
                    whileHover={!isMobile ? { 
                      scale: 1.05, 
                      color: "#16a34a", 
                      x: 2 
                    } : {}}
                    className={`
                      block font-semibold text-gray-700 mb-1
                      ${isMobile ? 'text-xs sm:text-sm' : 'text-sm'}
                    `}
                  >
                    {field === 'name' && 'Name'}
                    {field === 'email' && 'Email'}
                    {field === 'message' && 'Message'}
                  </motion.label>
                  {field === 'message' ? (
                    <motion.textarea
                      id="message"
                      rows={isMobile ? "4" : "5"}
                      value={formData.message}
                      onChange={handleInputChange}
                      whileFocus={!isMobile ? { 
                        scale: 1.02, 
                        boxShadow: "0 0 12px rgba(34,197,94,0.3)" 
                      } : {}}
                      className={`
                        w-full border ${submitError && !formData[field].trim() ? 'border-red-300' : 'border-gray-300'} 
                        rounded-md px-4 py-2 
                        focus:outline-none focus:ring-2 focus:ring-green-500 
                        focus:ring-offset-1 shadow-sm resize-none bg-white/90
                        ${isMobile ? 'text-sm' : ''}
                      `}
                      placeholder="Write your message here..."
                      required
                    />
                  ) : (
                    <motion.input
                      type={field === 'email' ? 'email' : 'text'}
                      id={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      whileFocus={!isMobile ? { 
                        scale: 1.02, 
                        boxShadow: "0 0 12px rgba(34,197,94,0.3)" 
                      } : {}}
                      className={`
                        w-full border ${submitError && !formData[field].trim() ? 'border-red-300' : 'border-gray-300'} 
                        rounded-md px-4 py-2 
                        focus:outline-none focus:ring-2 focus:ring-green-500 
                        focus:ring-offset-1 shadow-sm bg-white/90
                        ${isMobile ? 'text-sm' : ''}
                      `}
                      placeholder={field === 'name' ? 'Your name' : 'you@example.com'}
                      required
                    />
                  )}
                </motion.div>
              ))}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={!isMobile && !isSubmitting ? { 
                  scale: 1.07, 
                  boxShadow: "0px 6px 18px rgba(0,0,0,0.25)" 
                } : {}}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`
                  bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold
                  rounded-md hover:shadow-lg transition-all shadow-md relative overflow-hidden
                  ${isMobile ? 'w-full px-4 py-3 text-sm' : 'px-6 py-3'}
                  ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : 'Send Message'}
                
                {/* Button Glow Effect */}
                {!isSubmitting && (
                  <motion.div
                    className="absolute inset-0 rounded-md"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.05, 1]
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
            </motion.form>

            <motion.div 
              whileHover={!isMobile ? { scale: 1.03 } : {}} 
              className="text-center text-gray-500 mt-4"
            >
              <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                Or email us directly at{' '}
                <motion.a
                  href="mailto:support@purescan.com"
                  whileHover={!isMobile ? { 
                    color: "#16a34a", 
                    textDecoration: "underline", 
                    scale: 1.05 
                  } : {}}
                  transition={{ type: "spring", stiffness: 250 }}
                  className="text-green-600 hover:underline cursor-pointer font-medium"
                >
                  purescan.helpdesk@gmail.com
                </motion.a>
              </p>
            </motion.div>
          </motion.div>
        </motion.main>

        {/* Additional Contact Info (Mobile Optimized) */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mt-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-100/50"
          >
            <h3 className="text-lg font-semibold text-green-700 mb-4 text-center">
              Get in Touch
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '📧', label: 'Email', value: 'purescan.support@gmail.com' },
                { icon: '🌐', label: 'Website', value: 'purescan.com' },
                { icon: '📍', label: 'Location', value: 'Remote Worldwide' },
                { icon: '⏰', label: 'Response', value: '24-48 hours' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white/90 rounded-xl p-3 text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-xs font-medium text-green-700 mb-1">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ContactUs;