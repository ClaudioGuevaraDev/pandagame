import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";
import { Header } from "@/components/Header";
import { CloudSync } from "@/lib/cloud/CloudSync";
import { SITE_URL } from "@/lib/site";
import { PALETTE } from "@/lib/theme";
import "./globals.css";

// Las fuentes web se recortan al alfabeto latino; los kanji decorativos usan
// estas fuentes del sistema con el mismo estilo (mincho / gótica).
const mincho = Shippori_Mincho_B1({
  variable: "--font-mincho",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  fallback: ["Hiragino Mincho ProN", "Yu Mincho", "Noto Serif CJK JP", "Noto Serif JP", "serif"],
});
const zen = Zen_Kaku_Gothic_New({
  variable: "--font-zen",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  fallback: ["Hiragino Sans", "Yu Gothic", "Noto Sans CJK JP", "Noto Sans JP", "sans-serif"],
});
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

const DESCRIPTION =
  "Aprende pandas (Python) jugando: 30 retos con tests, del nivel fácil al experto, y un tutorial completo. Todo se ejecuta en tu navegador.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PandaGame · Aprende pandas jugando", template: "%s · PandaGame" },
  description: DESCRIPTION,
  applicationName: "PandaGame",
  keywords: ["pandas", "python", "tutorial pandas", "ejercicios pandas", "data science", "DataFrame"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "PandaGame",
    title: "PandaGame · Aprende pandas jugando",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: PALETTE.paper,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${mincho.variable} ${zen.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="washi flex h-dvh flex-col overflow-hidden font-sans">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-ink px-3 py-2 font-bold text-paper-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Saltar al contenido
        </a>
        {/* Filtro de pincel compartido: bordes irregulares en trazos SVG */}
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id="brush" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="5" />
          </filter>
          <filter id="brush-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" />
          </filter>
        </svg>
        <Header />
        <CloudSync />
        <main id="main" tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
