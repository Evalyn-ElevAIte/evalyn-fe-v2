import React from "react";
import { Sparkles, Clock } from "lucide-react";
import waitedVector from "../../assets/vector/vector_submitted_quiz.png";

const SubmittedQuizInfo = ({ quiz }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 px-6 sm:px-10 py-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={15} className="text-purple-200" />
            <span className="text-purple-100 text-sm font-medium">Submitted</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{quiz.title || "Quiz Submitted"}</h1>
          <p className="text-purple-100 text-sm">Your answers have been received successfully.</p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-5" />
      </div>

      <div className="max-w-lg mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex justify-center mb-6">
          <img src={waitedVector} alt="Submitted" className="w-56 sm:w-72 object-contain" />
        </div>

        {/* Status card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">AI is analyzing your answers</p>
              <p className="text-xs text-gray-500 mt-0.5">Results will be available once your instructor reviews the AI analysis.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <Clock size={16} className="text-blue mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Come back later to check your score, or wait for your instructor to publish the result.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmittedQuizInfo;
