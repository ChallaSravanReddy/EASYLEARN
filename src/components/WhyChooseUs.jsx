// src/components/WhyChooseUs.jsx
import React from "react";
import styles from "../styles/WhyChooseUs.module.css";

export default function WhyChooseUs() {
  return (
    <div className={styles.container}>
      <h2>Why Choose Our Platform?</h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Expert Instructors</h3>
          <p>Learn from industry leaders with years of experience and practical knowledge.</p>
        </div>
        <div className={styles.card}>
          <h3>Hands-on Projects</h3>
          <p>Work on real-world projects to build a strong portfolio and gain practical skills.</p>
        </div>
        <div className={styles.card}>
          <h3>Flexible Learning</h3>
          <p>Access courses anytime, anywhere, and learn at your own pace without stress.</p>
        </div>
      </div>
    </div>
  );
}
