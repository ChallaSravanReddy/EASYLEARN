import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Plus, Video as VideoIcon, Calendar, ArrowRight } from 'lucide-react';

export default function InstructorDashboard() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const q = query(collection(db, 'lessons'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLessons(data);
      } catch (err) {
        console.error("Error fetching lessons", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Instructor Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your courses, lessons, and content.</p>
        </div>
        <button
          onClick={() => navigate('/instructor/lesson/new')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" /> Create New Lesson
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-indigo-500/5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Published Lessons</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <VideoIcon className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No lessons found</h3>
            <p className="text-slate-500">You haven't published any lessons yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map(lesson => (
              <div key={lesson.id} className="group bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                  <VideoIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {lesson.lessonTitle}
                </h3>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-4">{lesson.courseTitle}</p>
                
                <div className="flex items-center justify-between mt-auto border-t border-slate-200 dark:border-slate-700/50 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="w-4 h-4" />
                    {lesson.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                  </div>
                  <button 
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                    className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    View Player <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
