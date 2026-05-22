import React, { useEffect, useState } from "react";
import { Calendar, Copy, Check, TrendingUp, TrendingDown, Award, Users, BarChart2, Trophy, AlertTriangle } from "lucide-react";
import {
  PieChart as RechartsChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
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
              <p className="text-blue-100 text-sm flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date(overview.earliest_assessment).toLocaleDateString()} —{" "}
                {new Date(overview.latest_assessment).toLocaleDateString()}
              </p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total Assessments"
            value={overview.total_assessments}
            sub="total attempts"
            accent="blue"
            icon={Users}
          />
          <StatCard
            label="Average Score"
            value={`${overview.average_score} / ${overview.max_score}`}
            sub={`${avgPct}%`}
            accent="green"
            icon={TrendingUp}
          />
          <StatCard
            label="Highest Score"
            value={overview.max_score}
            sub="best performer"
            accent="orange"
            icon={Award}
          />
          <StatCard
            label="Failing (F)"
            value={overview.grade_distribution["F (0-59%)"] ?? 0}
            sub="students below 60%"
            accent="red"
            icon={TrendingDown}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Pie chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Grade Distribution</h3>
            {gradeData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsChart>
                    <Pie
                      data={gradeData}
                      cx="50%" cy="50%"
                      outerRadius={80}
                      innerRadius={35}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""}
                    >
                      {gradeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip total={overview.total_assessments} />} />
                    <Legend iconType="circle" iconSize={8} />
                  </RechartsChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No graded submissions yet.</div>
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
            </div>
          </div>
        </div>

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
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Percentage</th>
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
                        <td className="p-4 text-gray-600">{pct.toFixed(1)}%</td>
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
