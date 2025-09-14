import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/RecommendedCourses.module.css";
import javascriptImg from "../assets/javascript.png";
import pythonImg from "../assets/python.png";
import javaImg from "../assets/java.png";
import cImg from "../assets/cprogram.jpg";
import fullStackImg from "../assets/fullstackcor.png";


const courses = [
  { name: "JavaScript", instructor: "Mark Wilson", rating: "4.7", duration: "6h 15m", level: "Beginner", img: javascriptImg },
  { name: "Python Programming", instructor: "Emma Clark", rating: "4.8", duration: "9h", level: "Intermediate", img: pythonImg },
  { name: "Java Programming", instructor: "Nina Patel", rating: "4.6", duration: "8h 00m", level: "Beginner", img: javaImg },
  { name: "C Programming Fundamentals", instructor: "James Anderson", rating: "4.5", duration: "7h 45m", level: "Beginner", img: cImg },
  { name: "Full Stack Web Development", instructor: "Robert Singh", rating: "4.9", duration: "20h 00m", level: "Advanced", img: fullStackImg }
];

export default function RecommendedCourses() {
  const navigate = useNavigate();

  const handleLearnClick = (courseName) => {
    navigate(`/course/${encodeURIComponent(courseName)}`);
  };

  const handleCardClick = (courseName) => {
    navigate(`/course/${encodeURIComponent(courseName)}`);
  };

  return (
    <div className={styles.recommended}>
      <h3>Recommended Courses</h3>
      <p>  </p>
      <p> </p>
      <div className={styles.cards}>
        {courses.map((course, index) => (
          <div
            className={styles.card}
            key={index}
            onClick={() => handleCardClick(course.name)}
            style={{ cursor: "pointer" }}
          >
            <img src={course.img} alt={course.name} />
            <div className={styles.info}>
              <p className={styles.instructor}>{course.instructor}</p>
              <h4>{course.name}</h4>
              <div className={styles.details}>
                <span>⭐ {course.rating}</span>
                <span>{course.duration}</span>
                <span>{course.level}</span>
              </div>
              <button
                className={styles.learnButton}
                onClick={e => {
                  e.stopPropagation();
                  handleLearnClick(course.name);
                }}
              >
                Learn
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className={styles.seeMore}>See more</button>
    </div>
  );
}