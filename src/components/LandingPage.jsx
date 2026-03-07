import React from "react";
import HeroSection from './HeroSection';
import RecommendedCourses from './RecommendedCourses';
import WhyChooseUs from "./WhyChooseUs";

export default function LandingPage() {
  return (
    <div className="space-y-0 max-w-screen-xl mx-auto">
      <HeroSection />
      <RecommendedCourses />
      <WhyChooseUs />
    </div>
  );
}
