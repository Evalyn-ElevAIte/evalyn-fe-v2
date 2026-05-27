import React from "react";
import { FaBookOpen, FaChartLine, FaHistory } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const services = [
  {
    icon: FaBookOpen,
    color: "text-blue",
    bg: "bg-blue/10",
    title: "Quiz Builder",
    description:
      "Create custom quizzes in minutes with multiple question types — multiple choice, short answer, and more. Share with students via a simple join code.",
    tag: "Interactive",
  },
  {
    icon: FaChartLine,
    color: "text-orange",
    bg: "bg-orange/10",
    title: "AI Analysis",
    description:
      "Our AI engine instantly grades submissions, highlights weak areas, and generates detailed performance reports — saving hours of manual work.",
    tag: "AI-Powered",
  },
  {
    icon: FaHistory,
    color: "text-green-500",
    bg: "bg-green-50",
    title: "Progress Tracking",
    description:
      "Monitor individual and class-wide trends over time. Identify students who need support before they fall behind.",
    tag: "Real-time",
  },
];

const OurServices = () => {
  return (
    <section id="services" className="bg-white py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange/10 text-orange text-xs font-semibold px-4 py-2 rounded-full mb-5 border border-orange/20">
            <HiSparkles />
            What we offer
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to teach better
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Evalyn brings together quiz creation, AI-powered grading, and
            performance analytics in a single, easy-to-use platform.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 ${service.bg} rounded-xl flex items-center justify-center mb-5`}
                >
                  <Icon className={`${service.color} text-xl`} />
                </div>

                {/* Tag */}
                <span className="inline-block text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full mb-3">
                  {service.tag}
                </span>

                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Bottom accent line on hover */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${service.bg} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurServices;
