// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CustomWalletButton } from "@/components/CustomWalletButton";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand Section */}
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">🐼</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Chillpanda
            </h1>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`transition-colors font-medium ${
                pathname === '/' 
                  ? 'text-green-500' 
                  : 'text-gray-700 hover:text-green-500'
              }`}
            >
              Home
            </Link>
            
            <Link 
              href="/airdrop" 
              className={`transition-colors font-medium ${
                pathname === '/airdrop' 
                  ? 'text-green-500' 
                  : 'text-gray-700 hover:text-green-500'
              }`}
            >
              Airdrop
            </Link>
            
            <Link 
              href="/about" 
              className={`transition-colors font-medium ${
                pathname === '/about' 
                  ? 'text-green-500' 
                  : 'text-gray-700 hover:text-green-500'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Wallet Connection */}
          <CustomWalletButton />
        </div>
      </div>
    </header>
  );
};

export default Header;