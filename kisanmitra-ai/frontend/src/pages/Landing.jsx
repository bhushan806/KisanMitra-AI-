import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import TrustSection from '../components/landing/TrustSection';
import ServicesSection from '../components/landing/ServicesSection';
import WhySection from '../components/landing/WhySection';
import HowItWorks from '../components/landing/HowItWorks';
import LiveFeatures from '../components/landing/LiveFeatures';
import AIModelsSection from '../components/landing/AIModelsSection';
import ScreenshotsSection from '../components/landing/ScreenshotsSection';
import StatisticsSection from '../components/landing/StatisticsSection';
import Testimonials from '../components/landing/Testimonials';
import FAQSection from '../components/landing/FAQSection';
import Footer from '../components/landing/Footer';

const Landing = () => {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-white text-gray-900 font-body">
      <Navbar />
      <main>
        <HeroSection />
        <TrustSection />
        <ServicesSection />
        <WhySection />
        <HowItWorks />
        <LiveFeatures />
        <AIModelsSection />
        <ScreenshotsSection />
        <StatisticsSection />
        <Testimonials />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
