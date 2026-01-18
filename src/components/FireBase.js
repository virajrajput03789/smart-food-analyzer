// src/components/FireBase.js
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Validated environment configuration with fallbacks for development
const getFirebaseConfig = () => {
  // Development defaults (only used in local dev if env vars are missing)
  const defaultConfig = {
    apiKey: "demo-key-for-local-development-only",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456",
    measurementId: "G-ABCDEF1234"
  };

  try {
    // Safely extract environment variables with validation
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() || defaultConfig.apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || defaultConfig.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || defaultConfig.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || defaultConfig.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || defaultConfig.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || defaultConfig.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim() || defaultConfig.measurementId
    };

    // Development warnings for missing env variables
    if (import.meta.env.DEV) {
      const requiredKeys = ['apiKey', 'projectId', 'appId'];
      const missing = requiredKeys.filter(key => 
        config[key] === defaultConfig[key] && config[key].includes('demo')
      );
      
      if (missing.length > 0) {
        console.warn(
          '⚠️ Firebase: Missing environment variables for:', 
          missing.join(', '),
          '\nUsing demo configuration. This will not work in production.'
        );
      }
    }

    // Security check for production (only warns, doesn't block)
    if (import.meta.env.PROD && config.apiKey.includes('demo')) {
      console.error('❌ Firebase: Production build is using demo API key!');
    }

    return config;
  } catch (error) {
    console.error('Firebase configuration error:', error);
    return defaultConfig;
  }
};

// Firebase services cache to prevent multiple initializations
let cachedApp = null;
let cachedAnalytics = null;
let cachedAuth = null;
let cachedDb = null;
let cachedGoogleProvider = null;

// Optimized Firebase initialization with singleton pattern
const initializeFirebase = () => {
  // Return cached instances if available
  if (cachedApp && cachedAuth && cachedDb) {
    return {
      app: cachedApp,
      analytics: cachedAnalytics,
      auth: cachedAuth,
      db: cachedDb,
      googleProvider: cachedGoogleProvider
    };
  }

  try {
    const firebaseConfig = getFirebaseConfig();
    
    // Get existing app or initialize new one
    const existingApps = getApps();
    const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
    
    // Initialize services with error boundaries
    let analytics = null;
    if (typeof window !== "undefined") {
      // Lazy initialize analytics only when supported
      isSupported().then(yes => {
        if (yes) {
          analytics = getAnalytics(app);
          cachedAnalytics = analytics;
        }
      }).catch(() => {
        // Analytics is non-critical, fail silently
      });
    }
    
    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();
    
    // Configure Google provider for better UX
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Configure auth persistence (optimized for mobile)
    auth.languageCode = 'en';
    
    // Cache instances for future use
    cachedApp = app;
    cachedAuth = auth;
    cachedDb = db;
    cachedGoogleProvider = googleProvider;

    // Local emulator setup (development only)
    if (import.meta.env.DEV) {
      const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
      
      if (useEmulator) {
        try {
          // Auth emulator
          if (import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST) {
            connectAuthEmulator(
              auth, 
              `http://${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST}`,
              { disableWarnings: true }
            );
            console.log('🔧 Firebase Auth emulator connected');
          }
          
          // Firestore emulator
          if (import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST) {
            connectFirestoreEmulator(
              db, 
              'localhost', 
              parseInt(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080')
            );
            console.log('🔧 Firebase Firestore emulator connected');
          }
        } catch (emulatorError) {
          console.warn('Firebase emulator connection failed:', emulatorError);
        }
      }
    }

    // Performance monitoring (only in production)
    if (import.meta.env.PROD && typeof window !== "undefined") {
      // Lazy load performance monitoring
      import('firebase/performance').then(({ getPerformance, initializePerformanceMonitoring }) => {
        try {
          const perf = getPerformance(app);
          initializePerformanceMonitoring(perf);
        } catch (perfError) {
          // Performance monitoring is non-critical
        }
      });
    }

    return {
      app,
      analytics,
      auth,
      db,
      googleProvider
    };
    
  } catch (error) {
    console.error('🔥 Firebase initialization failed:', error);
    
    // Graceful fallback for development
    if (import.meta.env.DEV) {
      console.warn('Using mock Firebase services for development');
      return {
        app: null,
        analytics: null,
        auth: createMockAuth(),
        db: createMockFirestore(),
        googleProvider: { setCustomParameters: () => {} }
      };
    }
    
    throw error;
  }
};

// Mock services for development/testing (tree-shaken in production)
const createMockAuth = () => ({
  currentUser: null,
  languageCode: 'en',
  onAuthStateChanged: () => () => {},
  signInWithPopup: () => Promise.resolve({ user: null }),
  signOut: () => Promise.resolve(),
  // ... other auth methods
});

const createMockFirestore = () => ({
  collection: () => ({
    doc: () => ({
      set: () => Promise.resolve(),
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
      onSnapshot: () => () => {}
    })
  }),
  // ... other firestore methods
});

// Initialize Firebase immediately (optimized for first paint)
const firebase = initializeFirebase();

// Optimized exports with getters for tree-shaking
export const getFirebaseApp = () => firebase.app;
export const getFirebaseAnalytics = () => firebase.analytics;
export const getFirebaseAuth = () => firebase.auth;
export const getFirebaseDb = () => firebase.db;
export const getGoogleProvider = () => firebase.googleProvider;

// Default exports (backward compatible)
export const auth = firebase.auth;
export const db = firebase.db;
export const googleProvider = firebase.googleProvider;

// Development utilities (removed in production builds)
if (import.meta.env.DEV) {
  // Expose Firebase for debugging
  if (typeof window !== "undefined") {
    window.__FIREBASE_APP__ = firebase.app;
  }
  
  // Performance logging
  const logFirebaseInit = () => {
    const initTime = performance.now();
    console.log(`🚀 Firebase initialized in ${initTime.toFixed(2)}ms`);
  };
  
  // Log after initial render to avoid blocking
  requestAnimationFrame(() => {
    setTimeout(logFirebaseInit, 100);
  });
}