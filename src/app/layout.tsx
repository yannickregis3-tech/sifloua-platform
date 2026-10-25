import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "SIFLOUA — Apprendre, pratiquer, réussir", description: "La plateforme éducative pensée pour les apprenants en Côte d’Ivoire." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fr"><body>{children}</body></html>; }
