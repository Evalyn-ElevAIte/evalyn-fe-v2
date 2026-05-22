import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, AlertTriangle, Play, X, CheckCircle } from "lucide-react";
import startVector from "../../assets/vector/vector_start_assessment.png";

const UnfinishedQuizInfo = ({ quiz }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue to-blue-700 px-6 sm:px-10 py-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative">
          <span className="inline-block bg-blue-100/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-3">Quiz Available</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-blue-100 text-sm max-w-lg">{quiz.description}</p>
          )}
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-5" />
      </div>

      <div className="max-w-lg mx-auto w-full px-4 sm:px-6 py-8">
        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <img src={startVector} alt="Start quiz" className="w-56 sm:w-72 object-contain" />
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock size={15} className="text-blue" />
            </div>
            <span>Duration: <strong>{quiz.duration ? `${quiz.duration} minutes` : "Not specified"}</strong></span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-0.5">Before you start</p>
            <p>Once started, the timer cannot be paused. All questions must be attempted.</p>
          </div>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="w-full flex items-center justify-center gap-2.5 bg-blue hover:bg-blue-600 text-white text-base font-semibold py-4 rounded-2xl transition-colors shadow-sm cursor-pointer"
        >
          <Play size={18} /> Start Quiz
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Play size={20} className="text-blue" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Ready to Start?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              The timer will begin immediately after you confirm. Make sure you're in a quiet environment.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
              >
                <X size={15} /> Cancel
              </button>
              <button
                onClick={() => navigate(`/start-quiz/${quiz.id}`)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue text-white text-sm font-medium hover:bg-blue-600 transition cursor-pointer"
              >
                <CheckCircle size={15} /> Start Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnfinishedQuizInfo;
