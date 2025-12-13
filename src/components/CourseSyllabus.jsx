import { useParams, useNavigate } from "react-router-dom";

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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Course not found</h2>
        <p className="text-gray-500 mb-8">The course you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate("/courses")}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <button
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-primary font-semibold transition-colors group"
          onClick={() => navigate("/")}
        >
          <span className="group-hover:-translate-x-1 transition-transform">⬅</span> Back to Courses
        </button>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h1 className="text-3xl md:text-5xl font-bold font-caveat tracking-wide mb-4">{decodedName}</h1>
              <p className="text-gray-300 text-lg max-w-2xl">
                Master {decodedName} with our comprehensive curriculum designed for all skill levels.
              </p>
            </div>
          </div>

          {/* Syllabus List */}
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </span>
              Course Curriculum
            </h2>

            <ul className="space-y-4">
              {syllabus.map((topic, index) => {
                const isIntroJS = decodedName === "JavaScript" && topic === "Introduction to JavaScript";

                return (
                  <li
                    key={index}
                    onClick={() => {
                      if (isIntroJS) {
                        navigate("/course/javascript/introduction");
                      }
                    }}
                    className={`
                      relative p-5 rounded-xl border transition-all duration-300 flex items-center gap-4
                      ${isIntroJS
                        ? "bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 hover:shadow-md hover:scale-[1.01]"
                        : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-white hover:shadow-sm"
                      }
                    `}
                  >
                    <span className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      ${isIntroJS ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white text-gray-400 border border-gray-200"}
                    `}>
                      {index + 1}
                    </span>

                    <span className={`font-semibold text-lg ${isIntroJS ? "text-primary" : "text-gray-700"}`}>
                      {topic}
                    </span>

                    {isIntroJS && (
                      <span className="ml-auto px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                        Start Now
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
