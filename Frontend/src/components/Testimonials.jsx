import React, { useState, useEffect, useRef } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight, Play, TrendingUp, Users, Award } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechCorp',
    content: 'This form builder has revolutionized how we collect customer feedback. The interface is intuitive and the results are beautiful. Our team productivity increased by 60% within the first month.',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    rating: 5,
    metric: '60% productivity boost',
    industry: 'Technology',
    companySize: '500+ employees',
    featured: true
  },
  {
    name: 'Mike Chen',
    role: 'Product Manager',
    company: 'StartupXYZ',
    content: 'We switched from our old form solution and saw a 40% increase in completion rates. The analytics are incredibly detailed and actionable. ROI was evident within weeks.',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    rating: 5,
    metric: '40% higher completion rates',
    industry: 'SaaS',
    companySize: '50-200 employees',
    featured: false
  },
  {
    name: 'Emily Davis',
    role: 'UX Designer',
    company: 'DesignStudio',
    content: 'The customization options are endless. We can match our exact brand guidelines and create forms that feel native to our site. Client satisfaction scores improved dramatically.',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    rating: 5,
    metric: '95% client satisfaction',
    industry: 'Design Agency',
    companySize: '10-50 employees',
    featured: false
  },
  {
    name: 'David Rodriguez',
    role: 'Head of Operations',
    company: 'GlobalCorp',
    content: 'Enterprise-grade security with consumer-friendly UX. Our compliance team was impressed, and end users love the seamless experience. Deployment across 15 countries was effortless.',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    rating: 5,
    metric: '15 countries deployed',
    industry: 'Enterprise',
    companySize: '10,000+ employees',
    featured: true
  },
  {
    name: 'Lisa Wang',
    role: 'Growth Marketing Lead',
    company: 'FastGrow',
    content: 'The A/B testing features helped us optimize our lead gen forms. Conversion rates jumped 85% and lead quality improved significantly. The insights dashboard is a game-changer.',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    rating: 5,
    metric: '85% conversion increase',
    industry: 'Marketing',
    companySize: '100-500 employees',
    featured: false
  }
];

const stats = [
  { label: 'Customer Satisfaction', value: '98.5%', icon: Users },
  { label: 'Average Rating', value: '4.9/5', icon: Star },
  { label: 'Industry Awards', value: '12+', icon: Award }
];

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [visibleCards, setVisibleCards] = useState([]);
  const sectionRef = useRef(null);
  const intervalRef = useRef(null);

  const featuredTestimonials = testimonials.filter(t => t.featured);
  const regularTestimonials = testimonials.filter(t => !t.featured);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          testimonials.forEach((_, index) => {
            setTimeout(() => {
              setVisibleCards(prev => [...prev, index]);
            }, index * 150);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % featuredTestimonials.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, featuredTestimonials.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % featuredTestimonials.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <section ref={sectionRef} id="testimonials" className="py-20 md:py-28 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Quote className="w-4 h-4" />
            Customer Success Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Trusted by Industry
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              Leaders Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From startups to Fortune 500 companies, see how our platform drives measurable results across industries.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-teal-400 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Featured Testimonials Carousel */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Featured Success Stories</h3>
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="relative h-96 flex items-center">
                {featuredTestimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 p-12 flex items-center transition-all duration-700 ${
                      index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                    }`}
                  >
                    <div className="grid md:grid-cols-2 gap-8 items-center w-full">
                      <div>
                        <div className="flex items-center mb-6">
                          <Quote className="w-8 h-8 text-blue-500 mr-3" />
                          <div className="flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <blockquote className="text-xl text-gray-700 mb-6 leading-relaxed italic">
                          "{testimonial.content}"
                        </blockquote>
                        <div className="bg-blue-50 rounded-xl p-4 mb-6">
                          <div className="flex items-center gap-2 text-blue-700 font-semibold">
                            <TrendingUp className="w-4 h-4" />
                            <span>{testimonial.metric}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-blue-100"
                        />
                        <h4 className="text-xl font-bold text-gray-900 mb-1">{testimonial.name}</h4>
                        <p className="text-blue-600 font-medium mb-2">{testimonial.role}</p>
                        <p className="text-gray-600 mb-2">{testimonial.company}</p>
                        <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                          {testimonial.industry} • {testimonial.companySize}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel controls */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>

            {/* Carousel dots */}
            <div className="flex justify-center mt-6 gap-2">
              {featuredTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-blue-500 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Regular Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {regularTestimonials.map((testimonial, index) => {
            const isVisible = visibleCards.includes(index + featuredTestimonials.length);
            return (
              <div
                key={index}
                className={`bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-700 border border-gray-100 group hover:-translate-y-2 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-4 ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-blue-600 font-medium">{testimonial.role}</p>
                    <p className="text-gray-500 text-sm">{testimonial.company}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700 font-medium text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>{testimonial.metric}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                  <span>{testimonial.industry}</span>
                  <span>{testimonial.companySize}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Video testimonials CTA */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-teal-400 rounded-3xl p-12 text-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Play className="w-6 h-6" />
              <span className="font-medium">Watch Customer Stories</span>
            </div>
            <h3 className="text-3xl font-bold mb-4">
              See how industry leaders transform their workflows
            </h3>
            <p className="text-blue-100 mb-8 text-lg">
              Get an inside look at real implementations and results from our enterprise customers.
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              Watch Video Case Studies
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;