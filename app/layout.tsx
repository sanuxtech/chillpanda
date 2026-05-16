import '@solana/wallet-adapter-react-ui/styles.css';
import { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WalletProviderWrapper } from '@/components/WalletProviderWrapper';

const geistSans = localFont({
  src: "../public/fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../public/fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChilledPanda - AI-Powered Digital Currency",
  description: "ChilledPanda ($CPANDA) — Smarter automation, enhanced security, and efficient scalability through AI-managed networks. Join the presale now.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WalletProviderWrapper>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </WalletProviderWrapper>
      </body>
    </html>
  );
}
