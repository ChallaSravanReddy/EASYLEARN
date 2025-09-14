// import { useParams } from "react-router-dom";
// import styles from "../styles/CourseSyllabus.module.css";
// const syllabusData = {
//   "JavaScript": [
//     "Introduction to JavaScript",
//     "Variables & Data Types",
//     "Functions and Scope",
//     "DOM Manipulation",
//     "ES6+ Features",
//     "Projects: Build Interactive Web Pages"
//   ],
//   "Python Programming": [
//     "Python Basics",
//     "Data Structures",
//     "OOP in Python",
//     "File Handling & Modules",
//     "Libraries: NumPy, Pandas",
//     "Project: Data Analysis App"
//   ],
//   "Java Programming": [
//     "Java Basics",
//     "Classes & Objects",
//     "Collections Framework",
//     "Exception Handling",
//     "Multithreading",
//     "Project: Console-based Application"
//   ],
//   "C Programming Fundamentals": [
//     "Introduction to C",
//     "Control Statements",
//     "Functions & Pointers",
//     "Arrays & Strings",
//     "Structures",
//     "Mini Project: Banking System"
//   ],
//   "Full Stack Web Development": [
//     "HTML, CSS, JavaScript",
//     "React.js Frontend",
//     "Node.js + Express.js Backend",
//     "Databases: MongoDB",
//     "Authentication & Authorization",
//     "Final Project: Full MERN App"
//   ]
// };

// export default function CourseSyllabus() {
//   const { courseName } = useParams();
//   const decodedName = decodeURIComponent(courseName);
//   const syllabus = syllabusData[decodedName];

//   if (!syllabus) {
//     return <h2>Course not found</h2>;
//   }

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>{decodedName} Syllabus</h2>
//       <ul>
//         {syllabus.map((topic, index) => (
//           <li key={index}>{topic}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/CourseSyllabus.module.css";

const syllabusData = {
  "JavaScript": [
    "Introduction to JavaScript",
    "Variables & Data Types",
    "Functions and Scope",
    "DOM Manipulation",
    "ES6+ Features",
    "Projects: Build Interactive Web Pages"
  ],
  "Python Programming": [
    "Python Basics",
    "Data Structures",
    "OOP in Python",
    "File Handling & Modules",
    "Libraries: NumPy, Pandas",
    "Project: Data Analysis App"
  ],
  "Java Programming": [
    "Java Basics",
    "Classes & Objects",
    "Collections Framework",
    "Exception Handling",
    "Multithreading",
    "Project: Console-based Application"
  ],
  "C Programming Fundamentals": [
    "Introduction to C",
    "Control Statements",
    "Functions & Pointers",
    "Arrays & Strings",
    "Structures",
    "Mini Project: Banking System"
  ],
  "Full Stack Web Development": [
    "HTML, CSS, JavaScript",
    "React.js Frontend",
    "Node.js + Express.js Backend",
    "Databases: MongoDB",
    "Authentication & Authorization",
    "Final Project: Full MERN App"
  ]
};

export default function CourseSyllabus() {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(courseName);
  const syllabus = syllabusData[decodedName];

  if (!syllabus) {
    return <h2 className={styles.notFound}>Course not found</h2>;
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate("/")}>
        ⬅ Back to Courses
      </button>

      <h1 className={styles.title}>{decodedName} Syllabus</h1>

              <ul className={styles.syllabusList}>
          {syllabus.map((topic, index) => {
            const isIntroJS =
              decodedName === "JavaScript" && topic === "Introduction to JavaScript";

            return (
              <li
                key={index}
                className={styles.syllabusItem}
                onClick={() => {
                  if (isIntroJS) {
                    navigate("/course/javascript/introduction");
                  }
                }}
                style={{ cursor: isIntroJS ? "pointer" : "default", color: isIntroJS ? "blue" : "inherit" }}
              >
                <span className={styles.step}>{index + 1}</span>
                {topic}
              </li>
            );
          })}
        </ul>

    </div>
  );
}
