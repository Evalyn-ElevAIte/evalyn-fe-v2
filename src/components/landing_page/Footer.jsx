import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import EvalynLogo from "../../assets/logo/evalyn_logo.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img src={EvalynLogo} alt="Evalyn" className="h-8 w-auto mb-4 brightness-0 invert" />
            <p className="text-sm leading-relaxed max-w-sm">
              Evalyn is an AI-powered assessment platform that helps teachers
              create quizzes, grade submissions, and track student performance —
              all in one place.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-blue/80 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={14} className="text-white" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-blue/80 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={14} className="text-white" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-blue/80 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={14} className="text-white" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <p className="text-white text-sm font-semibold mb-4">Product</p>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Features", href: "#services" },
                { label: "How it works", href: "#how-it-works" },
                { label: "Sign up", href: "/signup" },
                { label: "Sign in", href: "/signin" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white text-sm font-semibold mb-4">Contact</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@evalyn.app"
                  className="hover:text-white transition-colors"
                >
                  support@evalyn.app
                </a>
              </li>
              <li className="text-gray-500 text-xs leading-relaxed">
                For feedback, bug reports, or feature requests, reach out via
                email or social media.
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {year} Evalyn. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
