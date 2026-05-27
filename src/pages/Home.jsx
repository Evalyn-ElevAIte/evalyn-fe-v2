import React, { useEffect, useState } from "react";
import { CiLogin } from "react-icons/ci";
import { HiOutlineBookOpen } from "react-icons/hi2";
import { PiGraduationCap } from "react-icons/pi";
import {
  FileText,
  CheckCircle,
  Clock,
  Send,
  ArrowRight,
  Sparkles,
  BarChart2,
  BookMarked,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllUserQuizzes, getUser } from "../services/user";
import { joinQuiz } from "../services/quiz";
import LoadingScreen from "../components/LoadingScreen";

const statusMap = {
  published: {
    icon: FileText,
    label: "Published",
    badge: "bg-blue/10 text-blue",
    iconBg: "bg-blue/10 text-blue",
    prefix: "Quiz Created",
  },
  done: {
    icon: CheckCircle,
    label: "Completed",
    badge: "bg-emerald-100 text-emerald-700",
    iconBg: "bg-emerald-50 text-emerald-600",
    prefix: "Quiz Finished",
  },
  unfinished: {
    icon: Clock,
    label: "Pending",
    badge: "bg-amber-100 text-amber-700",
    iconBg: "bg-amber-50 text-amber-600",
    prefix: "In Progress",
  },
  submited: {
    icon: Send,
    label: "Submitted",
    badge: "bg-violet-100 text-violet-700",
    iconBg: "bg-violet-50 text-violet-600",
    prefix: "Quiz Submitted",
  },
  graded: {
    icon: CheckCircle,
    label: "Graded",
    badge: "bg-emerald-100 text-emerald-700",
    iconBg: "bg-emerald-50 text-emerald-600",
    prefix: "Quiz Graded",
  },
};

const resolveStatus = (item) => {
  if (item.status === "unfinished") return statusMap.unfinished;
  if (item.status === "submited") return statusMap.submited;
  if (item.status === "graded") return statusMap.graded;
  if (item.status === null && item.completed) return statusMap.done;
  if (item.status === null && !item.completed) return statusMap.published;
  return {
    icon: FileText,
    label: "Unknown",
    badge: "bg-gray-100 text-gray-500",
    iconBg: "bg-gray-100 text-gray-400",
    prefix: "Activity",
  };
};

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishFetch, setIsFinishFetch] = useState(false);
  const [userName, setUserName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [userRes, quizRes] = await Promise.all([
          getUser(),
          getAllUserQuizzes(),
        ]);
        if (userRes.status === 200) setUserName(userRes.data.name);
        setQuizzes(Array.isArray(quizRes.data) ? quizRes.data : []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
        setIsFinishFetch(true);
      }
    };
    fetchAll();
  }, []);

  const joinHandle = async () => {
    if (!joinCode.trim()) return;
    setJoinError("");
    try {
      const response = await joinQuiz({ join_code: joinCode.trim() });
      if (response.status === 200) navigate("/success-join");
    } catch {
      setJoinError("Invalid code. Please check and try again.");
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const totalQuizzes = quizzes.length;
  const completedCount = quizzes.filter(
    (a) => a.status === "graded" || (a.status === null && a.completed)
  ).length;
  const pendingCount = quizzes.filter((a) => a.status === "unfinished").length;
  const submittedCount = quizzes.filter((a) => a.status === "submited").length;

  const recentActivities = quizzes.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    ...resolveStatus(item),
  }));

  if (isLoading && !isFinishFetch) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Thin accent top bar ───────────────────────── */}
      <div className="h-1 w-full bg-gradient-to-r from-blue via-blue/60 to-orange" />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10">
        {/* ── Greeting ──────────────────────────────────── */}
        <div className="mb-10">
          <p className="text-xs font-medium text-gray-400 mb-1">{today}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {greeting},{" "}
            <span className="text-blue">{userName || "there"}</span> 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1.5">
            Here's what's happening with your quizzes today.
          </p>
        </div>

        {/* ── Stats ─────────────────────────────────────── */}
        {totalQuizzes > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              {
                label: "Total Quizzes",
                value: totalQuizzes,
                icon: BookMarked,
                iconClass: "text-blue",
                bg: "bg-blue/10",
              },
              {
                label: "Completed",
                value: completedCount,
                icon: CheckCircle,
                iconClass: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Pending",
                value: pendingCount,
                icon: Clock,
                iconClass: "text-amber-500",
                bg: "bg-amber-50",
              },
              {
                label: "Submitted",
                value: submittedCount,
                icon: Send,
                iconClass: "text-violet-600",
                bg: "bg-violet-50",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}
                  >
                    <Icon size={16} className={s.iconClass} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 leading-none mb-1">
                    {s.value}
                  </p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Quick actions ─────────────────────────────── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Quick actions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* Create Quiz */}
          <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-blue/30 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center group-hover:bg-blue/20 transition-colors">
                <HiOutlineBookOpen className="text-blue" size={20} />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] bg-orange/10 text-orange font-bold px-2 py-1 rounded-full">
                <Sparkles size={9} /> AI-powered
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">
              Create a Quiz
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Build custom assessments with multiple question types. AI assists
              in grading and generates feedback automatically.
            </p>
            <button
              onClick={() => navigate("/create")}
              className="inline-flex items-center gap-2 bg-blue text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-blue/90 transition-colors"
            >
              New quiz <ArrowRight size={13} />
            </button>
          </div>

          {/* Join Quiz */}
          <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-orange/30 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center group-hover:bg-orange/20 transition-colors">
                <PiGraduationCap className="text-orange" size={20} />
              </div>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">
              Join a Quiz
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Have a quiz code? Enter it below to participate and receive
              AI-powered feedback on your answers.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter quiz code…"
                className={`border rounded-xl px-4 py-2.5 text-sm flex-1 outline-none focus:ring-2 transition-all placeholder-gray-300 bg-gray-50/80 ${
                  joinError
                    ? "border-red-300 focus:ring-red-100"
                    : "border-gray-200 focus:ring-orange/20 focus:border-orange/40"
                }`}
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value);
                  setJoinError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && joinHandle()}
              />
              <button
                onClick={joinHandle}
                className="inline-flex items-center gap-1.5 bg-orange text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-orange/90 transition-colors whitespace-nowrap"
              >
                <CiLogin size={15} /> Join
              </button>
            </div>
            {joinError && (
              <p className="text-xs text-red-500 mt-2">{joinError}</p>
            )}
          </div>
        </div>

        {/* ── Recent activity ───────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Recent activity
          </p>
          {quizzes.length > 3 && (
            <button
              onClick={() => navigate("/activity")}
              className="text-xs text-blue font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight size={11} />
            </button>
          )}
        </div>

        {recentActivities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-3">
              <BarChart2 size={20} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">
              No activity yet
            </p>
            <p className="text-xs text-gray-400">
              Create a quiz or join one with a code to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  onClick={() => navigate(`/quiz-info/${activity.id}`)}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-gray-200 hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.iconBg}`}
                    >
                      <Icon size={14} />
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${activity.badge}`}
                    >
                      {activity.label}
                    </span>
                  </div>

                  <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest mb-1">
                    {activity.prefix}
                  </p>
                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-1 mb-1">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {activity.description || "No description provided."}
                  </p>

                  <div className="flex items-center gap-1 mt-4 text-[11px] font-semibold text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                    View details <ArrowRight size={10} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
