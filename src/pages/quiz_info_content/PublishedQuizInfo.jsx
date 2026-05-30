import React, { useEffect, useState } from "react";
import { Calendar, Copy, Check, TrendingUp, TrendingDown, Award, Users, BarChart2, Trophy, AlertTriangle, Flame, Smile } from "lucide-react";
import {
  PieChart as RechartsChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getQuizStatistics } from "../../services/assessments";

const StatCard = ({ label, value, sub, accent = "blue", icon: Icon }) => {
  const accentMap = {
    blue: "bg-blue-50 text-blue border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-500 border-red-100",
    orange: "bg-orange/10 text-orange border-orange/20",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
};

const CustomTooltip = ({ active, payload, total }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-100 rounded-xl shadow-lg text-xs">
        <p className="font-semibold text-gray-800">{`Grade ${d.name}: ${d.value} students`}</p>
        <p className="text-gray-500">{total > 0 ? `${((d.value / total) * 100).toFixed(1)}%` : "—"}</p>
        <p className="text-gray-400">{d.range}</p>
      </div>
    );
  }
  return null;
};

const PublishedQuizInfo = ({ quiz, quiz_id }) => {
  const [overview, setOverview] = useState(null);
  const [activePerformTab, setActivePerformTab] = useState("top");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(quiz.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy quiz code.");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getQuizStatistics(quiz_id);
        if (response.status === 200) setOverview(response.data);
      } catch (error) {
        console.error("Failed to fetch quiz statistics:", error);
      }
    };
    fetchStats();
  }, [quiz_id]);

  if (!overview) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading analytics…</p>
      </div>
    </div>
  );

  const gradeData = [
    { name: "A", value: overview.grade_distribution["A (90-100%)"], color: "#22c55e", range: "90-100%" },
    { name: "B", value: overview.grade_distribution["B (80-89%)"], color: "#3b82f6", range: "80-89%" },
    { name: "C", value: overview.grade_distribution["C (70-79%)"], color: "#eab308", range: "70-79%" },
    { name: "D", value: overview.grade_distribution["D (60-69%)"], color: "#f97316", range: "60-69%" },
    { name: "F", value: overview.grade_distribution["F (0-59%)"], color: "#ef4444", range: "0-59%" },
  ].filter((d) => d.value > 0);

  const avgPct = overview.average_percentage?.toFixed(1);
  const performers = activePerformTab === "top" ? overview.top_performers : overview.bottom_performers;

  const passCount =
    (overview.grade_distribution["A (90-100%)"] ?? 0) +
    (overview.grade_distribution["B (80-89%)"] ?? 0) +
    (overview.grade_distribution["C (70-79%)"] ?? 0) +
    (overview.grade_distribution["D (60-69%)"] ?? 0);
  const passRate = overview.total_assessments > 0
    ? ((passCount / overview.total_assessments) * 100).toFixed(1)
    : "—";

  const scoreSpread = (overview.max_percentage - overview.min_percentage).toFixed(1);

  const durationDays = overview.earliest_assessment && overview.latest_assessment
    ? Math.round((new Date(overview.latest_assessment) - new Date(overview.earliest_assessment)) / (1000 * 60 * 60 * 24))
    : null;

  const allQuestions = [
    ...(overview.hardest_questions ?? []),
    ...(overview.easiest_questions ?? []),
  ];
  const uniqueQuestions = [...new Map(allQuestions.map((q) => [q.question_id, q])).values()];
  const strugglingQuestionCount = uniqueQuestions.filter((q) => q.struggling_students_percentage > 50).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue to-blue-700 px-6 sm:px-10 py-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={16} className="text-blue-200" />
              <span className="text-blue-100 text-sm font-medium">Analytics Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 truncate">{quiz.title}</h1>
            {overview.earliest_assessment && (
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-blue-100 text-sm flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(overview.earliest_assessment).toLocaleDateString()} —{" "}
                  {new Date(overview.latest_assessment).toLocaleDateString()}
                </p>
                {durationDays !== null && (
                  <span className="text-xs bg-white/15 border border-white/20 text-white rounded-full px-2.5 py-0.5">
                    {durationDays === 0 ? "Today" : `${durationDays}d active`}
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Join code chip */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-2xl px-4 py-2.5 transition-colors flex-shrink-0"
          >
            <span className="text-lg font-bold tracking-widest">{quiz.join_code}</span>
            {copied ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} className="text-white/70" />}
          </button>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-5" />
      </div>

      <div className="px-4 sm:px-8 py-6 max-w-5xl mx-auto">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
          <StatCard
            label="Total Assessments"
            value={overview.total_assessments}
            sub="total attempts"
            accent="blue"
            icon={Users}
          />
          <StatCard
            label="Average Score"
            value={`${overview.average_percentage}%`}
            sub={`${overview.average_score} pts avg`}
            accent="green"
            icon={TrendingUp}
          />
          <StatCard
            label="Highest Score"
            value={`${overview.max_percentage}%`}
            sub={`${overview.max_score} pts`}
            accent="orange"
            icon={Award}
          />
          <StatCard
            label="Lowest Score"
            value={`${overview.min_percentage}%`}
            sub={`${overview.min_score} pts`}
            accent="red"
            icon={TrendingDown}
          />
          <StatCard
            label="Pass Rate"
            value={`${passRate}%`}
            sub={`${passCount} of ${overview.total_assessments} passed`}
            accent="green"
            icon={Trophy}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Pie chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Grade Distribution</h3>
            {gradeData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="h-44 w-44 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsChart>
                      <Pie
                        data={gradeData}
                        cx="50%" cy="50%"
                        outerRadius={70}
                        innerRadius={32}
                        dataKey="value"
                        labelLine={false}
                      >
                        {gradeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip total={overview.total_assessments} />} />
                    </RechartsChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {gradeData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-gray-600 w-16">Grade {d.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: d.color,
                            width: `${((d.value / overview.total_assessments) * 100).toFixed(0)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-14 text-right">
                        {d.value} ({((d.value / overview.total_assessments) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No graded submissions yet.</div>
            )}
          </div>

          {/* Insights */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Insights & Recommendations</h3>
            <div className="space-y-3">
              {parseFloat(avgPct) < 70 && (
                <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                  <AlertTriangle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">Average score is below 70%. Consider reviewing quiz content or student preparation materials.</p>
                </div>
              )}
              {(overview.grade_distribution["F (0-59%)"] ?? 0) > 0 && (
                <div className="flex gap-3 bg-red-50 border border-red-100 rounded-xl p-3.5">
                  <TrendingDown size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">{overview.grade_distribution["F (0-59%)"]} student{overview.grade_distribution["F (0-59%)"] !== 1 ? "s" : ""} received a failing grade — consider offering additional support.</p>
                </div>
              )}
              {(overview.grade_distribution["A (90-100%)"] ?? 0) > 0 && (
                <div className="flex gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
                  <Trophy size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-emerald-700">{overview.grade_distribution["A (90-100%)"]} student{overview.grade_distribution["A (90-100%)"] !== 1 ? "s" : ""} achieved an A grade. Great performance!</p>
                </div>
              )}
              {(overview.grade_distribution["F (0-59%)"] ?? 0) === 0 && parseFloat(avgPct) >= 70 && (
                <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                  <TrendingUp size={15} className="text-blue mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">All students are performing above 60%. The class is on track.</p>
                </div>
              )}
              {parseFloat(scoreSpread) > 40 && (
                <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                  <AlertTriangle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">Large score gap of {scoreSpread}% between highest and lowest student — consider differentiated support.</p>
                </div>
              )}
              {strugglingQuestionCount > 0 && (
                <div className="flex gap-3 bg-red-50 border border-red-100 rounded-xl p-3.5">
                  <Flame size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">{strugglingQuestionCount} question{strugglingQuestionCount !== 1 ? "s" : ""} had more than half the class struggling — review those topics.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hardest / Easiest questions */}
        {(overview.hardest_questions?.length > 0 || overview.easiest_questions?.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {[
              { key: "hardest_questions", label: "Hardest Questions", color: "red" },
              { key: "easiest_questions", label: "Easiest Questions", color: "green" },
            ].map(({ key, label, color }) => (
              <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  {color === "red"
                    ? <Flame size={15} className="text-red-500" />
                    : <Smile size={15} className="text-emerald-500" />
                  }
                  <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
                </div>
                <div className="space-y-3">
                  {overview[key].map((q, i) => (
                    <div key={q.question_id} className="flex gap-3 items-start">
                      <span className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${color === "red" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{q.question_text}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-[11px] font-semibold ${color === "red" ? "text-red-500" : "text-emerald-600"}`}>
                            {q.average_score_percentage.toFixed(1)}% avg
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {q.struggling_students_count}/{q.total_students_answered} struggling ({q.struggling_students_percentage.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performers table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 p-5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 flex-1">Performance Rankings</h3>
            <div className="flex gap-1.5">
              {["top", "bottom"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePerformTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activePerformTab === tab ? "bg-blue text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab === "top" ? "Top Performers" : "Bottom Performers"}
                </button>
              ))}
            </div>
          </div>

          {performers?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50">
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Point</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {performers.map((s, i) => {
                    const pct = s.percentage ?? ((s.score / s.max_score) * 100);
                    const grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
                    const gradeStyle = pct >= 80 ? "bg-emerald-100 text-emerald-700" : pct >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-400 text-sm font-medium">
                          {i === 0 && activePerformTab === "top" ? "🥇" : i === 1 && activePerformTab === "top" ? "🥈" : i === 2 && activePerformTab === "top" ? "🥉" : i + 1}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.student_name)}&background=1a89cf&color=fff`}
                              alt={s.student_name}
                              className="w-7 h-7 rounded-lg"
                            />
                            <span className="font-medium text-gray-800">{s.student_name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-blue">{s.score}/{s.max_score}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-400" : pct >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-gray-600 text-sm">{pct.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${gradeStyle}`}>{grade}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-400">No data available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishedQuizInfo;
