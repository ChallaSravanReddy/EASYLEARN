// import React from 'react';
// import { auth } from '../firebaseConfig';
// import { signOut } from 'firebase/auth';
// import { useNavigate } from 'react-router-dom';

// const Dashboard = () => {
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate('/login');
//     } catch (error) {
//       alert("Failed to log out.");
//     }
//   };

//   return (
//     <div>
//       <nav>
//         {/* You can add your navigation links here from your designs */}
//         <button onClick={handleLogout}>Log Out</button>
//       </nav>
//       <div style={{ padding: '20px' }}>
//         <h1>Welcome to your Dashboard!</h1>
//         <p>This is where you'll see your courses and progress.</p>
//         {/* Integrate the static landing page content (featured courses, testimonials) here */}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// import WhyChooseUs from "./WhyChooseUs";
// import Header from './Header';
// import HeroSection from './HeroSection';
// import RecommendedCourses from './RecommendedCourses';
// // import WhyChooseUs from './WhyChooseUs';
// import Footer from './Footer';
// import styles from '../styles/LandingPage.module.css';

// export default function LandingPage() {
//   return (
//     <div className={styles.container}>
//       <Header />
//       <HeroSection />
//       <RecommendedCourses />
//       <WhyChooseUs />
//       <Footer />
//     </div>
//   );
// }

import Header from './Header';
import HeroSection from './HeroSection';
import RecommendedCourses from './RecommendedCourses';
import WhyChooseUs from './WhyChooseUs';
import Footer from './Footer';
import styles from '../styles/LandingPage.module.css';

export default function Dashboard() {
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