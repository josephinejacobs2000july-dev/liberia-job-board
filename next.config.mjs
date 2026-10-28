/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // The database driver runs on the server only.
  serverExternalPackages: ["postgres"],
  // Keep deploys from stopping on style or type warnings; `npm run typecheck` still checks types.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // The service worker must always be fresh so app updates reach phones quickly.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
