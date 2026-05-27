import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import EvalynLogo from "../../assets/logo/evalyn_logo.png";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#services" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "About", href: "#footer" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={EvalynLogo} alt="Evalyn" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue ${
                  scrolled ? "text-gray-600" : "text-gray-700"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/signin"
            className="text-sm font-medium text-gray-700 hover:text-blue transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold bg-blue text-white px-5 py-2 rounded-lg hover:bg-blue/90 transition-colors shadow-sm"
          >
            Get started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-700 p-1"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 pb-6 pt-4 flex flex-col gap-4 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-gray-700 font-medium hover:text-blue transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <hr className="border-gray-100" />
          <Link
            to="/signin"
            className="text-gray-700 font-medium hover:text-blue transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="bg-blue text-white font-semibold text-center py-3 rounded-lg hover:bg-blue/90 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Get started
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
