import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import SecondHero from '../components/SecondHero';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
        <Navbar />
        <Hero />
        <SecondHero />
        <Testimonials />
        <Footer />
      </div>
    </>
  );
};

export default Home;
