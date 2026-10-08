import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/", "/admin/", "/register/", "/activate/"] }, sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://minglekerala.in"}/sitemap.xml` };
}
