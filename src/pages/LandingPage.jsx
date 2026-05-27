import React from "react";
import Navbar from "../components/landing_page/Navbar";
import Hero from "../components/landing_page/Hero";
import SupportedBy from "../components/landing_page/SupportedBy";
import OurServices from "../components/landing_page/OurServices";
import Support from "../components/landing_page/Support";
import StartBox from "../components/landing_page/StartBox";
import Footer from "../components/landing_page/Footer";

const LandingPage = () => {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <SupportedBy />
      <OurServices />
      <Support />
      <StartBox />
      <Footer />
    </div>
  );
};

export default LandingPage;
