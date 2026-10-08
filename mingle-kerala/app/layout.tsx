import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PwaRegister } from "@/components/PwaRegister";
export const metadata: Metadata = {
  title: { default: "Mingle Kerala — Private conversations across Kerala", template: "%s | Mingle Kerala" },
  description: "Discover meaningful anonymous conversations across Kerala. A privacy-first, 18+ social community.",
  applicationName: "Mingle Kerala",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://minglekerala.in"),
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
  openGraph: { title: "Mingle Kerala", description: "Your identity stays yours. Your conversations go places.", type: "website" }
};
export const viewport: Viewport = { themeColor: "#07131f", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><LocaleProvider><PwaRegister/>{children}</LocaleProvider></body></html>;
}
