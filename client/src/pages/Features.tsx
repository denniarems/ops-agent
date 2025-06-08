import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import FeaturesSection from "@/components/FeaturesSection";
import { Link } from "react-router-dom";

const Features = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black z-10"></div>
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#3ABCF7]/20 via-[#8B2FF8]/10 to-transparent blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-text-shimmer bg-[length:200%_auto]">
                AI-Powered Features
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em' }}>
              Transforming cloud operations with intelligent automation and conversational AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] hover:from-[#3ABCF7]/90 hover:to-[#8B2FF8]/90 text-white px-8 py-6 rounded-xl text-lg" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Get Started
              </Button>
              <Link to="/platform">
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white px-8 py-6 rounded-xl text-lg" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Explore Platform <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/95 to-black z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-[#3ABCF7]/20 via-[#8B2FF8]/10 to-transparent blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-r from-[#3ABCF7]/10 to-[#8B2FF8]/10 backdrop-blur-lg rounded-3xl p-10 border border-white/10">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl mb-6" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '0.01em' }}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8]">
                  Ready to transform your cloud operations?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Join the teams already using ZapGap to automate and optimize their infrastructure
              </p>
              <Button className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] hover:from-[#3ABCF7]/90 hover:to-[#8B2FF8]/90 text-white px-8 py-6 rounded-xl text-lg" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            <p>© {new Date().getFullYear()} ZapGap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
