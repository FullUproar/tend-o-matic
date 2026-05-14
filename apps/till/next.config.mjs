/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages ship as TypeScript source (no build step); Next.js
  // needs to transpile them via SWC at build time.
  transpilePackages: [
    "@tend-o-matic/compliance",
    "@tend-o-matic/db",
    "@tend-o-matic/payments",
  ],
};

export default nextConfig;
