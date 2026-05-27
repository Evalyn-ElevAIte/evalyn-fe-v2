import React from "react";
import { Link } from "react-router-dom";
import EvalynLogo from "../../assets/logo/evalyn_logo.png";
import HeroBg from "../../assets/images/hero_bg.png";
import { ReactTyped } from "react-typed";
import { FaChevronRight, FaGraduationCap, FaBolt, FaChartBar } from "react-icons/fa";

const Hero = () => {
  return (
    <section
      className="relative min-h-screen flex items-center bg-no-repeat bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${HeroBg})` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div className="flex flex-col items-start text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue/10 text-blue text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-blue/20">
              <FaBolt className="text-orange" />
              AI-Powered Assessment Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
              Make learning{" "}
              <span className="text-blue">
                <ReactTyped
                  strings={["Easy.", "Fast.", "Reliable.", "Smarter."]}
                  typeSpeed={100}
                  backSpeed={50}
                  loop
                />
              </span>
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Evalyn helps teachers create AI-powered quizzes, analyze results
              instantly, and track student performance — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 bg-blue text-white font-semibold px-7 py-3.5 rounded-xl shadow-md hover:bg-blue/90 transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base"
              >
                Start for free <FaChevronRight size={12} />
              </Link>
              <Link
                to="/signin"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold px-7 py-3.5 rounded-xl border border-gray-200 shadow-sm hover:border-blue/40 hover:text-blue transition-all text-sm sm:text-base"
              >
                Sign in
              </Link>
            </div>

          </div>

          {/* Right column — feature preview card */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Main card */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <img src={EvalynLogo} alt="Evalyn" className="h-7 w-auto" />
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    Live demo
                  </span>
                </div>

                <h3 className="font-bold text-gray-800 text-sm mb-4">
                  Chapter 5: Photosynthesis Quiz
                </h3>

                <div className="space-y-3 mb-5">
                  {["Multiple choice", "Short answer", "True / False"].map(
                    (type, i) => (
                      <div
                        key={type}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5"
                      >
                        <span className="text-xs text-gray-700 font-medium">
                          Q{i + 1}. {type}
                        </span>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          ✓ Added
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className="bg-blue/5 border border-blue/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue mb-1">
                    AI Analysis ready
                  </p>
                  <p className="text-xs text-gray-500">
                    Class average: 82% · 3 students need review
                  </p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-orange text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                AI-graded
              </div>

              {/* Floating bottom card */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue/10 rounded-full flex items-center justify-center">
                  <FaChartBar className="text-blue text-xs" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Performance tracked</p>
                  <p className="text-[10px] text-gray-400">Updated in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default Hero;
