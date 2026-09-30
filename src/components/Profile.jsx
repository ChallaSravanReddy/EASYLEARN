import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Award, Settings, LogOut, CheckCircle2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  const user = {
    name: "Arjun Roy",
    location: "India",
    membership: "Pro Learner",
    xp: 850,
    streak: 20,
    courses: [
      { title: "React Basics", progress: 70, color: "bg-blue-500" },
      { title: "Python Chatbots", progress: 40, color: "bg-emerald-500" },
      { title: "UI/UX Design", progress: 20, color: "bg-violet-500" },
    ],
    badges: ["🏅 Top Learner", "📚 Consistent Coder", "🔥 20-Day Streak", "💡 Quick Thinker"],
    assignments: {
      attempted: 15,
      completed: 12,
      totalScore: 820,
      averageScore: 68,
    },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-slate-800/60 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        {/* Profile Image */}
        <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5 shadow-2xl shrink-0 group">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-950">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="absolute bottom-3 right-3 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-950 rounded-full"></div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left z-10">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">{user.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700/50">
              <MapPin className="w-4 h-4 text-indigo-500" />
              {user.location}
            </span>
            <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {user.membership}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 z-10 shrink-0">
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg shadow-gray-900/20 dark:shadow-white/10 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <Settings className="w-4 h-4" /> Edit Profile
          </button>
          <button onClick={() => navigate("/login")} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700/80 transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Badges */}
        <div className="space-y-8">
          {/* Learning Overview */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-slate-800/60">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Learning Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-5 rounded-2xl text-center hover:-translate-y-1 transition-transform">
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{user.xp}</div>
                <div className="text-xs text-indigo-800/70 dark:text-indigo-300 font-bold uppercase tracking-widest mt-2">XP Earned</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 p-5 rounded-2xl text-center hover:-translate-y-1 transition-transform">
                <div className="text-4xl font-black text-orange-600 dark:text-orange-400">{user.streak}</div>
                <div className="text-xs text-orange-800/70 dark:text-orange-300 font-bold uppercase tracking-widest mt-2">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-slate-800/60">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" /> Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge, index) => (
                <span key={index} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-default">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Courses */}
        <div className="lg:col-span-2 space-y-8">
          {/* Courses Progress */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-slate-800/60">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Courses in Progress</h3>
            <div className="space-y-8">
              {user.courses.map((course, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="flex justify-between items-end mb-3">
                    <span className="font-bold text-gray-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-lg">{course.title}</span>
                    <span className="text-sm font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">{course.progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full ${course.color} rounded-full transition-all duration-1000 ease-out relative`}
                      style={{ width: `${course.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments Stats */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-slate-800/60">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Assignment Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Attempted", value: user.assignments.attempted, color: "text-gray-900 dark:text-white" },
                { label: "Completed", value: user.assignments.completed, color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Total Score", value: user.assignments.totalScore, color: "text-indigo-600 dark:text-indigo-400" },
                { label: "Avg Score", value: `${user.assignments.averageScore}%`, color: "text-violet-600 dark:text-violet-400" },
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg dark:hover:shadow-none hover:-translate-y-1 transition-all border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
                  <div className={`text-3xl font-black ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
