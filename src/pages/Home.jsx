import React, { useEffect, useState } from "react";
import { CiLogin } from "react-icons/ci";
import { HiOutlineBookOpen } from "react-icons/hi2";
import { PiGraduationCap } from "react-icons/pi";
import { FileText, CheckCircle, Clock, Send, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllUserQuizzes, getUser } from "../services/user";
import { joinQuiz } from "../services/quiz";
import LoadingScreen from "../components/LoadingScreen";

const Home = () => {
  const [rawDummyActivities, setRawDummyActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isFinishFetch, setIsFinishFetch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [userResponse, rawResponse] = await Promise.all([
          getUser(),
          getAllUserQuizzes(),
        ]);
        if (userResponse.status === 200) {
          setUserName(userResponse.data.name);
        }
        setRawDummyActivities(
          Array.isArray(rawResponse.data) ? rawResponse.data : []
        );
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
        setIsFinishFetch(true);
      }
    };
    fetchAll();
  }, []);

  const recentActivities = (rawDummyActivities || [])
    .slice(0, 3)
    .map((item) => {
      let icon, statusText, statusBg, statusColor, titlePrefix, accentColor;

      const isPublished = item.status === null && !item.completed;
      const isDone = item.status === null && item.completed;
      const isUnfinished = item.status === "unfinished";
      const isSubmitted = item.status === "submited";
      const isGraded = item.status === "graded";

      if (isPublished) {
        icon = <FileText size={22} />;
        statusText = "Published";
        statusBg = "bg-blue-100 text-blue-700";
        statusColor = "text-blue-600";
        titlePrefix = "Quiz Created";
        accentColor = "bg-blue-500";
      } else if (isDone) {
        icon = <CheckCircle size={22} />;
        statusText = "Completed";
        statusBg = "bg-emerald-100 text-emerald-700";
        statusColor = "text-emerald-600";
        titlePrefix = "Quiz Finished";
        accentColor = "bg-emerald-500";
      } else if (isUnfinished) {
        icon = <Clock size={22} />;
        statusText = "Pending";
        statusBg = "bg-amber-100 text-amber-700";
        statusColor = "text-amber-600";
        titlePrefix = "New Submission";
        accentColor = "bg-amber-500";
      } else if (isSubmitted) {
        icon = <Send size={22} />;
        statusText = "Submitted";
        statusBg = "bg-purple-100 text-purple-700";
        statusColor = "text-purple-600";
        titlePrefix = "Quiz Submitted";
        accentColor = "bg-purple-500";
      } else if (isGraded) {
        icon = <CheckCircle size={22} />;
        statusText = "Graded";
        statusBg = "bg-emerald-100 text-emerald-700";
        statusColor = "text-emerald-600";
        titlePrefix = "Quiz Graded";
        accentColor = "bg-emerald-500";
      } else {
        icon = <FileText size={22} />;
        statusText = "Unknown";
        statusBg = "bg-gray-100 text-gray-600";
        statusColor = "text-gray-500";
        titlePrefix = "Activity";
        accentColor = "bg-gray-400";
      }

      return {
        id: item.id,
        icon,
        title: item.title,
        titlePrefix,
        description: item.description,
        status: statusText,
        statusBg,
        statusColor,
        accentColor,
      };
    });

  const joinHandle = async () => {
    try {
      const response = await joinQuiz({ join_code: joinCode });
      if (response.status === 200) navigate("/success-join");
    } catch (error) {
      console.error("Join error:", error);
    }
  };

  const createQuizHandle = () => navigate("/create");
  const viewQuizHandle = (id) => navigate(`/quiz-info/${id}`);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (isLoading && !isFinishFetch) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero greeting banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue to-blue-700 px-6 sm:px-10 py-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 20% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative">
          <p className="text-blue-100 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {userName ? `Welcome back, ${userName}!` : "Welcome back!"}
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-md">
            Ready to create, assign, and track quizzes with AI-powered grading.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-5" />
        <div className="absolute right-12 -top-4 w-20 h-20 rounded-full bg-orange opacity-20" />
      </div>

      <div className="px-6 sm:px-10 py-8">
        {/* Quick stats */}
        {rawDummyActivities.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-blue">{rawDummyActivities.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Total Quizzes</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-emerald-500">
                {rawDummyActivities.filter(a => a.status === "graded" || a.completed).length}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Completed</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-amber-500">
                {rawDummyActivities.filter(a => a.status === "unfinished").length}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Pending</div>
            </div>
          </div>
        )}

        <h2 className="text-base font-semibold text-gray-700 mb-4">
          What would you like to do?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {/* Create Quiz Card */}
          <div className="group relative bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-blue opacity-5 -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <HiOutlineBookOpen className="text-blue" size={24} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">Create a Quiz</h3>
                <span className="flex items-center gap-1 text-xs bg-orange/10 text-orange font-medium px-2 py-0.5 rounded-full">
                  <Sparkles size={10} /> AI
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Design custom quizzes with text, single or multiple choice. AI will assist in reviewing student answers.
              </p>
              <button
                onClick={createQuizHandle}
                className="inline-flex items-center gap-2 bg-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
              >
                + Create Quiz <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Join Quiz Card */}
          <div className="group relative bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-orange opacity-5 -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-orange/10 flex items-center justify-center mb-4 group-hover:bg-orange/20 transition-colors">
                <PiGraduationCap className="text-orange" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Join a Quiz</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Enter a quiz code to participate and receive AI-based feedback on your answers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter quiz code..."
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue/40 focus:border-blue/50 bg-gray-50"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && joinHandle()}
                />
                <button
                  onClick={joinHandle}
                  className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
                >
                  <CiLogin size={18} /> Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-700">Recent Activity</h2>
          {rawDummyActivities.length > 3 && (
            <button
              onClick={() => navigate("/activity")}
              className="text-sm text-blue hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          )}
        </div>

        {recentActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <FileText size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No recent activities yet.</p>
            <p className="text-gray-400 text-xs mt-1">Create or join a quiz to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => viewQuizHandle(activity.id)}
                className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${activity.accentColor} bg-opacity-15 flex items-center justify-center ${activity.statusColor}`}
                    style={{ backgroundColor: undefined }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
                      style={{ background: `color-mix(in srgb, currentColor 15%, transparent)` }}
                    >
                      {activity.icon}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${activity.statusBg}`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">{activity.titlePrefix}</p>
                <h4 className="text-sm font-semibold text-gray-800 mb-1.5 line-clamp-1">
                  {activity.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {activity.description || "No description provided."}
                </p>
                <div className="flex items-center gap-1 mt-3 text-blue text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View details <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
