// src/components/WhyChooseUs.jsx
import React from "react";
import styles from "../styles/WhyChooseUs.module.css";

export default function WhyChooseUs() {
  return (
    <div className={styles.container}>
      <h2>Why Choose Our Platform?</h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Learn by Doing, Not Just Watching</h3>
          <p>Unlike traditional video courses, our platform makes learning interactive — code alongside the lesson, run it instantly, and see results in real time.</p>
        </div>
        <div className={styles.card}>
          <h3>Interactive Video Lessons</h3>
          <p>Pause, edit, and practice directly inside the video flow. No more passive watching — you code, you learn.</p>
        </div>
        <div className={styles.card}>
          <h3>Mid-Lesson Challenges</h3>
          <p>Stay engaged with checkpoints: quizzes, coding tasks, and real-world exercises that ensure you understand before moving forward.</p>
        </div>
        <div className={styles.card}>
          <h3>Learn, Share, and Collaborate</h3>
          <p>Pair-program with friends or join coding rooms to build projects together. Learning becomes a team experience.</p>
        </div>
      </div>
    </div>
  );
}
