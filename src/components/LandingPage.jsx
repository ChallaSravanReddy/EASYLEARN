import React from "react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar";
import WhyChooseUs from "./WhyChooseUs";
import HeroSection from './HeroSection';
import RecommendedCourses from './RecommendedCourses';
// import WhyChooseUs from './WhyChooseUs';
import Footer from './Footer';
import styles from '../styles/LandingPage.module.css';


export default function LandingPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      {/* <Navbar /> */}
      {/* <Header search={search} setSearch={setSearch} handleLogin={handleLogin} /> */}
      <HeroSection />
      <RecommendedCourses />
      <WhyChooseUs />
    </div>
  );
}
