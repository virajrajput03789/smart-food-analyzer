import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './FireBase';
import { motion } from 'framer-motion';

// top of your LoginComponent.jsx (after imports)
const originalConsole = { ...console };

// Ignore only COOP warnings
console.warn = (msg, ...args) => {
  if (!msg.includes('Cross-Origin-Opener-Policy')) {
    originalConsole.warn(msg, ...args);
  }
};


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
      const user = result.user;

      // Send message to parent window (safe for COOP)
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
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex items-center justify-center min-h-screen px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale: 1.005 }}
        className="w-full max-w-md p-10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 backdrop-blur-md bg-white/80 relative overflow-hidden"
      >

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2 mb-8"
        >
          <motion.h2
            whileHover={{
              scale: 1.05,
              textShadow: "0px 0px 12px rgba(34,197,94,0.8)"
            }}
            className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500 tracking-wide animate-pulse"
          >
            Log In
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4 }}
            className="h-1 bg-green-500 w-24 mx-auto rounded origin-left"
          />
        </motion.div>

        {/* FORM */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {[email, password].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              whileHover={{ scale: 1.01 }}
              className="relative transition duration-300"
            >
              <label className="absolute left-4 top-2 text-xs text-gray-500 peer-focus:text-green-600 peer-focus:top-1 transition-all pointer-events-none">
                {i === 0 ? 'Email address' : 'Password'}
              </label>

              <motion.input
                type={i === 0 ? 'email' : 'password'}
                placeholder={i === 0 ? "Enter your email" : "Enter your password"}
                value={i === 0 ? email : password}
                onChange={(e) => i === 0 ? setEmail(e.target.value) : setPassword(e.target.value)}
                required
                whileFocus={{ scale: 1.01, boxShadow: "0px 0px 10px rgba(34,197,94,0.4)" }}
                className="peer w-full px-4 pt-6 pb-2 text-sm border border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-green-600 
                bg-white/90 backdrop-blur-sm transition-all duration-300"
              />
            </motion.div>
          ))}

          {/* Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{
              scale: 1.05,
              backgroundColor: "#059669",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.2)"
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            type="submit"
            className="w-full bg-green-600 text-white py-2.5 rounded-md font-medium hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Login
          </motion.button>
        </form>

        {/* Google */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
          className="mt-6"
        >
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-2.5 rounded-md border border-gray-300 hover:bg-gray-200 transition-all duration-300"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </motion.div>

        {/* Signup Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.01 }}
          className="text-sm text-center text-gray-600 mt-6"
        >
          Don’t have an account?{' '}
          <motion.span whileHover={{ x: 2 }} className="inline-block">
            <Link to="/signin" className="text-green-700 font-medium hover:underline">
              Sign up
            </Link>
          </motion.span>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default Login;


