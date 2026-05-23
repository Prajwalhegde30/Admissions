/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@atria/shared', '@atria/ui', '@atria/forms', '@atria/api-client'],
};

module.exports = nextConfig;
