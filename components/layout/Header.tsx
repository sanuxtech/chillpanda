"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const CustomWalletButton = dynamic(
  () => import("@/components/CustomWalletButton").then((m) => m.CustomWalletButton),
  {
    ssr: false,
    loading: () => (
      <button type="button" disabled className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold opacity-70 cursor-wait flex items-center gap-2">
        Connect Wallet
      </button>
    ),
  }
);

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/airdrop", label: "Airdrop" },
  { href: "/about", label: "About" },
];

const Header = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-black font-bold text-lg">🐼</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Chillpanda
            </h1>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition-colors font-medium ${
                  pathname === href
                    ? "text-green-500"
                    : "text-gray-700 hover:text-green-500"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <CustomWalletButton />
            </div>

            <button
              type="button"
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-3 pt-4">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-2 py-1 rounded transition-colors font-medium ${
                    pathname === href
                      ? "text-green-500"
                      : "text-gray-700 hover:text-green-500"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <CustomWalletButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
