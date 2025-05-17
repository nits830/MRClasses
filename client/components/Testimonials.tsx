"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaQuoteLeft } from 'react-icons/fa';
import axios from 'axios';

interface Testimonial {
  _id: string;
  user: {
    name: string;
  };
  content: string;
  createdAt: string;
}

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get('/api/testimonials/random?count=3');
        setTestimonials(response.data);
      } catch (err) {
        setError('Failed to fetch testimonials');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

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

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return null; // Hide section if there's an error
  }

  return (
    <div className="relative py-24 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.5, 0.7],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 right-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.5, 0.7],
          }}
          transition={{
            duration: 8,
            delay: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.5, 0.7],
          }}
          transition={{
            duration: 8,
            delay: 4,
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
            Student Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from our students about their transformative learning experiences and achievements
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial._id}
              className="relative group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl transform scale-95 group-hover:scale-100 transition-transform duration-300"></div>
              
              {/* Quote Icon */}
              <motion.div 
                className="absolute -top-4 -left-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3 text-white shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                <FaQuoteLeft className="w-6 h-6" />
              </motion.div>

              <div className="relative">
                {/* Testimonial Text */}
                <p className="text-gray-600 text-center mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Student Info */}
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800 mb-1">{testimonial.user.name}</h4>
                  <p className="text-blue-600">{new Date(testimonial.createdAt).toLocaleDateString()}</p>
                </div>
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
          <p className="text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of successful learners and start your journey today!
          </p>
          <motion.button 
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Enroll Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Testimonials;
