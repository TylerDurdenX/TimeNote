"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false); // Toggle visibility of password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [otp, setOtp] = useState("");
  const [remainingTime, setRemainingTime] = useState(30);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (remainingTime === 0) {
      setIsButtonDisabled(false); // Enable the button when the timer reaches 0
      return;
    }

    // Update the countdown every second
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup interval when the component unmounts or when the timer reaches 0
    return () => clearInterval(timer);
  }, [remainingTime]);

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/forgot-password`,
        { email },
        { withCredentials: true }
      );
      toast.success("OTP sent to your email");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
    setRemainingTime(30); // Reset the timer back to 30 seconds
    setIsButtonDisabled(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordMatch(e.target.value === confirmPassword); // Check match on password change
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value); // Check match on confirm password change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !password || !confirmPassword) return;
    setLoading(true);
    try {
      const data = { email, otp, password, confirmPassword };
      console.log(data);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/reset-password`,
        data,
        { withCredentials: true }
      );
      dispatch(setAuthUser(response.data.data.user));
      toast.success("Password reset successful");
      router.push("/");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[calc(100vw-14px)] h-[calc(100vh-20px)] flex justify-center items-center bg-white p-[10px_7px] box-border relative">
      {/* <div className="flex w-full h-full max-w-[550px] max-h-[700px] bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.1)] overflow-hidden justify-center items-center rounded-[20px] box-border bg-indigo-100"> */}
      <Toaster position="top-right" />

      <div className="absolute top-0 right-0  bg-[url('/wave.svg')] w-[700px] h-[445px] bg-no-repeat bg-white text-white flex "></div>
      <div className="absolute bottom-0 right-0 m-16 bg-[url('/circle.svg')] w-[300px] h-[280px] bg-white text-white flex justify-center items-center"></div>
      <div className="absolute top-0 left-0 m-12 bg-[url('/logo.svg')] w-[300px] h-[700px] bg-no-repeat bg-white text-white flex "></div>

      <div className="w-[500px] flex justify-center absolute bottom-0 mb-[130px] items-center p-5 bg-white box-border bg-indigo-100">
        <div className="w-full max-w-[350px] text-center">
          <form onSubmit={handleSubmit}>
            <div className="mb-5 text-left">
              <label>Enter OTP</label>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                required
                className="w-full p-[10px] text-[16px] border border-[#ccc] rounded-[5px] box-border"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            {/* Password Input */}
            <div className="mb-5 text-left">
              <label>Password</label>
              <div className="flex relative items-center">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  className="w-full p-[10px] text-[16px] border border-[#ccc] rounded-[5px] box-border"
                  value={password}
                  onChange={handlePasswordChange} // Update password on change
                />
                <span
                  className="absolute right-[10px] cursor-pointer text-[18px] text-[#999] flex items-center justify-center w-[25px] h-[25px] group hover:text-[#333]"
                  id="toggle-password"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <Visibility /> : <VisibilityOff />}
                </span>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-5 text-left">
              <label>Confirm Password</label>
              <div className="flex relative items-center">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  className="w-full p-[10px] text-[16px] border border-[#ccc] rounded-[5px] box-border"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange} // Update confirm password on change
                />
              </div>
            </div>

            {/* Validation Message */}
            {!passwordMatch && (
              <p className="text-red-500 text-sm">Passwords do not match!</p>
            )}
            {!passwordMatch ? (
              <div className="mb-5 ">
                <Button
                  disabled
                  className="bg-indigo-600 text-white border-0 p-2.5 rounded w-[170px] text-base cursor-pointer hover:bg-indigo-500"
                >
                  Submit
                </Button>
              </div>
            ) : (
              <>
                {!loading && (
                  <div className="mb-5 ">
                    <Button className="bg-indigo-600 mt-5 text-white border-0 p-2.5 rounded w-[170px] text-base cursor-pointer hover:bg-indigo-500">
                      Submit
                    </Button>
                  </div>
                )}
                {loading && (
                  <div className="mb-5 ">
                    <Button className="bg-indigo-600 text-white mt-5 border-0 p-2.5 rounded w-[170px] text-base cursor-pointer hover:bg-indigo-500">
                      <Loader className="animate-spin" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </form>
          {!loading && (
            <>
              <Button variant={"ghost"} className="mt-7 bg-gray-200 ml-3">
                <Link href={"/auth/ForgotPassword"}>Go Back</Link>
              </Button>
              <Button
                variant="ghost"
                className="mt-7 bg-gray-200 ml-3"
                onClick={handleResendOtp} // OTP resend action
                disabled={isButtonDisabled} // Disable button initially
              >
                {isButtonDisabled
                  ? `Please wait ${remainingTime}s`
                  : "Resend OTP"}
              </Button>{" "}
            </>
          )}
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default ResetPassword;
