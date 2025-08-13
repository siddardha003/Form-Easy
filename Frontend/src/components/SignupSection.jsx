import React, { useState } from 'react';
import { ArrowRight, Check, Star, Users, TrendingUp } from 'lucide-react';

const SignupSection = () => {
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Social proof badges */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Users className="w-4 h-4" />
              <span>50K+ Active Users</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>99.9% Uptime</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Business{' '}
            <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              Starting Today
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join industry leaders who've streamlined their data collection and boosted conversion rates by 340% with our intelligent form builder platform.
          </p>
        </div>

        {/* Enhanced CTA section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left side - Benefits */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Everything you need included:
                </h3>
                {[
                  'Advanced analytics & insights',
                  'Custom branding & themes',
                  'Real-time collaboration',
                  'Enterprise-grade security',
                  '24/7 priority support'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Right side - CTAs */}
              <div className="space-y-4">
                <button
                  onMouseEnter={() => setHoveredButton('primary')}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="w-full group relative bg-gradient-to-r from-blue-500 to-teal-400 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Your 14-Day Free Trial
                    <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${hoveredButton === 'primary' ? 'translate-x-1' : ''}`} />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <button
                  onMouseEnter={() => setHoveredButton('secondary')}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="w-full group border-2 border-blue-500 text-blue-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-50 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    View Live Demo
                    <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${hoveredButton === 'secondary' ? 'translate-x-1' : ''}`} />
                  </span>
                </button>

                <p className="text-sm text-gray-500 text-center mt-4">
                  No credit card required • Cancel anytime • Setup in 2 minutes
                </p>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-6">Trusted by teams at</p>
            <div className="flex justify-center items-center gap-12 opacity-60">
              {/* Placeholder for company logos */}
              {['Google', 'Microsoft', 'Spotify', 'Airbnb', 'Stripe'].map((company) => (
                <div key={company} className="text-gray-500 font-semibold text-lg">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupSection;