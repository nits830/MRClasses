"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from 'framer-motion';

export default function LearnMore() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-transparent bg-clip-text animate-gradient">
            Welcome to MR Classes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted resource for mastering middle school (Grades 6-8) and high school mathematics (Grades 9-12). We are passionate about empowering students to achieve their full potential in math by providing high-quality, engaging and accessible online classes.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-12 shadow-xl backdrop-blur-lg bg-opacity-80 border border-gray-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              At MR Classes, our mission is to make learning math an enjoyable and rewarding experience. We believe that everyone can do well in mathematics with the right guidance, personalized support and the right resources. That's why we've designed our classes to cater to different learning styles and paces, ensuring that every student can thrive.
            </p>
          </div>
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Expert Teachers",
                description: "Our qualified instructors are passionate about math and experienced in teaching high school students. They break down complex concepts into easy-to-understand lessons, fostering both understanding and confidence."
              },
              {
                title: "Flexible Learning",
                description: "Learn at your own pace with our self-paced modules, live sessions, and interactive exercises. We provide a range of resources to ensure you're well-prepared, no matter where you're starting from."
              },
              {
                title: "Comprehensive Curriculum",
                description: "We cover the full spectrum of high school math topics. Whether you're brushing up on the basics or tackling advanced subjects, we've got you covered."
              },
              {
                title: "Regular Progress Tracking",
                description: "To ensure consistent improvement, we conduct biweekly tests to track students' progress. These assessments help us identify areas where extra attention is needed and allow us to tailor our approach to meet each student's needs."
              },
              {
                title: "Student-Centered Approach",
                description: "We believe that every student is unique. Our teaching methods focus on building a solid foundation for students, addressing individual challenges, and cultivating problem-solving skills."
              },
              {
                title: "Interactive Learning Tools",
                description: "Our platform integrates interactive quizzes, problem-solving exercises, and real-time feedback to make learning math more engaging and effective."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 backdrop-blur-lg bg-opacity-80 border border-gray-100"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Vision Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10 background-pattern"></div>
            <h2 className="text-4xl font-bold mb-6 relative z-10">Our Vision</h2>
            <p className="text-lg leading-relaxed relative z-10">
              We envision a world where students in different parts of the world have access to high-quality math education, regardless of location or background. By offering flexible online classes, we aim to remove the barriers to learning and help students unlock the doors to future academic success and career opportunities.
            </p>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Join us at MR Classes
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover a new way to learn math — one that's fun, flexible, and focused on your learning.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="/signup"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Today
            </a>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
} 