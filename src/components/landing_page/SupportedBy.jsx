import React from "react";
import komdigi from "../../assets/logo/komdigi_logo.png";
import microsoft from "../../assets/logo/microsoft_logo.png";
import mereka from "../../assets/logo/mereka_logo.png";
import elevaite from "../../assets/logo/elevaite_logo.png";
import bijiBiji from "../../assets/logo/biji_biji_logo.png";

const supportedLogos = [
  { name: "Komdigi", src: komdigi },
  { name: "Microsoft", src: microsoft },
  { name: "Mereka", src: mereka },
  { name: "Elevaite", src: elevaite },
  { name: "Biji Biji", src: bijiBiji },
];

const SupportedBy = () => {
  return (
    <div className="bg-white border-y border-gray-100 py-10 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
          Supported by
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
          {supportedLogos.map((logo) => (
            <img
              key={logo.name}
              src={logo.src}
              alt={logo.name}
              className="h-8 sm:h-10 md:h-12 object-contain max-w-[120px] opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportedBy;
