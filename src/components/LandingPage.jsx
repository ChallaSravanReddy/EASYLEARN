import React from "react";
import WhyChooseUs from "./WhyChooseUs";
import HeroSection from './HeroSection';
import RecommendedCourses from './RecommendedCourses';
import styles from '../styles/LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <HeroSection />
      <RecommendedCourses />
      <WhyChooseUs />
    </div>
  );
}
