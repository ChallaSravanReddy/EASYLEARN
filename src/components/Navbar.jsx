import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Navbar.module.css";
import userImg from "../assets/user.jpg";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <h2 className={styles.logo}>EASY LEARN</h2>
        <input
          type="text"
          placeholder="What do you want to learn"
          className={styles.search}
        />
        <button className={styles.searchBtn}>→</button>
      </div>
      <div className={styles.right}>
        <a href="#" className={styles.link}>Home</a>
        <a href="#" className={styles.link}>Dashboard</a>
        <a href="#" className={styles.link}>My Courses</a>
        <span className={styles.notification}>🔔</span>
        <img
          src={userImg}
          alt="user"
          className={styles.avatar}
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        />
        <Link to="/login">
          <button className={styles.loginBtn}>Login</button>
        </Link>
      </div>
    </nav>
  );
}