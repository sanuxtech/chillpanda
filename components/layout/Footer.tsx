
const Footer = () => {
  return (
    <footer className="bg-black/50 border-t border-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold">🐼</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              ChilledPanda
            </h2>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-4xl mx-auto mb-8">
            <h3 className="text-xl font-bold text-red-400 mb-4">
              ⚠️ Important Disclaimer
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              ChilledPanda is a decentralized digital asset project that may
              involve significant financial risk. This content is for
              informational purposes only and does not constitute financial,
              investment, legal, or tax advice. Cryptocurrency markets are
              highly volatile, and past performance is not indicative of future
              results.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-3">
              Always conduct your own research (DYOR) and consult with a
              licensed financial advisor before making any investment decisions.
              ChilledPanda makes no guarantees about the value, utility, or
              future success of its token or platform.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-3 font-semibold">
              By engaging with ChilledPanda, you acknowledge that you understand
              the risks involved and take full responsibility for your
              participation.
            </p>
          </div>

          <div className="text-gray-400 text-sm">
            <p>© 2024 ChilledPanda. All rights reserved.</p>
            <p className="mt-2">The future of AI-powered cryptocurrency</p>
          </div> 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
