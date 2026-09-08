/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.adonaytiktokacademy.com",
      },
      {
        protocol: "https",
        hostname: "*.azmeracoffee.com",
      },
      {
        protocol: "https",
        hostname: "*.temeupholstery.com",
      },
      {
        protocol: "https",
        hostname: "*.nhattythebarber.com",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
    ],
  },
};

module.exports = nextConfig;
