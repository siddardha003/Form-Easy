import React, { useRef, useState, useEffect } from 'react';
import { 
  MousePointer2, 
  Palette, 
  BarChart3, 
  Shield, 
  Link2, 
  MessageCircle,
  Sparkles,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';
import { useScroll, useTransform, motion, useInView } from 'framer-motion';

const features = [
  {
    title: 'AI-Powered Form Builder',
    description: 'Create intelligent forms with auto-suggestions, smart field detection, and predictive analytics',
    icon: MousePointer2,
    gradient: 'from-blue-500 via-blue-600 to-teal-500',
    stats: '40% faster creation',
    benefits: ['Smart field suggestions', 'Auto-layout optimization', 'Voice-to-form conversion'],
    demo: 'ai-builder'
  },
  {
    title: 'Advanced Brand Studio',
    description: 'Complete design control with live CSS editor, brand kit sync, and white-label solutions',
    icon: Palette,
    gradient: 'from-purple-500 via-blue-500 to-teal-400',
    stats: '100+ design templates',
    benefits: ['Live CSS editor', 'Brand kit integration', 'White-label options'],
    demo: 'brand-studio'
  },
  {
    title: 'Predictive Analytics',
    description: 'Advanced insights with ML-powered conversion predictions and real-time optimization',
    icon: BarChart3,
    gradient: 'from-emerald-500 via-teal-500 to-blue-500',
    stats: '89% accuracy rate',
    benefits: ['Conversion predictions', 'Heatmap analysis', 'A/B testing suite'],
    demo: 'analytics'
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-grade security with SOC 2 compliance, end-to-end encryption, and audit trails',
    icon: Shield,
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    stats: '99.99% uptime SLA',
    benefits: ['SOC 2 certified', 'Zero-trust architecture', 'Advanced threat detection'],
    demo: 'security'
  },
  {
    title: 'Universal Integrations',
    description: 'Connect with 500+ apps through native integrations, webhooks, and powerful REST API',
    icon: Link2,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    stats: '500+ integrations',
    benefits: ['Native app connections', 'Custom webhooks', 'GraphQL API'],
    demo: 'integrations'
  },
  {
    title: 'Expert Success Team',
    description: 'Dedicated success managers, priority support, and comprehensive onboarding',
    icon: MessageCircle,
    gradient: 'from-teal-500 via-green-500 to-emerald-500',
    stats: '<2min response time',
    benefits: ['Dedicated success manager', 'Priority queue', '24/7 live chat'],
    demo: 'support'
  }
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const headerY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Auto-cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative py-20 md:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Enhanced Header */}
        <motion.div 
          style={{ y: headerY }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm text-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-blue-100 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            <span>Cutting-Edge Technology Stack</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-xs text-gray-600">4.9/5</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight"
          >
            Features That
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
              Transform Workflows
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12"
          >
            Experience the next generation of form building with AI-powered tools, 
            enterprise-grade security, and seamless integrations.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 mb-16"
          >
            {[
              { icon: Users, label: '50K+ Users', value: '50,000+' },
              { icon: TrendingUp, label: 'Conversion Rate', value: '+340%' },
              { icon: Star, label: 'Customer Rating', value: '4.9/5' }
            ].map((stat, index) => (
              <div key={index} className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Interactive Feature Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
              isActive={activeFeature === index}
              isHovered={hoveredCard === index}
              onHover={() => setHoveredCard(index)}
              onLeave={() => setHoveredCard(null)}
              onClick={() => setActiveFeature(index)}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${features[activeFeature].gradient} flex items-center justify-center shadow-lg`}>
                  {React.createElement(features[activeFeature].icon, { className: "w-8 h-8 text-white" })}
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {features[activeFeature].title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-semibold text-sm">
                      {features[activeFeature].stats}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {features[activeFeature].description}
              </p>

              <div className="space-y-3 mb-8">
                {features[activeFeature].benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-4">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
                  Try This Feature
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:border-blue-300 hover:text-blue-600 transition-all duration-300">
                  View Demo
                </button>
              </div>
            </div>

            {/* Interactive Demo Preview */}
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-inner">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                  <motion.div
                    key={activeFeature}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`w-24 h-24 rounded-2xl bg-gradient-to-r ${features[activeFeature].gradient} flex items-center justify-center shadow-2xl`}
                  >
                    {React.createElement(features[activeFeature].icon, { className: "w-12 h-12 text-white" })}
                  </motion.div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live Demo</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Navigation */}
        <div className="flex justify-center mt-12">
          <div className="flex gap-2 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-gray-100">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeFeature === index
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index, isActive, isHovered, onHover, onLeave, onClick, isInView }) => {
  const Icon = feature.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`relative group cursor-pointer transition-all duration-500 ${
        isActive ? 'scale-105' : 'hover:scale-105'
      }`}
    >
      <div className={`relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-500 ${
        isActive 
          ? 'border-blue-300 shadow-2xl bg-white/90' 
          : 'border-gray-100 hover:border-blue-200 shadow-lg hover:shadow-xl'
      }`}>
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 blur-xl transition-opacity duration-500 ${
          isActive || isHovered ? 'opacity-20' : ''
        }`}></div>
        
        <div className="relative">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 transition-transform duration-300 ${
            isHovered ? 'scale-110 rotate-3' : ''
          }`}>
            <Icon className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {feature.title}
          </h3>
          
          <p className="text-gray-600 mb-4 leading-relaxed">
            {feature.description}
          </p>

          {/* Stats badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-semibold text-sm">{feature.stats}</span>
            </div>
            
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>

          {/* Benefits list */}
          <div className="space-y-2 mb-6">
            {feature.benefits.slice(0, 2).map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Learn more link */}
          <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
            <span>Learn more</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FeaturesSection;