import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { register, googleAuth } from "../services/auth";
import { toast, ToastContainer } from "react-toastify";
import EvalynLogo from "../assets/logo/evalyn_logo.png";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await googleAuth(credentialResponse.credential);
      if (res.status === 200) {
        localStorage.setItem("evalyn_token", res.data.access_token);
        navigate("/home");
      }
    } catch {
      toast.error("Google sign-up failed. Please try again.");
    }
  };

  const signUpHandle = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const signUpResponse = await register(name, email, password);
      if (signUpResponse.status === 201) {
        toast.success("Account created! Redirecting to sign in…");
        setTimeout(() => navigate("/signin"), 1500);
      }
    } catch (error) {
      if (error.response?.data?.detail === "Email already registered") {
        toast.error("Email already registered. Please use another email.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex items-center justify-center px-4 py-12">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src={EvalynLogo} alt="Evalyn" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h1>
          <p className="text-sm text-gray-500 mb-8">
            Join Evalyn and start building better assessments
          </p>

          <form onSubmit={signUpHandle} className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Full name
              </label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/10 transition-all">
                <FaUser className="text-gray-400 text-sm shrink-0" />
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  className="outline-none flex-1 text-sm bg-transparent placeholder-gray-300 text-gray-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/10 transition-all">
                <FaEnvelope className="text-gray-400 text-sm shrink-0" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="outline-none flex-1 text-sm bg-transparent placeholder-gray-300 text-gray-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Password
              </label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/10 transition-all">
                <FaLock className="text-gray-400 text-sm shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="outline-none flex-1 text-sm bg-transparent placeholder-gray-300 text-gray-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Confirm password
              </label>
              <div
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white focus-within:ring-2 transition-all ${
                  passwordsMismatch
                    ? "border-red-400 focus-within:ring-red-100"
                    : passwordsMatch
                    ? "border-green-400 focus-within:ring-green-100"
                    : "border-gray-200 focus-within:border-blue focus-within:ring-blue/10"
                }`}
              >
                <FaLock className="text-gray-400 text-sm shrink-0" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="outline-none flex-1 text-sm bg-transparent placeholder-gray-300 text-gray-800"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-red-500 mt-0.5">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue text-white font-semibold py-3.5 rounded-xl shadow-sm hover:bg-blue/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-up was cancelled or failed.")}
              theme="outline"
              size="large"
              width="368"
            />
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
