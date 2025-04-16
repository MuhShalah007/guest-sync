/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  customWorkerDir: 'serviceworker',
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  env: {
    TZ: 'Asia/Jakarta',
    APP_NAME: process.env.APP_NAME || 'Buku Tamu Pesantren',
    NEXT_PUBLIC_APP_WELCOME_MESSAGE:
      process.env.APP_WELCOME_MESSAGE ||
      'Ahlan Wa Sahlan, \ndi Pondok Pesantren Islam \nDarusy Syahadah',
  },
};

module.exports = withPWA(nextConfig);