import React, { useEffect, useState } from "react";
import { getAllStudentsAssessments, getAssessmentById } from "../../services/assessments";
import LoadingScreen from "../../components/LoadingScreen";
import { getUser } from "../../services/user";
import { CheckCircle, XCircle, Award, TrendingUp, AlertTriangle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const ScoreRing = ({ percentage, size = 100 }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>
        {percentage}
      </text>
    </svg>
  );
};

const QuestionCard = ({ q, idx }) => {
  const [open, setOpen] = useState(false);
  const pct = q.max_score_possible > 0 ? Math.round((q.score / q.max_score_possible) * 100) : 0;
  const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-500";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-3">
      <div
        className="flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {idx + 1}
          </div>
          <p className="text-sm font-semibold text-gray-800 line-clamp-2">{q.question_text}</p>
        </div>
        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pct >= 80 ? "bg-emerald-100 text-emerald-700" : pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
            {q.score}/{q.max_score_possible}
          </span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Your Answer</p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm text-gray-700">
              {q.student_answer_text || <em className="text-gray-400">No answer provided.</em>}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-blue" />
              <p className="text-xs font-semibold text-blue uppercase tracking-wide">AI Feedback</p>
            </div>

            {q.key_points?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-700 mb-1.5 flex items-center gap-1">
                  <CheckCircle size={12} /> Key Points Covered
                </p>
                <ul className="space-y-1">
                  {q.key_points.map((m) => (
                    <li key={m.id} className="text-xs text-emerald-700 flex items-start gap-1.5">
                      <span className="mt-0.5 flex-shrink-0">✓</span> {m.key_point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {q.missing_concepts?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 mb-1.5 flex items-center gap-1">
                  <XCircle size={12} /> Missing Concepts
                </p>
                <ul className="space-y-1">
                  {q.missing_concepts.map((m) => (
                    <li key={m.id} className="text-xs text-red-600 flex items-start gap-1.5">
                      <span className="mt-0.5 flex-shrink-0">✗</span> {m.missing_concept}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Score</span>
                <span>{q.score}/{q.max_score_possible}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-2 rounded-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          {q.overall_question_feedback && (
            <p className="text-xs italic text-gray-500 border-l-2 border-gray-200 pl-3">
              {q.overall_question_feedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const GradesTab = ({ quizId }) => {
  const [detail, setDetail] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserResult = async () => {
      try {
        const nameResponse = await getUser();
        if (nameResponse.status === 200) {
          const currentUserName = nameResponse.data.name;
          setUserName(currentUserName);

          const gradesResponse = await getAllStudentsAssessments(quizId);
          if (gradesResponse.status === 200) {
            const filtered = gradesResponse.data.assessments.filter(
              (item) => item.status === "graded" && item.student_name === currentUserName
            );
            if (filtered.length > 0) {
              const detailResponse = await getAssessmentById(filtered[0].assessment_id);
              if (detailResponse.status === 200) setDetail(detailResponse.data);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch grade detail:", error);
      }
    };
    fetchUserResult();
  }, [quizId]);

  if (!detail) return <LoadingScreen />;

  const overallPercentage = detail.overall_max_score > 0
    ? Math.round((detail.overall_score / detail.overall_max_score) * 100)
    : 0;
  const gradeLabel = overallPercentage >= 90 ? "A" : overallPercentage >= 80 ? "B" : overallPercentage >= 70 ? "C" : overallPercentage >= 60 ? "D" : "F";
  const gradeColor = overallPercentage >= 80 ? "text-emerald-600" : overallPercentage >= 60 ? "text-amber-600" : "text-red-600";
  const gradeBg = overallPercentage >= 80 ? "bg-emerald-50 border-emerald-200" : overallPercentage >= 60 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue to-blue-700 px-6 sm:px-10 py-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award size={16} className="text-orange" />
              <span className="text-blue-100 text-sm font-medium">Final Evaluation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{userName}</h2>
            <p className="text-blue-100 text-sm">
              Submitted: {new Date(detail.submission_timestamp_utc).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <ScoreRing percentage={overallPercentage} size={88} />
            <p className="text-blue-100 text-xs mt-1">Your Score</p>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-5" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-blue">{detail.overall_score}</div>
            <div className="text-xs text-gray-500 mt-0.5">Score</div>
          </div>
          <div className={`rounded-2xl border p-4 shadow-sm text-center ${gradeBg}`}>
            <div className={`text-2xl font-bold ${gradeColor}`}>{gradeLabel}</div>
            <div className="text-xs text-gray-500 mt-0.5">Grade</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-800">{detail.question_assessments.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Questions</div>
          </div>
        </div>

        {/* Questions */}
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Question Breakdown <span className="normal-case text-gray-400 font-normal">(tap to expand)</span>
        </h3>
        {detail.question_assessments.map((q, idx) => (
          <QuestionCard key={q.id} q={q} idx={idx} />
        ))}

        {/* Final feedback */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={18} className="text-blue" />
            <h3 className="text-base font-semibold text-gray-800">Final Feedback</h3>
          </div>

          {detail.summary_of_performance && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <TrendingUp size={16} className="text-blue mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{detail.summary_of_performance}</p>
            </div>
          )}
          {detail.general_positive_feedback && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-emerald-800">{detail.general_positive_feedback}</p>
            </div>
          )}
          {detail.general_areas_for_improvement && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">{detail.general_areas_for_improvement}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradesTab;
