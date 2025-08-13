import React from 'react';
import { 
  MousePointer2, 
  Palette, 
  BarChart3, 
  Shield, 
  Link2, 
  MessageCircle 
} from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Form Builder',
    description: 'Create intelligent forms with auto-suggestions, smart field detection, and predictive analytics',
    icon: MousePointer2,
    gradient: 'from-blue-500 via-blue-600 to-teal-500',
  },
  {
    title: 'Advanced Brand Studio',
    description: 'Complete design control with live CSS editor, brand kit sync, and white-label solutions',
    icon: Palette,
    gradient: 'from-purple-500 via-blue-500 to-teal-400',
  },
  {
    title: 'Predictive Analytics',
    description: 'Advanced insights with ML-powered conversion predictions and real-time optimization',
    icon: BarChart3,
    gradient: 'from-emerald-500 via-teal-500 to-blue-500',
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-grade security with SOC 2 compliance, end-to-end encryption, and audit trails',
    icon: Shield,
    gradient: 'from-red-500 via-orange-500 to-amber-500',
  },
  {
    title: 'Universal Integrations',
    description: 'Connect with 1000+ apps through native integrations, webhooks, and API endpoints',
    icon: Link2,
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
  },
  {
    title: 'Smart Collaboration',
    description: 'Real-time team collaboration with live editing, comments, and version control',
    icon: MessageCircle,
    gradient: 'from-pink-500 via-purple-500 to-blue-500',
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-teal-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 bg-clip-text text-transparent mb-6">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to create, customize, and optimize forms that convert better and engage your audience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
