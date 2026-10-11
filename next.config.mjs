/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow large base64 image payloads to be posted to server actions / routes.
  experimental: {
    serverActions: { bodySizeLimit: "12mb" }
  }
};

export default nextConfig;
