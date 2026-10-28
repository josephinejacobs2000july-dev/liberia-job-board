/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // The database driver runs on the server only.
  serverExternalPackages: ["postgres"],
  // Keep deploys from stopping on style or type warnings; `npm run typecheck` still checks types.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
