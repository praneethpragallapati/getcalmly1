import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
