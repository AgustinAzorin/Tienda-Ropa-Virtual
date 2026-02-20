import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jb-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: {
    template: '%s — ANYA',
    default: 'ANYA — Fashion meets technology',
  },
  description:
    'Plataforma de social commerce de moda con probador virtual 3D. Probate la ropa antes de comprarla y compartí tu estilo.',
  keywords: ['moda', 'probador virtual', '3D', 'social commerce', 'ropa'],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'ANYA',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${dmSans.variable} ${jbMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[#0D0A08] text-[#F5F0E8] font-body antialiased">
        {children}
      </body>
    </html>
  );
}
