import React from 'react';
import RecommendedCourses from './RecommendedCourses';
import WhyChooseUs from './WhyChooseUs';
import Footer from './Footer';
import styles from '../styles/LandingPage.module.css';
import Header from './Header';

export default function Dashboard() {
  // Mock data for enrolled courses
  const enrolledCourses = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      progress: 65,
      lastAccessed: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 2,
      title: 'Node.js Microservices',
      progress: 30,
      lastAccessed: '1 day ago',
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  return (
    <div className={styles.container}>
      <Header />
      <HeroSection />
      <RecommendedCourses />
      <WhyChooseUs />
      <Footer />
      
    </div>
  );
}