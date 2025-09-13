import React from "react";
import styles from "../styles/HeroSection.module.css";
import FullStackImage from "../assets/Full_Stack.png";

export default function HeroSection() {
  return (
    <div className={styles.heroBanner}>
      <div className={styles.bannerLeft}>
        <h1 className={styles.bannerTitle}>Best Course: Full Stack Development</h1>
        <p className={styles.bannerDesc}>
          Master web development from front-end to back-end with our top-rated Full Stack course.
          Learn modern technologies, build real-world projects, and boost your career!
        </p>
        <button className={styles.enrollBtn}>Enroll Now</button>
      </div>
      <div className={styles.bannerRight}>
        <img
          src={FullStackImage}
          alt="Full Stack Course"
          className={styles.bannerImage}s
        />
      </div>
    </div>
  );
}