import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

// Memoized Social Icon Component
const SocialIcon = React.memo(({ icon, to, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1, duration: 0.3 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <NavLink
      to={to}
      className="hover:text-green-400 transition-colors duration-200 text-lg block"
    >
      {icon}
    </NavLink>
  </motion.div>
));

SocialIcon.displayName = 'SocialIcon';

// Memoized Quick Link Component
const QuickLink = React.memo(({ link }) => (
  <li>
    <NavLink
      to={link.to}
      className="hover:text-green-400 transition-colors duration-200 text-sm inline-block py-1"
    >
      {link.name}
    </NavLink>
  </li>
));

QuickLink.displayName = 'QuickLink';

// Main Footer Component with performance optimizations
const Footer = React.memo(() => {
  // Memoize static data to prevent re-creation on every render
  const socialLinks = useMemo(() => [
    { icon: <FaInstagram />, to: "/instagram" },
    { icon: <FaTwitter />, to: "/twitter" },
    { icon: <FaLinkedin />, to: "/linkedin" },
  ], []);

  const quickLinks = useMemo(() => [
    { name: "About Us", to: "/aboutUs" },
    { name: "Contact Us", to: "/contactUs" },
    { name: "Privacy Policy", to: "/privacy" },
    { name: "Help", to: "/help"}
  ], []);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Optimize motion values
  const footerAnimation = useMemo(() => ({
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  }), []);

  const socialContainerAnimation = useMemo(() => ({
    whileHover: { scale: 1.05 },
    transition: { duration: 0.3 }
  }), []);

  return (
    <motion.footer
      {...footerAnimation}
      className="w-full bg-gray-900 text-gray-300 py-12 px-6 mt-auto border-t border-gray-700"
    >
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center sm:text-left">
        
        {/* Brand + tagline */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-wide">PureScan</h2>
          <p className="text-sm leading-relaxed text-gray-400">
            Making your daily products safer with PureScan scanning. <br />
            Scan. Learn. Stay Healthy.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((link) => (
              <QuickLink key={link.to} link={link} />
            ))}
          </ul>
        </div>

        {/* Social / App Info */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Stay Connected</h3>
          <p className="text-sm text-gray-400">Follow us for updates and new features.</p>

          <motion.div
            className="flex justify-center sm:justify-start gap-4 mt-3"
            {...socialContainerAnimation}
          >
            {socialLinks.map((social, index) => (
              <SocialIcon key={index} icon={social.icon} to={social.to} index={index} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="mt-10 text-center text-xs text-gray-500">
        &copy; {currentYear} PureScan. All rights reserved.
      </div>
    </motion.footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;