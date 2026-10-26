import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // getcalmly1.vercel.app is Vercel's own address for this project. Visitors
  // and search engines go to the real domain; /api stays put so webhooks and
  // sign-in requests aimed at the old address keep working.
  async redirects() {
    return [
      {
        source: '/:path((?!api/).*)',
        has: [{ type: 'host', value: 'getcalmly1.vercel.app' }],
        destination: 'https://www.getcalmly.com/:path',
        permanent: true,
      },
    ]
  },
  experimental: {
    serverActions: {
      // Clinician documents (ID, registration proof, CV) are sent as data URLs,
      // one per request, capped at 2.5 MB each on the client (about 3.4 MB once
      // encoded). The 1 MB default would reject them; this stays under the
      // hosting platform's ~4.5 MB request cap.
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
