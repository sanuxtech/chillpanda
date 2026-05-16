import { Gift, Users, Clock, CheckCircle, Shield } from "lucide-react";

const Airdrop = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 text-gray-900">
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              $CPANDA
            </span>
            <br />
            AIRDROP
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Claim your free ChilledPanda tokens! Limited time offer for early
            supporters.
          </p>
        </div>

        {/* Airdrop Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side - Claim Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Claim Your Tokens</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 mb-2 text-sm font-medium">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your wallet address"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-2 text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="font-semibold text-gray-800">You qualify for:</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    500 $CPANDA
                  </p>
                  <p className="text-sm text-gray-500 mt-1">~$25 USD Value</p>
                </div>

                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-100 shadow-md"
                >
                  CLAIM AIRDROP
                </button>
              </div>
            </div>

            {/* Right Side - Info */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-gray-800">Airdrop Details</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 text-yellow-500 mr-2 shrink-0" />
                    <span className="text-gray-700">Total Airdrop Pool</span>
                  </div>
                  <span className="font-bold text-gray-800">5,000,000 $CPANDA</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-500 mr-2 shrink-0" />
                    <span className="text-gray-700">Participants</span>
                  </div>
                  <span className="font-bold text-gray-800">12,458</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-red-500 mr-2 shrink-0" />
                    <span className="text-gray-700">Time Remaining</span>
                  </div>
                  <span className="font-bold text-red-600">7 Days</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <h4 className="font-bold mb-2 text-gray-800">How to Participate:</h4>
                <ol className="text-sm space-y-2 text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-yellow-500 font-bold">1.</span> Connect your wallet</li>
                  <li className="flex items-center gap-2"><span className="text-yellow-500 font-bold">2.</span> Complete social tasks</li>
                  <li className="flex items-center gap-2"><span className="text-yellow-500 font-bold">3.</span> Verify your account</li>
                  <li className="flex items-center gap-2"><span className="text-yellow-500 font-bold">4.</span> Claim your tokens</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="font-bold mb-2 text-gray-800">Instant Distribution</h4>
            <p className="text-sm text-gray-500">
              Tokens distributed immediately after verification
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <h4 className="font-bold mb-2 text-gray-800">Secure &amp; Safe</h4>
            <p className="text-sm text-gray-500">
              No private keys required, completely secure process
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="font-bold mb-2 text-gray-800">Limited Spots</h4>
            <p className="text-sm text-gray-500">
              Only 10,000 spots available, first come first serve
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Airdrop;
