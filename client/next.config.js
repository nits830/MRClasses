/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization
  output: 'standalone',
  // Configure environment variables
  env: {
    API_URL: process.env.API_URL || 'https://mrclasses-backend.onrender.com',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://mrclasses-backend.onrender.com',
  },
};

module.exports = nextConfig; 