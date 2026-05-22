import React from "react";
import { FileText, Clock, CheckCircle, Send, ArrowRight, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllUserQuizzes } from "../services/user";
import LoadingScreen from "../components/LoadingScreen";
import { useNavigate } from "react-router-dom";

const getDayLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Activities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const activitiesResponse = await getAllUserQuizzes();
      if (
        activitiesResponse.status === 200 &&
        Array.isArray(activitiesResponse.data)
      ) {
        const transformed = activitiesResponse.data.map((item) => ({
          ...item,
          day: getDayLabel(item.created_at),
          time: new Date(item.created_at).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setActivities(transformed);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.log("error:", error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActivityMeta = (item) => {
    const isPublished = item.status === null && item.completed === false;
    const isDone = item.status === null && item.completed === true;
    const isUnfinished = item.status === "unfinished";
    const isSubmitted = item.status === "submited";
    const isGraded = item.status === "graded";

    if (isPublished) return {
      icon: <FileText size={18} />,
      iconBg: "bg-blue-100 text-blue-600",
      badge: "bg-blue-100 text-blue-700",
      badgeLabel: "Published",
      description: "You created a new quiz",
      message: "Quiz is live — keep an eye on submissions.",
      type: "published",
    };
    if (isDone) return {
      icon: <CheckCircle size={18} />,
      iconBg: "bg-emerald-100 text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
      badgeLabel: "Completed",
      description: "Quiz completed",
      message: "All participants have finished the quiz.",
      type: "done",
    };
    if (isUnfinished) return {
      icon: <Clock size={18} />,
      iconBg: "bg-amber-100 text-amber-600",
      badge: "bg-amber-100 text-amber-700",
      badgeLabel: "Pending",
      description: "New quiz available",
      message: "Make sure to complete it on time!",
      type: "unfinished",
    };
    if (isSubmitted) return {
      icon: <Send size={18} />,
      iconBg: "bg-purple-100 text-purple-600",
      badge: "bg-purple-100 text-purple-700",
      badgeLabel: "Submitted",
      description: "You submitted this quiz",
      message: "Your score is coming soon, hang tight!",
      type: "submitted",
    };
    if (isGraded) return {
      icon: <CheckCircle size={18} />,
      iconBg: "bg-emerald-100 text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
      badgeLabel: "Graded",
      description: "Submission graded",
      message: "Your submission has been graded. Check it out!",
      type: "graded",
    };
    return {
      icon: <FileText size={18} />,
      iconBg: "bg-gray-100 text-gray-500",
      badge: "bg-gray-100 text-gray-600",
      badgeLabel: "Activity",
      description: "Activity",
      message: "",
      type: "unknown",
    };
  };

  const viewQuizHandle = (quiz_id) => navigate(`/quiz-info/${quiz_id}`);

  const FILTER_OPTIONS = [
    { value: "all", label: "All Activities" },
    { value: "published", label: "Published" },
    { value: "unfinished", label: "Pending" },
    { value: "submitted", label: "Submitted" },
    { value: "graded", label: "Graded" },
    { value: "done", label: "Completed" },
  ];

  const filteredActivities = filter === "all"
    ? activities
    : activities.filter((item) => getActivityMeta(item).type === filter);

  const grouped = filteredActivities.reduce((acc, curr) => {
    acc[curr.day] = acc[curr.day] || [];
    acc[curr.day].push(curr);
    return acc;
  }, {});

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue to-blue-700 px-6 sm:px-10 py-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Activity</h2>
          <p className="text-blue-100 text-sm">
            Track your latest actions — quizzes created, submitted, and graded.
          </p>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold text-white">{activities.length}</div>
              <div className="text-blue-100 text-xs">Total</div>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold text-white">
                {activities.filter(a => getActivityMeta(a).type === "graded").length}
              </div>
              <div className="text-blue-100 text-xs">Graded</div>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold text-white">
                {activities.filter(a => getActivityMeta(a).type === "unfinished").length}
              </div>
              <div className="text-blue-100 text-xs">Pending</div>
            </div>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-5" />
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 px-6 sm:px-10 py-3 shadow-sm sticky top-[80px] z-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === opt.value
                  ? "bg-blue text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity list */}
      <div className="px-6 sm:px-10 py-6">
        {Object.entries(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Activity size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No activities to show.</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter !== "all" ? "Try selecting a different filter." : "Create or join a quiz to get started!"}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([day, items]) => (
            <div key={day} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{day}</h3>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => {
                  const meta = getActivityMeta(item);
                  return (
                    <div
                      key={index}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${meta.iconBg}`}>
                          {meta.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-xs text-gray-500">{meta.description}:</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.badge}`}>
                              {meta.badgeLabel}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{meta.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0 ml-14 sm:ml-0">
                        <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                        <button
                          onClick={() => viewQuizHandle(item.id)}
                          className="inline-flex items-center gap-1.5 text-blue text-sm font-medium hover:gap-2.5 transition-all whitespace-nowrap"
                        >
                          View <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Activities;
