import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/source-sans-3/wght.css";
import "./globals.css";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  // Demó: nem indexelhető. Domain hiányában canonical URL-t nem adunk meg.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f1e7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE.lang}>
      <body>
        <a className="hvh-skip-link" href="#tartalom">
          Ugrás a tartalomra
        </a>
        {children}
      </body>
    </html>
  );
}
