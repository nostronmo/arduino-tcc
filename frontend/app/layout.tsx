import type { Metadata } from "next";
import { Geist_Mono, Nunito_Sans } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caixa Preta Veicular",
  description: "Painel de telemetria com NestJS, PostgreSQL, ESP32 e OBD-II"
};

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${nunitoSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
