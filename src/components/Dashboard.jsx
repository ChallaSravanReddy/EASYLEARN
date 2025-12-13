import React from 'react';
import RecommendedCourses from './RecommendedCourses';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  // Mock data for enrolled courses
  const enrolledCourses = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      progress: 65,
      lastAccessed: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 2,
      title: 'Node.js Microservices',
      progress: 30,
      lastAccessed: '1 day ago',
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">

        {/* Welcome Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-gray-200">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-caveat tracking-wide">
              Welcome back, Student!
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              You've learned <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">12 hours</span> this week. Keep it up!
            </p>
          </div>
          <Link to="/courses">
            <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
              <span>Browse All Courses</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </Link>
        </header>

        {/* My Courses Section */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
              <p className="text-gray-500 mt-1">Pick up where you left off</p>
            </div>
            <Link to="/courses" className="text-primary font-semibold hover:text-yellow-600 transition-colors flex items-center gap-1">
              View All <span className="text-xl">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrolledCourses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-gray-100 flex flex-col gap-5 group cursor-pointer hover:-translate-y-1">
                <div className="relative h-48 rounded-xl overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex justify-between items-end text-white">
                      <span className="text-xs font-medium bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">In Progress</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between gap-4 px-2 pb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last accessed: {course.lastAccessed}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                      <span>{course.progress}% Complete</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${course.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Course Card */}
            <Link to="/courses" className="bg-gray-50 rounded-2xl p-5 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group h-full min-h-[350px]">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-semibold text-lg">Enroll in a new course</span>
            </Link>
          </div>
        </section>

        {/* Recommended Section */}
        <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>
            <p className="text-gray-500 mt-1">Based on your learning history</p>
          </div>
          <div className="relative z-10">
            <RecommendedCourses />
          </div>
        </section>

      </div>
    </div>
  );
}