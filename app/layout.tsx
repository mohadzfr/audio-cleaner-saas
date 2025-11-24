import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

// C'EST ICI QUE TU CHANGES LE TITRE DE L'ONGLET
export const metadata: Metadata = {
  title: "AudioFix - Nettoyage Audio IA",
  description: "Supprimez le bruit de fond de vos audios et vidéos instantanément avec l'IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
        <Analytics /> {/* Le mouchard pour voir les visites */}
      </body>
    </html>
  );
}