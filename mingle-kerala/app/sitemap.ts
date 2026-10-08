import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const host = process.env.NEXT_PUBLIC_APP_URL || "https://minglekerala.in";
  return ["", "/privacy", "/terms", "/community", "/safety", "/refund", "/contact"].map(path => ({ url: `${host}${path}`, lastModified: new Date(), changeFrequency: "monthly", priority: path ? 0.3 : 1 }));
}
