/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuração para suportar imports de shared e server
  transpilePackages: [],
  // Os paths já estão configurados no tsconfig.json e são suportados nativamente pelo Next.js 16
};

export default nextConfig;
