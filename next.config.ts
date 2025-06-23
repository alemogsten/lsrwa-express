import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true, // ✅ Enable built-in styled-components support
  },
  reactStrictMode: true,
};

export default nextConfig;
