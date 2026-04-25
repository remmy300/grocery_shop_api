/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
  },

  // API rewrites for proxy (optional, if you want to hide backend URL)
  async rewrites() {
    return {
      beforeFiles: [
        // Uncomment to proxy API calls through Next.js
        // {
        //   source: '/api/:path*',
        //   destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
        // },
      ],
    };
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Optimize images
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
