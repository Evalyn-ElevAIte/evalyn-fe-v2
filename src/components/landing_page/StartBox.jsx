import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const StartBox = () => {
  return (
    <section className="bg-white py-24 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue via-blue/90 to-[#0e6ba8] px-8 py-16 sm:px-16 sm:py-20 text-center shadow-2xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.03] rounded-full" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/30">
              <HiSparkles />
              Free to get started
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to transform
              <br />
              your classroom?
            </h2>

            <p className="text-white/80 text-base sm:text-lg mb-10 max-w-md mx-auto">
              Join hundreds of educators already using Evalyn to save time and
              improve student outcomes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm sm:text-base"
              >
                Start for free <FaChevronRight size={12} />
              </Link>
              <Link
                to="/signin"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-xl border border-white/30 hover:bg-white/20 transition-all text-sm sm:text-base"
              >
                Sign in
              </Link>
            </div>

            <p className="text-white/50 text-xs mt-6">
              No credit card required · Free forever plan available
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StartBox;
