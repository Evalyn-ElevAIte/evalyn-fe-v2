import React from "react";
import support1 from "../../assets/images/support1.jpg";
import support2 from "../../assets/images/support2.jpg";
import support3 from "../../assets/images/support3.jpg";
import { FiArrowRight } from "react-icons/fi";

const supportSteps = [
  {
    number: "01",
    label: "Create",
    title: "Build a quiz in minutes",
    description:
      "Add questions, set time limits, and choose question types. Upload a document and let AI generate questions for you automatically.",
    image: support1,
    accent: "bg-blue",
    accentLight: "bg-blue/10 text-blue",
  },
  {
    number: "02",
    label: "Analyze",
    title: "Instant AI-powered results",
    description:
      "Once students submit, our AI grades everything and surfaces actionable insights — no more manual marking.",
    image: support2,
    accent: "bg-orange",
    accentLight: "bg-orange/10 text-orange",
  },
  {
    number: "03",
    label: "Improve",
    title: "Track growth over time",
    description:
      "Follow individual student progress across every quiz. Spot patterns, celebrate wins, and intervene early when needed.",
    image: support3,
    accent: "bg-green-500",
    accentLight: "bg-green-50 text-green-600",
  },
];

const Support = () => {
  return (
    <section id="how-it-works" className="bg-[#F8FBFF] py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-blue/10 text-blue text-xs font-semibold px-4 py-2 rounded-full mb-5 border border-blue/20">
            How it works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Three steps to better teaching
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto">
            From quiz creation to performance review — Evalyn handles the
            heavy lifting so you can focus on your students.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-24">
          {supportSteps.map((step, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
              style={{ direction: idx % 2 === 1 ? "rtl" : "ltr" }}
            >
              {/* Text side */}
              <div style={{ direction: "ltr" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${step.accentLight}`}
                  >
                    {step.label}
                  </span>
                  <span className="text-gray-300 font-bold text-sm">
                    Step {step.number}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {step.title}
                </h3>

                <p className="text-gray-500 text-base leading-relaxed mb-6">
                  {step.description}
                </p>

                <a
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue hover:gap-3 transition-all"
                >
                  Try it now <FiArrowRight />
                </a>
              </div>

              {/* Image side */}
              <div style={{ direction: "ltr" }}>
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 group">
                  <img
                    src={step.image}
                    alt={`Step ${step.number}: ${step.title}`}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Number overlay */}
                  <div
                    className={`absolute top-4 left-4 ${step.accent} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow`}
                  >
                    {step.number}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Support;
