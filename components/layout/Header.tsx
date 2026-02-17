// components/layout/Header.tsx - SIMPLIFIED
"use client";

import Link from "next/link";
import { CustomWalletButton } from "@/components/CustomWalletButton"; // Make sure this import is correct

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">🐼</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Chillpanda
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8"> 
            <Link href="/" className="text-gray-700 hover:text-green-500 transition-colors font-medium">
              Home
            </Link>
            <Link href="/airdrop" className="text-gray-700 hover:text-green-500 transition-colors font-medium">
              Airdrop
            </Link>
            <Link href="/app" className="text-gray-700 hover:text-green-500 transition-colors font-medium">
              Main App
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-green-500 transition-colors font-medium">
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