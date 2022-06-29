/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    IP_DEV: process.env.IP_DEV,
  },
};

module.exports = nextConfig;
