/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@tend-o-matic/auth-runtime",
    "@tend-o-matic/compliance",
    "@tend-o-matic/compliance-monitor",
    "@tend-o-matic/db",
  ],
};

export default nextConfig;
