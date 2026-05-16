const About = () => {
  return (
    <section id="about" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
          🐼
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
          What is{" "}
          <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
            ChilledPanda
          </span>
          ?
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
          ChilledPanda is a digital currency powered by artificial intelligence
          for optimized trading, security, and decentralized decision-making.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-12 text-left">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-semibold mb-4 text-green-600">
              Why It&apos;s Good:
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                Smarter automation (trading, governance)
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                Fraud detection and enhanced security
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                Efficient scalability through AI-managed networks
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                Data-driven improvements over time
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 shadow-sm">
            <h3 className="text-2xl font-semibold mb-4 text-blue-600">
              AI-Powered Features
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                Intelligent Trading Algorithms
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                Automated Risk Management
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                Predictive Market Analysis
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                Decentralized AI Governance
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { emoji: "🚀", title: "Smart Automation", desc: "AI-driven trading and governance" },
            { emoji: "🛡️", title: "Enhanced Security", desc: "Advanced fraud detection and protection" },
            { emoji: "📈", title: "Scalable Performance", desc: "AI-managed networks for optimal output" },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="text-4xl mb-3">{emoji}</div>
              <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
