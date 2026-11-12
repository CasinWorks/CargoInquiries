import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The desk reads browser storage after mount. Cache Components expect
  // useParams and useSearchParams to be wrapped for prerender streaming.
  cacheComponents: false,
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
