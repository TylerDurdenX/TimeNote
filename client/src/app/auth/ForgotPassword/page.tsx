"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { Ghost, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/forgot-password`,
        { email },
        { withCredentials: true }
      );
      toast.success("OTP sent to your email");
      router.push(`/auth/ResetPassword?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[calc(100vw)] h-[calc(100vh)] flex  bg-no-repeat bg-top-right justify-center items-center bg-white p-[10px_7px] box-border relative">
      <Toaster position="top-right" />
      <div className="absolute top-0 right-0  bg-[url('/wave.svg')] w-[700px] h-[445px] bg-no-repeat bg-white text-white flex "></div>
      <div className="absolute bottom-0 right-0 m-16 bg-[url('/circle.svg')] w-[300px] h-[280px] bg-white text-white flex justify-center items-center"></div>
      <div className="absolute top-0 left-0 m-12 bg-[url('/logo.svg')] w-[300px] h-[700px] bg-no-repeat bg-white text-white flex "></div>

      {/* <div className="flex w-full h-full max-w-[550px] max-h-[700px] bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.1)] overflow-hidden justify-center items-center rounded-[20px] box-border bg-indigo-100"> */}
      <div className="w-[500px] flex justify-center absolute items-center p-5 bg-white box-border bg-indigo-100">
        <div className="w-full max-w-[350px] text-center">
          <h2 className="text-xl text-gray-900 mb-7 font-medium">
            Enter your email
          </h2>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-[10px] text-[16px] border border-[#ccc] rounded-[5px] box-border"
          />
          {!loading && (
            <>
              <Button className="mt-7" onClick={handleSubmit}>
                Submit
              </Button>
              <Button variant={"ghost"} className="mt-7 bg-gray-200 ml-3">
                <Link href={"/"}>Go Back</Link>
              </Button>
            </>
          )}
          {loading && (
            <Button className="mt-7">
              <Loader className="animate-spin" />
            </Button>
          )}
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default ForgotPassword;
