import React, { useState } from "react";
import LoadingScreen from "../../components/LoadingScreen";
import { formatDistanceToNow } from "date-fns";
import { getAssessmentById } from "../../services/assessments";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BrainCircuit, Clock, CheckCircle, Users, AlertCircle } from "lucide-react";

const StatusBadge = ({ status }) => {
  switch (status) {
    case "unfinished":
      return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium"><Clock size={11} /> Pending</span>;
    case "submited":
      return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium"><BrainCircuit size={11} /> AI Analyzing</span>;
    case "graded":
      return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium"><CheckCircle size={11} /> Graded</span>;
    default:
      return <span className="text-xs text-gray-400">—</span>;
  }
};

const PeopleTab = ({ quizId, status, people, quizName }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = async (person) => {
    try {
      setLoading(true);
      const res = await getAssessmentById(person.assessment_id);
      if (res.status === 200) {
        navigate("/quiz/assessment-result", {
          state: { result: res.data, studentName: person.student_name, quizName },
        });
      }
    } catch (e) {
      console.error("Failed to load assessment detail", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const isTeacherView = status === "published" || status === "done";

  const pendingCount = people.filter(p => p.status === "unfinished").length;
  const submittedCount = people.filter(p => p.status === "submited").length;
  const gradedCount = people.filter(p => p.status === "graded").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue to-blue-700 px-6 sm:px-10 py-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-blue-200" />
            <span className="text-blue-100 text-sm font-medium">Participants</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{quizName}</h2>
          {isTeacherView && (
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-bold text-white">{people.length}</div>
                <div className="text-blue-100 text-xs">Total</div>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-bold text-white">{gradedCount}</div>
                <div className="text-blue-100 text-xs">Graded</div>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-bold text-white">{submittedCount}</div>
                <div className="text-blue-100 text-xs">Needs Grading</div>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-bold text-white">{pendingCount}</div>
                <div className="text-blue-100 text-xs">Pending</div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-5" />
      </div>

      <div className="px-4 sm:px-8 py-6 max-w-5xl mx-auto">
        {people.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Users size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium text-sm">No participants yet.</p>
            <p className="text-gray-400 text-xs mt-1">Students will appear here once they join.</p>
          </div>
        ) : isTeacherView ? (
          /* Teacher table view */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Ungraded warning */}
            {submittedCount > 0 && (
              <div className="flex items-center gap-2.5 px-5 py-3 bg-amber-50 border-b border-amber-100 text-sm text-amber-700">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{submittedCount} submission{submittedCount !== 1 ? "s" : ""} waiting for your review.</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person.user_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.student_name)}&background=1a89cf&color=fff`}
                            alt={person.student_name}
                            className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                          />
                          <span className="text-sm font-medium text-gray-800">{person.student_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {person.submission_timestamp_utc
                          ? formatDistanceToNow(new Date(person.submission_timestamp_utc), { addSuffix: true })
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="p-4">
                        {person.status === "graded" || person.status === "submited" ? (
                          <span className="text-sm font-semibold text-blue">
                            {Math.round(person.score_percentage)}/100
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-4"><StatusBadge status={person.status} /></td>
                      <td className="p-4 text-right">
                        {person.status === "graded" && (
                          <button
                            onClick={() => handleViewDetails(person)}
                            className="inline-flex items-center gap-1.5 text-blue text-sm font-medium hover:gap-2.5 transition-all"
                          >
                            View Details <ArrowRight size={14} />
                          </button>
                        )}
                        {person.status === "submited" && (
                          <button
                            onClick={() => handleViewDetails(person)}
                            className="inline-flex items-center gap-2 bg-orange/10 text-orange text-sm font-medium px-3.5 py-1.5 rounded-xl hover:bg-orange/20 transition cursor-pointer"
                          >
                            <BrainCircuit size={14} /> Grade
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Student card view */
          <div className="space-y-3">
            {people.map((person) => (
              <div key={person.user_id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.student_name)}&background=1a89cf&color=fff`}
                  alt={person.student_name}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{person.student_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {person.submission_timestamp_utc
                      ? formatDistanceToNow(new Date(person.submission_timestamp_utc), { addSuffix: true })
                      : "Haven't submitted yet"}
                  </p>
                </div>
                <StatusBadge status={person.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeopleTab;
