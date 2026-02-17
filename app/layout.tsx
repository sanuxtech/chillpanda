// layout.tsx - UPDATED VERSION
import '@solana/wallet-adapter-react-ui/styles.css';
import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import StyledJsxRegistry from "./registry";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WalletProviderWrapper } from "./WalletProviderWrapper"; // 👈 CHANGE THIS

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChilledPanda - AI-Powered Digital Currency",
  description: "ChilledPanda - Smarter automation, enhanced security, efficient scalability",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`flex-1 ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StyledJsxRegistry>
          <GluestackUIProvider mode="light">
            <WalletProviderWrapper> {/* 👈 USE THE NEW WRAPPER */}
              <div className="h-screen w-screen overflow-hidden overflow-y-scroll flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </WalletProviderWrapper>
          </GluestackUIProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}