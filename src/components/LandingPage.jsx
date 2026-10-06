import React from "react";
import HeroSection from "./HeroSection";
import SocialProof from "./SocialProof";
import RecommendedCourses from "./RecommendedCourses";
import WhyChooseUs from "./WhyChooseUs";

export default function LandingPage() {
  return (
    <div className="w-full flex flex-col space-y-4">
      <HeroSection />
      <SocialProof />
      <RecommendedCourses />
      <WhyChooseUs />
    </div>
  );
}
