"use client";

import React from 'react';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            delay: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex flex-col lg:flex-row items-center gap-12">
        {/* Left content */}
        <motion.div 
          className="flex-1 text-center lg:text-left z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-transparent bg-clip-text animate-gradient">
            Transform Your Learning Journey
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-2xl">
            Experience personalized education that adapts to your needs. Join our community of learners and unlock your full potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/signup" 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Learning Now
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/about" 
                className="px-8 py-4 bg-white text-gray-800 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl border-2 border-gray-200 transition-all duration-300"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
          
          {/* Stats */}
          <motion.div 
            className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">1000+</div>
              <div className="text-gray-600 mt-2">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">50+</div>
              <div className="text-gray-600 mt-2">Expert Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">95%</div>
              <div className="text-gray-600 mt-2">Success Rate</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right content - Image */}
        <motion.div 
          className="flex-1 relative z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative w-full aspect-square max-w-lg mx-auto">
            {/* Background glow effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl transform rotate-6 scale-95 opacity-20 blur-xl"
              animate={{
                scale: [0.95, 1, 0.95],
                rotate: [6, 8, 6],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <ImageWithFallback
              src="/images/students_studying.jpg"
              alt="Students studying"
              width={600}
              height={600}
              className="relative rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
