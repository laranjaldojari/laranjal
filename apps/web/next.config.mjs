/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Proxy do front para a API durante o desenvolvimento
    return [{ source: '/api/:path*', destination: `${process.env.API_URL ?? 'http://localhost:3000'}/:path*` }];
  },
};
export default nextConfig;
