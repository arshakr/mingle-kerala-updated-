import type { NextConfig } from "next";
const common = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : [])
];
const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: common },
      { source: "/dashboard/:path*", headers: noIndex },
      { source: "/admin/:path*", headers: noIndex },
      { source: "/api/:path*", headers: noIndex },
      { source: "/activate", headers: noIndex },
      { source: "/register", headers: noIndex },
      { source: "/login", headers: noIndex }
    ];
  }
};
export default nextConfig;
