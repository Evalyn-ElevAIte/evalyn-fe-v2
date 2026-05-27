import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleAuth } from "../services/auth";
import EvalynLogo from "../assets/logo/evalyn_logo.png";
import "react-toastify/dist/ReactToastify.css";

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await googleAuth(credentialResponse.credential);
      if (res.status === 200) {
        localStorage.setItem("evalyn_token", res.data.access_token);
        navigate("/home");
      }
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  const signInHandle = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const signInResponse = await login(email, password);
      if (signInResponse.status === 200) {
        localStorage.setItem("evalyn_token", signInResponse.data.access_token);
        navigate("/home");
      }
    } catch {
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your Evalyn account</p>

          <form onSubmit={signInHandle} className="flex flex-col gap-5">
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue text-white font-semibold py-3.5 rounded-xl shadow-sm hover:bg-blue/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
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
              onError={() => toast.error("Google sign-in was cancelled or failed.")}
              theme="outline"
              size="large"
              width="368"
            />
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue font-semibold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
