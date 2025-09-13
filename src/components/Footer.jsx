import React from "react";
import styles from "../styles/Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <h2 className={styles.logo}>NEXT STEP</h2>
        <p className={styles.cta}>Get started now try our product</p>
        <form className={styles.form}>
          <input
            type="email"
            placeholder="Enter your email here"
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            <span>&rarr;</span>
          </button>
        </form>
        <p className={styles.copyright}>© 2025 EdA. All rights reserved.</p>
      </div>
      <div className={styles.right}>
        <div className={styles.links}>
          <h4>Quick Links</h4>
          <ul>
            <li>Home</li>
            <li>Courses</li>
            <li>About Us</li>
            <li>Blog</li>
            <li>Contact</li>
          </ul>
        </div>
        <div className={styles.support}>
          <h4>Support</h4>
          <ul>
            <li>Help center</li>
            <li>FAQs</li>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
            <li>Report a Problem</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;