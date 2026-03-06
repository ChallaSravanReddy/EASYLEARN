import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendedCourses from './RecommendedCourses';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  ArrowRight,
  TrendingUp,
  PlayCircle
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  // Mock data for enrolled courses
  const enrolledCourses = [
    {
      id: 1,
      title: 'JavaScript Introduction',
      progress: 65,
      lastAccessed: '2 hours ago',
      color: 'bg-primary'
    },
    {
      id: 2,
      title: 'Python Basics',
      progress: 30,
      lastAccessed: '1 day ago',
      color: 'bg-blue-500'
    }
  ];

  const stats = [
    { label: 'Courses in Progress', value: '3', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completed Courses', value: '12', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Learning Hours', value: '45h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Achievements', value: '8', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="p-4 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Banner */}
      <header className="relative bg-[#181824] rounded-[40px] p-8 md:p-14 text-white overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-primary text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <TrendingUp className="w-3.5 h-3.5" />
              Your Next Milestone is Close
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold font-caveat tracking-wider leading-tight">
              Welcome back, <span className="text-primary not-italic">Student!</span> 👋
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
              You've completed <span className="text-white font-bold">65%</span> of your JavaScript course. The finish line is just a few modules away!
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <button 
                onClick={() => navigate('/course/javascript/introduction')}
                className="group relative bg-primary text-white px-8 py-4 rounded-2xl font-black hover:bg-white hover:text-gray-900 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-3 overflow-hidden border border-transparent hover:border-gray-200"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                <PlayCircle className="w-5 h-5" />
                <span>Continue Learning</span>
              </button>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl font-bold transition-all backdrop-blur-md text-white">
                View Path
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
              <div className="w-56 h-56 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[48px] flex items-center justify-center relative shadow-2xl overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
                <span className="text-8xl filter drop-shadow-2xl animate-bounce-slow">🚀</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-900 p-7 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 group relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`} />
               <div className="flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-[20px] ${stat.bg} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          {/* Continue Learning */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">In Progress</h2>
                <div className="h-1.5 w-12 bg-primary rounded-full" />
              </div>
              <button className="group flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-full hover:bg-primary hover:text-gray-900 transition-all">
                <span>View All Courses</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer border-b-4 border-b-transparent hover:border-b-primary">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xl text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors leading-tight">{course.title}</h3>
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg">{course.lastAccessed}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        <span>Course Completion</span>
                        <span className="text-gray-900 dark:text-gray-100">{course.progress}%</span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-gray-700">
                        <div 
                          className={`h-full ${course.color} rounded-full transition-all duration-1000 ease-out shadow-lg shadow-primary/20 relative`} 
                          style={{ width: `${course.progress}%` }} 
                        >
                          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold text-sm group-hover:bg-primary group-hover:text-gray-900 transition-all flex items-center justify-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Resume Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <RecommendedCourses />
        </div>

        {/* Sidebar/Activity Feed */}
        <div className="space-y-10">
           <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm text-center md:text-left">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Activity</h3>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-8 relative">
                <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800" />
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-6 group relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2.5 ring-4 ring-white dark:ring-gray-900 z-10 transition-transform group-hover:scale-125" />
                    <div className="p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all w-full border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-bold leading-relaxed">Completed "Variables" lesson in JavaScript</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Today, 2:40 PM
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold text-sm hove:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                View History
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}