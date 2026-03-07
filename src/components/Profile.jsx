import React from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-600 p-1 shadow-xl">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-6xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-gray-600">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {user.location}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {user.membership}
              </span>
            </div>
          </div>

          <div className="flex gap-3 z-10">
            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold shadow-lg shadow-gray-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Edit Profile
            </button>
            <button onClick={() => navigate("/login")} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Stats & Badges */}
          <div className="space-y-8">
            {/* Learning Overview */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl text-center">
                  <div className="text-3xl font-bold text-blue-600">{user.xp}</div>
                  <div className="text-sm text-gray-600 font-medium mt-1">XP Earned</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-2xl text-center">
                  <div className="text-3xl font-bold text-orange-600">{user.streak}</div>
                  <div className="text-sm text-gray-600 font-medium mt-1">Day Streak</div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Badges</h3>
              <div className="flex flex-wrap gap-3">
                {user.badges.map((badge, index) => (
                  <span key={index} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-gray-700">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column: Courses */}
          <div className="lg:col-span-2 space-y-8">
            {/* Courses Progress */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Courses in Progress</h3>
              <div className="space-y-6">
                {user.courses.map((course, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors">{course.title}</span>
                      <span className="text-sm font-medium text-gray-500">{course.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${course.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments Stats */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Assignment Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Attempted", value: user.assignments.attempted, color: "text-gray-900" },
                  { label: "Completed", value: user.assignments.completed, color: "text-green-600" },
                  { label: "Total Score", value: user.assignments.totalScore, color: "text-primary" },
                  { label: "Avg Score", value: `${user.assignments.averageScore}%`, color: "text-purple-600" },
                ].map((stat, index) => (
                  <div key={index} className="text-center p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
