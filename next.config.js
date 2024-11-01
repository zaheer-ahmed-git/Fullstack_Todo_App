/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination:
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000/api/:path*"
          : "/api/:path*",
    },
    {
      source: "/ws",
      destination:
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000/ws"
          : "/ws",
    },
  ],
};

module.exports = nextConfig;
