import React, { useMemo, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const BackButton = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Prevent render on Home page - memoized for performance
  const shouldShow = useMemo(() => location.pathname !== "/", [location.pathname]);

  // ✅ Optimized handler with useCallback
  const handleBack = useCallback(() => {
    const blockedRoutes = ["/login", "/signin"];
    if (blockedRoutes.includes(location.pathname)) {
      navigate("/");
    } else {
      navigate(-1);
    }
  }, [navigate, location.pathname]);

  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 120, 
        damping: 15,
        mass: 0.5 // Optimized for performance
      }}
      className="w-full px-4 mt-4 flex"
    >
      <motion.button
        onClick={handleBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-white bg-gray-200 hover:bg-green-600
          px-4 py-2 rounded-full text-sm sm:text-base font-medium shadow-md transition-all duration-300
          active:scale-95" // Added for better mobile UX
      >
        <span className="text-lg">←</span>
        <span>Back</span>
      </motion.button>
    </motion.div>
  );
});

export default BackButton;