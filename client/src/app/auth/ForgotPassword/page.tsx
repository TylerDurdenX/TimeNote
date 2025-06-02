"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Loader,
  Mail,
  ArrowRight,
  ArrowLeft,
  Airplay,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/forgot-password`,
        { email },
        { withCredentials: true }
      );
      toast.success("OTP sent to your email");
      if (isMounted) {
        router.push(`/auth/ResetPassword?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Glassmorphism container */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Airplay className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Enter your email address and we'll send you an OTP to reset your
              password
            </p>
          </div>

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send Reset Code
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </span>
                )}
              </button>

              {/* Back to Login Button */}
              <Link href="/" className="block">
                <button
                  type="button"
                  disabled={loading}
                  className="w-full bg-white/10 border border-white/20 text-white py-3 px-4 rounded-xl font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowLeft
                      size={20}
                      className="group-hover:-translate-x-1 transition-transform duration-300"
                    />
                    Back to Sign In
                  </span>
                </button>
              </Link>
            </div>
          </form>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-gray-400">
              Remember your password?{" "}
              <Link
                href="/"
                className="text-purple-400 hover:text-purple-300 transition-colors duration-300 hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
          },
        }}
      />
    </div>
  );
};

export default ForgotPassword;
