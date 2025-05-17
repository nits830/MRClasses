"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaLaptop, FaUsers, FaBook } from 'react-icons/fa';

const SecondHero: React.FC = () => {
  const features = [
    {
      icon: <FaGraduationCap className="w-12 h-12" />,
      title: "Expert Instructors",
      description: "Learn from experienced educators who are passionate about your success"
    },
    {
      icon: <FaLaptop className="w-12 h-12" />,
      title: "Interactive Learning",
      description: "Engage with our cutting-edge platform designed for optimal learning"
    },
    {
      icon: <FaUsers className="w-12 h-12" />,
      title: "Community Support",
      description: "Join a vibrant community of learners and share knowledge"
    },
    {
      icon: <FaBook className="w-12 h-12" />,
      title: "Comprehensive Content",
      description: "Access well-structured curriculum tailored to your learning goals"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="relative py-24 overflow-hidden bg-gradient-to-b from-white via-blue-50 to-white">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-transparent bg-clip-text animate-gradient">
            Why Choose MR Classes?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience a revolutionary approach to learning with our cutting-edge platform and expert instructors
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl transform scale-95 group-hover:scale-100 transition-transform duration-300"></div>
              <div className="relative">
                <motion.div 
                  className="text-blue-600 mb-6 flex justify-center"
                  whileHover={{ scale: 1.1 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/signup"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Your Journey Today
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SecondHero;
