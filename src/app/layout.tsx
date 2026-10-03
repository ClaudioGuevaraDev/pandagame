import type { Metadata } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PandaGame · Aprende pandas jugando",
  description: "30 retos de pandas (Python) con tests, del nivel fácil al experto, directamente en tu navegador.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${nunito.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="flex h-dvh flex-col overflow-hidden font-sans">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
