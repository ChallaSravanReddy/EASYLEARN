// import React from "react";
// import { useNavigate } from "react-router-dom";
// import styles from "../styles/Profile.module.css";

// const Profile = () => {
//   const navigate = useNavigate();

//   const user = {
//     name: "Arjun Roy",
//     location: "India",
//     membership: "Pro Learner",
//     xp: 850,
//     streak: 20,
//     courses: [
//       { title: "React Basics", progress: 70 },
//       { title: "Python Chatbots", progress: 40 },
//       { title: "UI/UX Design", progress: 20 },
//     ],
//     badges: ["🏅 Top Learner", "📚 Consistent Coder"],
//   };

//   return (
//     <div className={styles.profile}>
//       {/* Header Section */}
//       <div className={styles.header}>
//         <span className={styles.avatar}>👤</span>
//         <div className={styles.userInfo}>
//           <h2>{user.name}</h2>
//           <p>{user.location}</p>
//           <p>Membership: <strong>{user.membership}</strong></p>
//         </div>
//         <button className={styles.editBtn}>Edit Profile</button>
//       </div>

//       {/* Learning Overview */}
//       <div className={styles.overview}>
//         <div className={styles.stat}>
//           <h3>{user.xp}</h3>
//           <p>XP Earned</p>
//         </div>
//         <div className={styles.stat}>
//           <h3>{user.streak} days</h3>
//           <p>Learning Streak</p>
//         </div>
//         <div className={styles.stat}>
//           <h3>{user.badges.length}</h3>
//           <p>Badges</p>
//         </div>
//       </div>

//       {/* Courses Progress */}
//       <div className={styles.courses}>
//         <h3>Courses In Progress</h3>
//         {user.courses.map((course, index) => (
//           <div key={index} className={styles.course}>
//             <p>{course.title}</p>
//             <div className={styles.progressBar}>
//               <div style={{ width: `${course.progress}%` }}></div>
//             </div>
//             <small>{course.progress}% completed</small>
//           </div>
//         ))}
//       </div>

//       {/* Why Learn Here */}
//       <div className={styles.features}>
//         <h3>Why Learn Here?</h3>
//         <ul>
//           <li>Interactive lessons with instant feedback</li>
//           <li>Track progress with XP and badges</li>
//           <li>Collaborate and learn from peers</li>
//           <li>Build skills ready for real projects</li>
//         </ul>
//       </div>

//       {/* Actions */}
//       <div className={styles.actions}>
//         <button>Edit Profile</button>
//         <button>Account Settings</button>
//         <button onClick={() => navigate("/login")}>Logout</button>
//       </div>
//     </div>
//   );
// };

// export default Profile;
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Profile.module.css";

const Profile = () => {
  const navigate = useNavigate();

  const user = {
    name: "Arjun Roy",
    location: "India",
    membership: "Pro Learner",
    xp: 850,
    streak: 20,
    courses: [
      { title: "React Basics", progress: 70 },
      { title: "Python Chatbots", progress: 40 },
      { title: "UI/UX Design", progress: 20 },
    ],
    badges: ["🏅 Top Learner", "📚 Consistent Coder"],
    assignments: {
      attempted: 15,
      completed: 12,
      totalScore: 820,
      averageScore: 68,
    },
  };

  return (
    <div className={styles.profile}>
      {/* Header Section */}
      <div className={styles.header}>
        <span className={styles.avatar}>👤</span>
        <div className={styles.userInfo}>
          <h2>{user.name}</h2>
          <p>{user.location}</p>
          <p>Membership: <strong>{user.membership}</strong></p>
        </div>
        {/* <button className={styles.editBtn}>Edit Profile</button> */}
      </div>

      {/* Learning Overview */}
      <div className={styles.overview}>
        <div className={styles.stat}>
          <h3>{user.xp}</h3>
          <p>XP Earned</p>
        </div>
        <div className={styles.stat}>
          <h3>{user.streak} days</h3>
          <p>Learning Streak</p>
        </div>
        <div className={styles.stat}>
          <h3>{user.badges.length}</h3>
          <p>Badges</p>
        </div>
      </div>

      {/* Courses Progress */}
      <div className={styles.courses}>
        <h3>Courses In Progress</h3>
        {user.courses.map((course, index) => (
          <div key={index} className={styles.course}>
            <p>{course.title}</p>
            <div className={styles.progressBar}>
              <div style={{ width: `${course.progress}%` }}></div>
            </div>
            <small>{course.progress}% completed</small>
          </div>
        ))}
      </div>

      {/* Assignments Section */}
      <div className={styles.assignments}>
        <h3>Assignments Attempted</h3>
        <div className={styles.assignmentStats}>
          <div>
            <h4>{user.assignments.attempted}</h4>
            <p>Attempted</p>
          </div>
          <div>
            <h4>{user.assignments.completed}</h4>
            <p>Completed</p>
          </div>
          <div>
            <h4>{user.assignments.totalScore}</h4>
            <p>Total Score</p>
          </div>
          <div>
            <h4>{user.assignments.averageScore}%</h4>
            <p>Average Score</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button>Edit Profile</button>
        <button>Account Settings</button>
        <button onClick={() => navigate("/login")}>Logout</button>
      </div>
    </div>
  );
};

export default Profile;
