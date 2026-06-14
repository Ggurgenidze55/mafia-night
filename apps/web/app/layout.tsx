import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Mafia Night',
  description: 'ონლაინ მულტიპლეიერ მაფია | Online Multiplayer Mafia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#0A0A0F] text-white antialiased" style={{ fontFamily: 'var(--font-inter)' }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
