import React from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const socialLinks = [
    { icon: <FaInstagram />, to: "/instagram" },
    { icon: <FaTwitter />, to: "/twitter" },
    { icon: <FaLinkedin />, to: "/linkedin" },
  ];

  const quickLinks = [
    { name: "About Us", to: "/aboutUs" },
    { name: "Contact Us", to: "/contactUs" },
    { name: "Privacy Policy", to: "/privacy" },
    { name: "Help", to: "/help"}
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
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
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className="hover:text-green-400 transition-colors duration-200"
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Social / App Info */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Stay Connected</h3>
          <p className="text-sm text-gray-400">Follow us for updates and new features.</p>

          <motion.div
            className="flex justify-center sm:justify-start gap-4 mt-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {socialLinks.map((social, index) => (
              <NavLink
                key={index}
                to={social.to}
                className="hover:text-green-400 transition-colors duration-200 text-lg"
              >
                {social.icon}
              </NavLink>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="mt-10 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} PureScan. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;

