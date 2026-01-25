/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Monaco web workers
  webpack: (config, { isServer }) => {
    // Font loading
    config.module.rules.push({
      test: /\.woff2$/,
      type: 'asset/resource',
    });

    // Monaco Editor worker configuration - prevent SSR issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        path: false,
      };
    }

    return config;
  },

  // Optimize fonts and Monaco
  experimental: {
    optimizePackageImports: ['@monaco-editor/react'],
  },

  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
