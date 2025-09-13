// // import { useState } from 'react';
// // import styles from '../styles/LandingPage.module.css';
// // import Header from './Header';
// // import WhyChooseUs from './Why';
// // import Footer from './Footer';

// // export default function LandingPage({ setIsLoggedIn }) {
// //   const [search, setSearch] = useState("");

// //   const handleLogin = () => {
// //     setIsLoggedIn(true);
// //   };

// //   return (
// //     <div className={styles.container}>
// //       <Header search={search} setSearch={setSearch} handleLogin={handleLogin} />
      
// //       <div className={styles.bestCourse}>
// //         <h2>Best Course</h2>
// //         <div className={styles.courseContent}>
// //           <div>
// //             <h3>Full Stack Development</h3>
// //             <p>Learn both front-end and back-end development.</p>
// //           </div>
// //           <div>
// //             <h3>Web and App Development</h3>
// //             <p>Build responsive websites and mobile apps.</p>
// //           </div>
// //           <div>
// //             <h3>This is a new course</h3>
// //             <p>Explore new trending technologies.</p>
// //           </div>
// //         </div>
// //       </div>

// //       <Why/>

// //       <Footer />
// //     </div>
// //   );
// // }
// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import styles from '../styles/LandingPage.module.css';
// // import Header from './Header';
// // import WhyChooseUs from './WhyChooseUs';  // ✅ Import here
// // import Footer from './Footer';

// // export default function LandingPage() {
// //   const [search, setSearch] = useState("");
// //   const navigate = useNavigate();

// //   const handleLogin = () => {
// //     navigate('/login');
// //   };

// //   return (
// //     <div className={styles.container}>
// //       <Header search={search} setSearch={setSearch} handleLogin={handleLogin} />
      
// //       <div className={styles.bestCourse}>
// //         <h2>Best Course</h2>
// //         <div className={styles.courseContent}>
// //           <div>
// //             <h3>Full Stack Development</h3>
// //             <p>Learn both front-end and back-end development.</p>
// //           </div>
// //           <div>
// //             <h3>Web and App Development</h3>
// //             <p>Build responsive websites and mobile apps.</p>
// //           </div>
// //           <div>
// //             <h3>This is a new course</h3>
// //             <p>Explore new trending technologies.</p>
// //           </div>
// //         </div>
// //       </div>

// //       <WhyChooseUs />   {/* ✅ This should render below Best Course */}

// //       <Footer />
// //     </div>
// //   );
// // }
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import styles from '../styles/LandingPage.module.css';
// import Header from './Header';
// import Footer from './Footer';

// export default function LandingPage() {
//   const [search, setSearch] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = () => {
//     navigate('/login');
//   };

//   return (
//     <div className={styles.container}>
//       <Header search={search} setSearch={setSearch} handleLogin={handleLogin} />
      
//       <div className={styles.bestCourse}>
//         <h2>Best Course</h2>
//         <div className={styles.courseContent}>
//           <div>
//             <h3>Full Stack Development</h3>
//             <p>Learn both front-end and back-end development.</p>
//           </div>
//           <div>
//             <h3>Web and App Development</h3>
//             <p>Build responsive websites and mobile apps.</p>
//           </div>
//           <div>
//             <h3>This is a new course</h3>
//             <p>Explore new trending technologies.</p>
//           </div>
//         </div>
//       </div>

//       <section className={styles.whySection}>

//         <h2 className={styles.whyTitle}>Why Choose Our Platform?</h2>
//         <div className={styles.whyContent}>
//           <div className={styles.whyItem}>
//             <h3>Expert Instructors</h3>
//             <p>Learn from industry professionals with real-world experience.</p>
//           </div>
//           <div className={styles.whyItem}>
//             <h3>Hands-on Projects</h3>
//             <p>Build practical skills with interactive assignments and projects.</p>
//           </div>
//           <div className={styles.whyItem}>
//             <h3>Career Support</h3>
//             <p>Get guidance, resume reviews, and interview prep to boost your career.</p>
//           </div>
//           <div className={styles.whyItem}>
//             <h3>Flexible Learning</h3>
//             <p>Access courses anytime, anywhere, and learn at your own pace.</p>
//           </div>
//         </div>
//       </section>

//       <WhyChooseUs />

//       <Footer />
//     </div>
//   );
// }
import WhyChooseUs from "./WhyChooseUs";
import Header from './Header';
import HeroSection from './HeroSection';
import RecommendedCourses from './RecommendedCourses';
// import WhyChooseUs from './WhyChooseUs';
import Footer from './Footer';
import styles from '../styles/LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <Header />
      <HeroSection />
      <RecommendedCourses />
      <WhyChooseUs />
      
    </div>
  );
}
