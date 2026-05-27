import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { updateAssessmentGrading } from "../services/assessments";
import {
  Bot,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Award,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Target,
} from "lucide-react";

// ── Score ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ percentage, size = 100 }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color =
    percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="9" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="50" y="54" textAnchor="middle" fontSize="20" fontWeight="800" fill={color}>
        {percentage}
      </text>
    </svg>
  );
};

// ── Question card ─────────────────────────────────────────────────────────────
const QuestionCard = ({ q, idx, score, onScoreChange, isTeacher }) => {
  const [open, setOpen] = useState(true);
  const pct =
    q.max_score_possible > 0
      ? Math.round((q.score / q.max_score_possible) * 100)
      : 0;
  const barColor =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
  const badgeClass =
    pct >= 80
      ? "bg-emerald-100 text-emerald-700"
      : pct >= 50
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-600";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-3">
      {/* Header row */}
      <div
        className="flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue/10 text-blue text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {idx + 1}
          </div>
          <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
            {q.question_text}
          </p>
        </div>
        <div className="flex items-center gap-2.5 ml-3 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
            {q.score}/{q.max_score_possible}
          </span>
          {open ? (
            <ChevronUp size={15} className="text-gray-300" />
          ) : (
            <ChevronDown size={15} className="text-gray-300" />
          )}
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {/* Student answer */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Student Answer
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
              {q.student_answer_text || (
                <em className="text-gray-300">No answer provided.</em>
              )}
            </div>
          </div>

          {/* AI analysis */}
          <div className="rounded-xl border border-blue/10 bg-blue/[0.03] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-blue" />
              <p className="text-xs font-semibold text-blue uppercase tracking-widest">
                AI Analysis
              </p>
              {q.rating_plagiarism != null && (
                <span
                  className={`ml-auto text-xs font-medium flex items-center gap-1 ${
                    q.rating_plagiarism > 30 ? "text-rose-400" : "text-gray-400"
                  }`}
                >
                  <Bot size={11} /> AI Check: {q.rating_plagiarism}%
                </span>
              )}
            </div>

            {q.key_points?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-600 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle size={12} /> Key Points Covered
                </p>
                <ul className="space-y-1">
                  {q.key_points.map((m) => (
                    <li
                      key={m.id}
                      className="text-sm text-emerald-700 flex items-start gap-1.5 leading-relaxed"
                    >
                      <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                      {m.key_point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {q.missing_concepts?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-rose-400 mb-1.5 flex items-center gap-1.5">
                  <XCircle size={12} /> Missing Concepts
                </p>
                <ul className="space-y-1">
                  {q.missing_concepts.map((m) => (
                    <li
                      key={m.id}
                      className="text-sm text-rose-400 flex items-start gap-1.5 leading-relaxed"
                    >
                      <span className="mt-0.5 shrink-0">✗</span>
                      {m.missing_concept}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Score bar */}
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-400 mb-1.5">
                <span>Relevance Score</span>
                <span>
                  {q.score}/{q.max_score_possible}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Feedback quote */}
          {q.overall_question_feedback && (
            <p className="text-xs text-gray-400 italic border-l-2 border-gray-200 pl-3 leading-relaxed">
              {q.overall_question_feedback}
            </p>
          )}

          {/* Score adjustment (teacher only) */}
          {isTeacher && (
            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Adjust Score
              </label>
              <input
                type="number"
                min={0}
                max={q.max_score_possible}
                value={score}
                onChange={(e) => onScoreChange(q.question_id, e.target.value)}
                className="w-20 border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue/20 bg-gray-50"
              />
              <span className="text-xs text-gray-400">/ {q.max_score_possible}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const AssessmentResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;
  const studentName = location.state?.studentName;

  const [questionScores, setQuestionScores] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (result) {
      setQuestionScores(
        result.question_assessments.map((q) => ({
          question_id: q.question_id,
          new_score: q.score,
        }))
      );
    }
  }, [result]);

  const handleScoreChange = (question_id, value) => {
    setQuestionScores((prev) =>
      prev.map((item) =>
        item.question_id === question_id
          ? { ...item, new_score: parseInt(value) || 0 }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await updateAssessmentGrading(result.id, {
        question_scores: questionScores,
      });
      if (res.status === 200) navigate(-1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!result) return <LoadingScreen />;

  const overallPct =
    result.overall_max_score > 0
      ? Math.round((result.overall_score / result.overall_max_score) * 100)
      : 0;

  const gradeLabel =
    overallPct >= 90 ? "A" : overallPct >= 80 ? "B" : overallPct >= 70 ? "C" : overallPct >= 60 ? "D" : "F";
  const gradeColor =
    overallPct >= 80 ? "text-emerald-600" : overallPct >= 60 ? "text-amber-500" : "text-red-500";
  const gradeBg =
    overallPct >= 80 ? "bg-emerald-50 border-emerald-200" : overallPct >= 60 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <div className="min-h-screen bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-blue via-blue/60 to-orange" />

      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        {/* ── Top nav ── */}
        <div className="flex items-center justify-between pt-8 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 font-medium transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue bg-blue/10 px-3 py-1 rounded-full">
            <Sparkles size={11} /> AI Analysis Result
          </span>
        </div>

        {/* ── Hero summary card ── */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                Student Result
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate mb-1">
                {studentName}
              </h1>
              <p className="text-xs text-gray-400">
                Submitted:{" "}
                {new Date(result.submission_timestamp_utc).toLocaleString()}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-center">
              <ScoreRing percentage={overallPct} size={90} />
              <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide">
                Score
              </p>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-50">
            <div className="text-center">
              <p className="text-xl font-bold text-blue">{result.overall_score}</p>
              <p className="text-xs text-gray-400 mt-0.5">Points</p>
            </div>
            <div className={`text-center rounded-xl border py-2 ${gradeBg}`}>
              <p className={`text-xl font-bold ${gradeColor}`}>{gradeLabel}</p>
              <p className="text-xs text-gray-400 mt-0.5">Grade</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">
                {result.question_assessments.length}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Questions</p>
            </div>
          </div>
        </div>

        {/* ── Question breakdown ── */}
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Question Breakdown
          </p>
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-300">
            {result.question_assessments.length} questions
          </span>
        </div>

        {result.question_assessments.map((q, idx) => (
          <QuestionCard
            key={q.id}
            q={q}
            idx={idx}
            isTeacher
            score={
              questionScores.find((s) => s.question_id === q.question_id)
                ?.new_score ?? 0
            }
            onScoreChange={handleScoreChange}
          />
        ))}

        {/* ── Final feedback ── */}
        <div className="mt-2 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Final Feedback
            </p>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="space-y-3">
            {result.summary_of_performance && (
              <div className="rounded-xl border border-blue/10 bg-blue/[0.03] p-4 flex gap-3">
                <TrendingUp size={15} className="text-blue mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {result.summary_of_performance}
                </p>
              </div>
            )}
            {result.general_positive_feedback && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 flex gap-3">
                <CheckCircle size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {result.general_positive_feedback}
                </p>
              </div>
            )}
            {result.general_areas_for_improvement && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 flex gap-3">
                <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {result.general_areas_for_improvement}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pb-10">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue text-white text-sm font-semibold hover:bg-blue/90 disabled:opacity-50 transition shadow-sm"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              "Send Report"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResultPage;
