const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
  swcMinify: true,
  reactStrictMode: true,
  eslint: {
    dirs: ['src'],
  },
});
