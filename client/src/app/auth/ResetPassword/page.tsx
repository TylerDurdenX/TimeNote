"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [otp, setOtp] = useState("");
  const [remainingTime, setRemainingTime] = useState(30);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (remainingTime === 0) {
      setIsButtonDisabled(false);
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/forgot-password`,
        { email },
        { withCredentials: true }
      );
      toast.success("OTP sent to your email");
      setRemainingTime(30);
      setIsButtonDisabled(true);
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordMatch(e.target.value === confirmPassword);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!passwordMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = { email, otp, password, confirmPassword };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/reset-password`,
        data,
        { withCredentials: true }
      );
      dispatch(setAuthUser(response.data.data.user));
      toast.success("Password reset successful");
      if (isMounted) {
        router.push("/");
      }
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
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
              <KeyRound className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Create New Password
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Enter the OTP sent to your email and create a new password
            </p>
          </div>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <CheckCircle
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300"
                  size={20}
                />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter 6-digit OTP"
                  required
                  disabled={loading}
                  maxLength={6}
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300"
                  size={20}
                />
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                  disabled={loading}
                >
                  {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300"
                  size={20}
                />
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full pl-11 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                    !passwordMatch && confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:ring-purple-500"
                  }`}
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                  disabled={loading}
                >
                  {confirmPasswordVisible ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {!passwordMatch && confirmPassword && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !passwordMatch ||
                !password ||
                !confirmPassword ||
                !otp
              }
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Resetting Password...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Reset Password
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </span>
              )}
            </button>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              {/* Resend OTP Button */}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isButtonDisabled || resendLoading}
                className="w-full bg-white/10 border border-white/20 text-white py-3 px-4 rounded-xl font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {resendLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending...
                  </div>
                ) : isButtonDisabled ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} />
                    Resend OTP in {remainingTime}s
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw
                      size={16}
                      className="group-hover:rotate-180 transition-transform duration-300"
                    />
                    Resend OTP
                  </span>
                )}
              </button>

              {/* Back Button */}
              <Link href="/auth/ForgotPassword" className="block">
                <button
                  type="button"
                  disabled={loading}
                  className="w-full bg-transparent border border-white/30 text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowLeft
                      size={16}
                      className="group-hover:-translate-x-1 transition-transform duration-300"
                    />
                    Back to Forgot Password
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
                href="/auth/login"
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

export default ResetPassword;
