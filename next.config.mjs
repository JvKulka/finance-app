import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuração para suportar imports de shared e server
  transpilePackages: [],
  // Configuração de paths usando webpack
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/contexts': path.resolve(__dirname, './contexts'),
      '@shared': path.resolve(__dirname, './shared'),
    };
    return config;
  },
};

export default nextConfig;
