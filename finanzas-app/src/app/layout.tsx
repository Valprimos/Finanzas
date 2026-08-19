import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FinanzasProvider } from "@/lib/store";
import { AppShell } from "@/components/app-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Finanzas — control de gastos e ingresos",
  description: "App de finanzas personales local-first: rápida, privada y sin nubes de por medio.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0d12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <FinanzasProvider>
            <AppShell>{children}</AppShell>
          </FinanzasProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
