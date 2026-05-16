"use client";

import { useState } from "react";

import PresaleStats from "@/components/PresaleStats";
import InvestmentForm from "@/components/InvestmentForm";
import InvestmentHistory from "@/components/InvestmentHistory";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleInvestment = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            The Future of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">
              AI-Powered
            </span>{" "}
            Currency
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Smarter automation, enhanced security, and efficient scalability
            through AI-managed networks
          </p>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Sections 1 & 2 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1: What is ChilledPanda */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                What is ChilledPanda?
              </h2>
              <p className="text-gray-600 mb-4">
                ChilledPanda is a digital currency powered by artificial
                intelligence for optimized trading, security, and decentralized
                decision-making.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    🚀 Smarter Automation
                  </h3>
                  <p className="text-sm text-green-700">
                    AI-driven trading and governance systems
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    🛡️ Enhanced Security
                  </h3>
                  <p className="text-sm text-blue-700">
                    Advanced fraud detection and protection
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">
                    ⚡ Efficient Scalability
                  </h3>
                  <p className="text-sm text-purple-700">
                    AI-managed networks for optimal performance
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">
                    📊 Data-Driven
                  </h3>
                  <p className="text-sm text-orange-700">
                    Continuous improvements through machine learning
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Why Invest */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Why Invest in ChilledPanda?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {[
                    "🔒 Team tokens locked for 2 years",
                    "🔒 Liquidity locked for 1000 days",
                    "💰 Holders will be rewarded",
                    "📱 Game app planned for future",
                    "🤖 AI based utilities",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    "🔥 Auto-burn mechanism",
                    "🛡️ Audit after presale",
                    "❌ No private sale",
                    "📈 Major CEX listing coming",
                    "🌎 Trending worldwide",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Investment Section */}
          <div className="space-y-8">
            <PresaleStats />
            <InvestmentForm
              onInvestment={handleInvestment}
            />
          </div>
        </div>
        {/* Section 4: Tokenomics */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Tokenomics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">10B</div>
              <div className="text-gray-600">Total Supply</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">1B</div>
              <div className="text-gray-600">Team Tokens</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">1B</div>
              <div className="text-gray-600">Pre-sale Tokens</div>
            </div>
          </div>
        </section>

      
{/* About Section */}
<section id="about-section" className="bg-white rounded-xl shadow-lg p-6 mb-8 scroll-mt-20">
  <h2 className="text-2xl font-bold mb-6 text-gray-800">About Chillpanda</h2>
  <div className="space-y-4">
    <p className="text-gray-700">
      Chillpanda is revolutionizing the cryptocurrency landscape by combining 
      artificial intelligence with blockchain technology. Our mission is to 
      create a smarter, more secure, and efficient digital currency that adapts 
      to market conditions in real-time.
    </p>
    <p className="text-gray-700">
      Founded in 2024, Chillpanda leverages advanced machine learning algorithms 
      to optimize trading strategies, enhance security protocols, and ensure 
      scalable performance. Our team of blockchain experts and AI specialists 
      are dedicated to building the future of decentralized finance.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="flex items-start space-x-3">
        <span className="text-green-500 text-xl">✓</span>
        <div>
          <h3 className="font-semibold text-gray-800">AI-Powered Trading</h3>
          <p className="text-sm text-gray-600">Real-time market analysis and automated strategies</p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <span className="text-green-500 text-xl">✓</span>
        <div>
          <h3 className="font-semibold text-gray-800">Community Governed</h3>
          <p className="text-sm text-gray-600">Decisions made by token holders through DAO</p>
        </div>
      </div>
    </div>
  </div>
</section>

        {/* Investment History */}
        <InvestmentHistory
          refreshTrigger={refreshTrigger}
        />

        {/* Section 5: Disclaimer */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-yellow-800">
            Important Disclaimer
          </h2>
          <div className="space-y-3 text-sm text-yellow-700 leading-relaxed">
            <p>
              <strong>
                ChilledPanda ($CPANDA) is a decentralized digital asset project
                that may involve significant financial risk.
              </strong>{" "}
              This content is for informational purposes only and does not
              constitute financial, investment, legal, or tax advice.
              Cryptocurrency markets are highly volatile, and past performance
              is not indicative of future results.
            </p>
            {/* ... rest of disclaimer ... */}
          </div>
        </section>
      </main>
    </div>
  );
}
