import { useEffect } from 'react';
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection';
import SignupSection from '../components/SignupSection';
import HowItWorks from '../components/HowItWorks';
import FeaturesSection from '../components/FeaturesSection-Simple';
import TestimonialsSection from '../components/Testimonials';
import Footer from '../components/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';

const HomePage = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  return (
    <div className="font-sans antialiased text-gray-900">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <TestimonialsSection />
      <SignupSection />
      <Footer />
    </div>
  );
};

export default HomePage;