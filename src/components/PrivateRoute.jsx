import React, { useEffect, useRef, useState, memo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './FireBase';
import { motion, AnimatePresence } from 'framer-motion';

// Memoized Loading Component with optimized animations
const LoadingSpinner = memo(() => {
  const [progress, setProgress] = useState(0);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const animate = () => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return Math.min(prev + 0.5, 100);
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-emerald-50 z-50 will-change-transform">
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-green-200"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Progress ring */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#10B981"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ 
                strokeDashoffset: 283 - (progress / 100) * 283,
                transition: { duration: 0.1 }
              }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-2xl mb-1"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              🔒
            </motion.div>
            <motion.p 
              className="text-sm text-gray-600 font-medium"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        </div>
        
        {/* Loading dots */}
        <div className="flex justify-center mt-6 space-x-1">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity,
                delay: dot * 0.2 
              }}
            />
          ))}
        </div>
        
        {/* Loading text */}
        <motion.p
          className="mt-4 text-gray-600 text-sm font-medium"
          animate={{ opacity: [0.7, 0.9, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Checking authentication...
        </motion.p>
        
        {/* Background particles */}
        <div className="absolute -inset-8 -z-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ 
                y: [0, -20, 0],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

// Memoized Auth Redirect Handler
const AuthRedirect = memo(({ location }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  
  useEffect(() => {
    // Smooth redirect with slight delay for better UX
    timerRef.current = setTimeout(() => {
      navigate('/login', { 
        replace: true,
        state: { from: location }
      });
    }, 300);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate, location]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white via-red-50 to-rose-50 z-50"
    >
      <div className="text-center p-8">
        <motion.div
          className="text-4xl mb-4"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 0.5 }}
        >
          🔐
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-4">Redirecting to login page...</p>
        <motion.div
          className="h-1 bg-gradient-to-r from-red-400 to-rose-500 rounded-full max-w-xs mx-auto"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
});

AuthRedirect.displayName = 'AuthRedirect';

// Main PrivateRoute Component
const PrivateRoute = memo(({ children }) => {
  const [user, loading, error] = useAuthState(auth);
  const location = useLocation();
  const hasUserRef = useRef(false);
  const loadingTimeoutRef = useRef(null);
  const [showLoading, setShowLoading] = useState(true);
  
  // Optimized loading state with debounce
  useEffect(() => {
    if (loading) {
      setShowLoading(true);
      // Set a minimum loading time for better UX
      loadingTimeoutRef.current = setTimeout(() => {
        setShowLoading(false);
      }, 800);
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      setShowLoading(false);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading]);
  
  // Track user state for optimization
  useEffect(() => {
    if (user) {
      hasUserRef.current = true;
    }
  }, [user]);
  
  // Handle authentication error
  useEffect(() => {
    if (error) {
      console.error('Authentication error:', error);
      // Optional: Send error to analytics
    }
  }, [error]);
  
  // Show loading spinner with smooth transitions
  if (showLoading) {
    return <LoadingSpinner />;
  }
  
  // Handle authentication errors
  if (error) {
    return (
      <AnimatePresence mode="wait">
        <AuthRedirect location={location} />
      </AnimatePresence>
    );
  }
  
  // Check if user is authenticated
  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <AuthRedirect location={location} />
      </AnimatePresence>
    );
  }
  
  // User is authenticated - render children with smooth transition
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="authenticated-content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
});

PrivateRoute.displayName = 'PrivateRoute';

// Export with performance monitoring wrapper
export default (() => {
  const MemoizedPrivateRoute = memo(PrivateRoute);
  
  // Add performance monitoring in development
  if (process.env.NODE_ENV === 'development') {
    return function PerformanceMonitoredPrivateRoute(props) {
      const startTime = useRef(performance.now());
      
      useEffect(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime.current;
        
        if (renderTime > 16) { // > 60fps threshold
          console.warn(`PrivateRoute render took ${renderTime.toFixed(2)}ms (target: <16ms)`);
        }
      });
      
      return <MemoizedPrivateRoute {...props} />;
    };
  }
  
  return MemoizedPrivateRoute;
})();