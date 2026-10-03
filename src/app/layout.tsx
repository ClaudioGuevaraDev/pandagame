import type { Metadata } from "next";
import { JetBrains_Mono, Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const mincho = Shippori_Mincho_B1({
  variable: "--font-mincho",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});
const zen = Zen_Kaku_Gothic_New({
  variable: "--font-zen",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PandaGame · Aprende pandas jugando",
  description: "30 retos de pandas (Python) con tests, del nivel fácil al experto, directamente en tu navegador.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${mincho.variable} ${zen.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="washi flex h-dvh flex-col overflow-hidden font-sans">
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
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
