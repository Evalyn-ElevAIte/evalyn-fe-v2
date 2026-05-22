import React from "react";
import { Award, ArrowRight } from "lucide-react";
import finishVector from "../../assets/vector/vector_graded_info.png";

const GradedQuizInfo = ({ quiz }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 sm:px-10 py-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Award size={15} className="text-emerald-200" />
            <span className="text-emerald-100 text-sm font-medium">Graded</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{quiz.title || "Quiz Graded"}</h1>
          <p className="text-emerald-100 text-sm">Your assessment has been reviewed and graded.</p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-5" />
      </div>

      <div className="max-w-lg mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex justify-center mb-6">
          <img src={finishVector} alt="Graded" className="w-56 sm:w-72 object-contain" />
        </div>

        {/* Instruction card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Award size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Your result is ready!</p>
              <p className="text-xs text-emerald-600 mt-0.5 mb-3">
                Your instructor has reviewed your submission. Check the Grades tab to see your detailed feedback and score.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                View in the "My Grades" tab <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradedQuizInfo;
