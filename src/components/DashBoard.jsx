import React, { useEffect, useState, useMemo, useCallback } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "./FireBase";
import { motion } from "framer-motion";

// Memoized components for better performance
const ScoreDisplay = React.memo(({ label, value, isScore = false }) => {
  const scoreColor = useMemo(() => {
    if (!isScore) return "text-gray-700";
    if (value <= 0) return "text-green-600";
    if (value <= 5) return "text-yellow-600";
    return "text-red-600";
  }, [value, isScore]);

  return (
    <p className="flex justify-between items-center py-1">
      <strong className="text-gray-700">{label}</strong>
      <span className={`font-medium ${scoreColor}`}>
        {isScore ? value : `${value}`}
      </span>
    </p>
  );
});

ScoreDisplay.displayName = 'ScoreDisplay';

const HistoryItem = React.memo(({ item }) => {
  const formattedDate = useMemo(() => {
    if (!item.timestamp) return "Unknown date";
    try {
      const date = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Unknown date";
    }
  }, [item.timestamp]);

  const scoreColor = useMemo(() => {
    const score = item.nutritionScore || 0;
    if (score <= 0) return "text-green-600";
    if (score <= 5) return "text-yellow-600";
    return "text-red-600";
  }, [item.nutritionScore]);

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 flex gap-4 items-start sm:items-center"
    >
      {item.image && (
        <div className="flex-shrink-0">
          <img
            src={item.image}
            alt={item.productName || "Product"}
            loading="lazy"
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
          {item.productName || "Unknown Product"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Barcode: <span className="font-mono">{item.barcode || "N/A"}</span>
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-sm font-medium ${scoreColor}`}>
            Score: <span className="font-bold">{item.nutritionScore || 0}</span>
          </p>
          <span className="text-xs text-gray-400 hidden sm:block">
            {formattedDate}
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-400 sm:hidden self-end">
        {formattedDate}
      </span>
    </motion.li>
  );
});

HistoryItem.displayName = 'HistoryItem';

const EmptyState = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-12 px-4"
  >
    <div className="text-5xl mb-4">🔍</div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">No scans yet</h3>
    <p className="text-gray-500 mb-6">
      Start scanning products to see your history here!
    </p>
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="inline-flex items-center text-green-600 font-medium"
    >
      ↓ Scan your first product ↓
    </motion.div>
  </motion.div>
));

EmptyState.displayName = 'EmptyState';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Optimized Firestore subscription with error handling
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let unsubscribe = null;

    const setupListener = () => {
      try {
        const q = query(
          collection(db, "scanHistory"),
          where("uid", "==", user.uid),
          orderBy("timestamp", "desc")
        );

        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            if (!mounted) return;
            
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            
            setHistory(data);
            setLoading(false);
            setHasError(false);
          },
          (error) => {
            console.error("Firestore error:", error);
            if (mounted) {
              setHasError(true);
              setLoading(false);
            }
          }
        );
      } catch (error) {
        console.error("Setup error:", error);
        if (mounted) {
          setHasError(true);
          setLoading(false);
        }
      }
    };

    // Small delay to prevent blocking main thread
    const timer = setTimeout(setupListener, 50);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Memoized calculations to prevent recomputation on every render
  const { totalScans, avgScore, best, worst } = useMemo(() => {
    if (history.length === 0) {
      return { totalScans: 0, avgScore: 0, best: null, worst: null };
    }

    let totalScore = 0;
    let bestItem = history[0];
    let worstItem = history[0];

    // Single pass through history for all calculations
    history.forEach(item => {
      const score = item.nutritionScore || 0;
      totalScore += score;

      if (score > (bestItem.nutritionScore || 0)) {
        bestItem = item;
      }
      if (score < (worstItem.nutritionScore || 0)) {
        worstItem = item;
      }
    });

    return {
      totalScans: history.length,
      avgScore: Math.round(totalScore / history.length),
      best: bestItem,
      worst: worstItem
    };
  }, [history]);

  // Memoized stats data
  const stats = useMemo(() => [
    { label: "Total Scans", value: totalScans, isScore: false },
    { label: "Average Score", value: avgScore, isScore: true },
    { label: "Best Product", value: best?.productName || "N/A", isScore: false },
    { label: "Best Score", value: best?.nutritionScore || 0, isScore: true },
    { label: "Worst Product", value: worst?.productName || "N/A", isScore: false },
    { label: "Worst Score", value: worst?.nutritionScore || 0, isScore: true }
  ], [totalScans, avgScore, best, worst]);

  // Memoized animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }), []);

  // Memoized loading skeleton
  const renderSkeleton = useCallback(() => (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  ), []);

  // Memoized error state
  const renderError = useCallback(() => (
    <div className="text-center py-12 px-4">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Unable to load history</h3>
      <p className="text-gray-500 mb-6">
        Please check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
      >
        Refresh Page
      </button>
    </div>
  ), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-6 sm:px-6 md:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            📊 Your Scan History
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track your product scans and nutrition scores
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Stats Overview */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                  >
                    <ScoreDisplay {...stat} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Content Area */}
          <div className="p-6">
            {loading ? (
              renderSkeleton()
            ) : hasError ? (
              renderError()
            ) : history.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Mobile Stats */}
                {history.length > 0 && (
                  <div className="lg:hidden mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-700 mb-3 text-sm">Quick Stats</h3>
                      <div className="space-y-2">
                        <ScoreDisplay label="Total Scans" value={totalScans} />
                        <ScoreDisplay label="Average Score" value={avgScore} isScore />
                      </div>
                    </div>
                  </div>
                )}

                {/* History List */}
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Scans ({history.length})
                  </h2>
                  {history.length > 10 && (
                    <span className="text-sm text-gray-500">
                      Showing 10 most recent
                    </span>
                  )}
                </div>

                <motion.ul
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {history.slice(0, 20).map((item) => (
                    <HistoryItem key={item.id} item={item} />
                  ))}
                </motion.ul>

                {/* Pagination hint */}
                {history.length > 20 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center"
                  >
                    <p className="text-gray-500 text-sm">
                      + {history.length - 20} more scans • Scroll to see more
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Score ≤ 0: Excellent</span>
              </div>
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Score 1-5: Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Score ≥ 6: Poor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-gray-500 text-sm"
        >
          <p>Data updates in real-time • All scans are saved to your account</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default React.memo(Dashboard);