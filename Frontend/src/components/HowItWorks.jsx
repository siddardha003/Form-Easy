import React, { useState, useEffect, useRef } from 'react';
import { FileText, Palette, Rocket, ArrowRight, CheckCircle, Play } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Choose Template',
    description: 'Select from our library of 100+ professionally designed templates or start with a blank canvas tailored to your industry.',
    icon: FileText,
    features: ['Industry-specific templates', 'Mobile-optimized designs', 'Accessibility compliant'],
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    delay: 0
  },
  {
    number: '02',
    title: 'Customize Design',
    description: 'Use our intuitive drag-and-drop editor to customize every element. Match your brand perfectly with advanced styling options.',
    icon: Palette,
    features: ['Visual drag-and-drop editor', 'Brand color matching', 'Custom CSS support'],
    color: 'from-blue-500 to-teal-400',
    bgColor: 'bg-blue-50',
    delay: 200
  },
  {
    number: '03',
    title: 'Deploy & Analyze',
    description: 'Launch your form instantly and track performance with real-time analytics. Optimize conversions with A/B testing built-in.',
    icon: Rocket,
    features: ['One-click deployment', 'Real-time analytics', 'A/B testing tools'],
    color: 'from-teal-400 to-teal-500',
    bgColor: 'bg-teal-50',
    delay: 400
  }
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="py-20 md:py-28 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              From Concept to Live Form
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                In Under 5 Minutes
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our streamlined workflow eliminates complexity while giving you professional results. 
              No coding required, no design skills needed.
            </p>
          </div>
        </div>

        {/* Interactive timeline */}
        <div className="relative mb-16">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
          <div 
            className="hidden md:block absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-400 transform -translate-y-1/2 transition-all duration-1000 ease-out"
            style={{ width: isVisible ? '100%' : '0%' }}
          ></div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              
              return (
                <div 
                  key={index}
                  className={`transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${step.delay}ms` }}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  {/* Step card */}
                  <div className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer border-2 ${
                    isActive ? 'border-blue-200 scale-105' : 'border-transparent hover:border-gray-100'
                  }`}>
                    
                    {/* Step number circle */}
                    <div className="absolute -top-6 left-8">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Features list */}
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Arrow connector */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                        <ArrowRight className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className={`text-center transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-gradient-to-r from-blue-500 to-teal-400 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to experience the simplicity?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join over 50,000 businesses who have streamlined their form creation process with our platform.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg">
              Start Building Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;