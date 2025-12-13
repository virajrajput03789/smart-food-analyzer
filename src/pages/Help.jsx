import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ContactUs from "./ContactUs";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

export default function Help() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sections = [
    {
      icon: "📸",
      title: "How to Scan a Product",
      color: "#10B981",
      points: [
        "Open the PureScan app.",
        "Tap Scan Product button.",
        "Point your camera at the barcode.",
        "Hold steady until detection.",
        "Wait for product details to load."
      ],
      note: "Supports EAN, UPC, and QR-based product codes."
    },
    {
      icon: "🥗",
      title: "Understanding Your Scan Results",
      color: "#059669",
      subsections: [
        {
          title: "Product Image",
          description: "If available, PureScan automatically fetches the product image."
        },
        {
          title: "Product Name & Brand",
          description: "Extracted from verified product databases."
        },
        {
          title: "Ingredients Breakdown",
          description: "PureScan analyzes additives, preservatives, allergens, and nutritional red flags."
        },
        {
          title: "Health Score",
          description: "A transparent score based on ingredient safety, additive levels, sugar, salt, fat content, and processing level."
        }
      ]
    },
    {
      icon: "🔍",
      title: "If a Product Doesn't Scan",
      color: "#047857",
      points: [
        "Ensure the barcode is not damaged.",
        "Clean your camera lens.",
        "Increase lighting conditions.",
        "Hold camera 10–15 cm away.",
        "Try scanning from different angles."
      ],
      note: "If still not detected, you can manually enter the barcode."
    },
    {
      icon: "🖼️",
      title: "Product Image Not Showing?",
      color: "#7C3AED",
      points: [
        "The product is new in the market.",
        "Database doesn't have an image yet.",
        "Barcode linked to multiple variants."
      ],
      note: "PureScan will still show all available product details."
    },
    {
      icon: "⚠️",
      title: "Common Issues & Fixes",
      color: "#DC2626",
      subsections: [
        {
          title: "No Internet Connection",
          points: ["Check WiFi or mobile data", "Disable airplane mode", "Disable VPN if blocking requests"]
        },
        {
          title: "Product Not Found",
          description: "This means the product is not in the database yet. You can submit it manually using the Contact Us form."
        },
        {
          title: "App Feels Slow",
          points: ["Close background apps", "Clear browser cache", "Refresh the page"]
        }
      ]
    },
    {
      icon: "✅",
      title: "About PureScan",
      color: "#0EA5E9",
      description: "PureScan is a scanner-grade product analysis tool designed to give users accurate product data, honest ingredient breakdown, transparent health scoring, and fast scanning. We believe in truth, loyalty, and user empowerment."
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-white via-green-50/80 to-emerald-50/60 overflow-hidden font-sans">
      {/* Background Orbs */}
      {isMobile ? (
        <>
          <motion.div
            className="absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.15,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-300 via-emerald-300 to-teal-200 blur-[100px]" />
          </motion.div>
          <motion.div
            className="absolute -right-20 -bottom-20 w-[25rem] h-[25rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.15,
              scale: [1, 1.08, 1]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 via-emerald-200 to-green-300 blur-[100px]" />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div
            className="absolute -top-60 -left-60 w-[45rem] h-[45rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.2,
              scale: [1, 1.15, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 via-emerald-400 to-teal-300 blur-[140px]" />
          </motion.div>
          <motion.div
            className="absolute -right-40 -bottom-40 w-[35rem] h-[35rem] rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.2,
              scale: [1, 1.12, 1],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-emerald-300 to-green-400 blur-[140px]" />
          </motion.div>
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex-grow">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-12 font-sans"
        >
          {/* Hero Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto mb-12 sm:mb-16 text-center"
          >
            <motion.h1
              className={`font-bold tracking-tight ${isMobile ? 'text-3xl sm:text-4xl' : 'text-5xl sm:text-6xl'} mb-4 sm:mb-6`}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                background: 'linear-gradient(90deg, #10B981, #34D399, #22C55E, #059669, #10B981)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Help & Support
              <br />
              <span className="text-emerald-700">PureScan</span>
            </motion.h1>
            
            <motion.p
              className={`text-gray-700 max-w-3xl mx-auto leading-relaxed ${isMobile ? 'text-base sm:text-lg' : 'text-xl'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Welcome to the PureScan Help Center! This page will guide you through scanning products, understanding results, fixing common issues, and contacting support. PureScan is built to give you fast, accurate, and transparent product insights.
            </motion.p>

            {/* Animated Underline */}
            <motion.div
              className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-6 mx-auto"
              initial={{ width: 0 }}
              animate={{ width: isMobile ? "60%" : "40%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              style={{ height: isMobile ? '2px' : '3px' }}
            />
          </motion.section>

          {/* Help Sections */}
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={!isMobile ? {
                  y: -10,
                  boxShadow: "0px 30px 80px rgba(16,185,129,0.15)"
                } : undefined}
                className="group relative cursor-pointer"
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-green-50/30 rounded-3xl shadow-lg backdrop-blur-xl border border-green-200/30 group-hover:border-green-400 transition-all duration-500" />
                
                {/* Content */}
                <div className="relative p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Icon */}
                    <motion.div
                      whileHover={!isMobile ? { 
                        scale: 1.2,
                        rotate: [0, -10, 10, 0]
                      } : undefined}
                      transition={{ duration: 0.5 }}
                      className={`mx-auto sm:mx-0 rounded-2xl bg-gradient-to-br from-white to-green-100 flex items-center justify-center shadow-lg group-hover:shadow-xl ${isMobile ? 'w-16 h-16 mb-4' : 'w-24 h-24'}`}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={isMobile ? 'text-2xl' : 'text-4xl'}
                      >
                        {section.icon}
                      </motion.span>
                    </motion.div>
                    
                    {/* Text Content */}
                    <div className="flex-1">
                      <motion.h2 
                        whileHover={!isMobile ? { scale: 1.02, color: section.color } : undefined} 
                        className={`font-bold text-green-800 mb-4 ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}
                      >
                        {section.title}
                      </motion.h2>
                      
                      {section.points && (
                        <motion.ul 
                          className="space-y-2 mb-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {section.points.map((point, pointIdx) => (
                            <motion.li 
                              key={pointIdx}
                              className="flex items-start gap-2 text-gray-600"
                              whileHover={!isMobile ? { x: 5, color: "#065f46" } : undefined}
                            >
                              <span className="text-green-500 mt-1">•</span>
                              <span>{point}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                      
                      {section.subsections && section.subsections.map((sub, subIdx) => (
                        <motion.div 
                          key={subIdx}
                          className="mb-6 last:mb-0"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + subIdx * 0.1 }}
                        >
                          <h3 className="font-semibold text-green-700 mb-2 text-lg">
                            {subIdx + 1}. {sub.title}
                          </h3>
                          {sub.description && (
                            <p className="text-gray-600 mb-2">{sub.description}</p>
                          )}
                          {sub.points && (
                            <ul className="space-y-1 ml-4">
                              {sub.points.map((point, pointIdx) => (
                                <li key={pointIdx} className="text-gray-600 flex items-start gap-2">
                                  <span className="text-green-400">◦</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </motion.div>
                      ))}
                      
                      {section.description && (
                        <motion.p 
                          className="text-gray-600 leading-relaxed"
                          whileHover={!isMobile ? { x: 5 } : undefined}
                        >
                          {section.description}
                        </motion.p>
                      )}
                      
                      {section.note && (
                        <motion.div
                          className="mt-4 p-3 bg-green-50/50 rounded-lg border border-green-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <p className="text-green-700 font-medium">✅ {section.note}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto mt-12 sm:mt-16"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-3xl p-8 sm:p-12 border border-green-200/50 relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-teal-400/20 to-green-400/10 blur-3xl" />
              
              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-6"
                >
                  📬
                </motion.div>
                
                <h2 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'} text-green-800 mb-4`}>
                  Need Help? Contact Us
                </h2>
                
                <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                  If you face any issue, feel free to reach out. Our support team is ready to assist you.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white rounded-xl p-6 border border-green-200 hover:border-green-400 transition-all duration-300"
                  >
                    <div className="text-3xl mb-4">📧</div>
                    <h3 className="font-semibold text-green-800 mb-2">Email Support</h3>
                    <a 
                      href="mailto:purescan.helpdesk@gmail.com"
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      purescan.helpdesk@gmail.com
                    </a>
                    <p className="text-sm text-gray-500 mt-2">Response within 24 hours</p>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white rounded-xl p-6 border border-green-200 hover:border-green-400 transition-all duration-300"
                  >
                    <div className="text-3xl mb-4">📋</div>
                    <h3 className="font-semibold text-green-800 mb-2">Support Form</h3>
                    <p className="text-gray-600 mb-3">Available on the Contact Us page</p>
                    <Link 
                      to="/contactUs"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Go to Contact Form
                    </Link>
                  </motion.div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    <span>←</span>
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mt-12 pt-8 border-t border-green-200 text-center"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-4xl mb-4"
            >
              🙏
            </motion.div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Thank you for using PureScan
            </h3>
            <p className="text-gray-600">
              Your trust motivates us to keep improving.
            </p>
            <p className="text-gray-500 text-sm mt-4">
              PureScan Support Center • Last updated: {new Date().toLocaleDateString()}
            </p>
          </motion.footer>
        </motion.div>
      </div>
    </div>
  );
}
