"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setAuthUser } from "@/store/authSlice";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false); // Toggle visibility of password
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/login`,
        formData,
        { withCredentials: true }
      );

      const user = response.data.data.user;
      toast.success("Login Successful");
      dispatch(setAuthUser(user));
      router.push(`/Dashboard?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen items-center flex justify-center">
          <div className="absolute top-0 right-0  bg-[url('/wave.svg')] w-[700px] h-[445px] bg-no-repeat bg-white text-white flex "/>
          <div className="absolute bottom-0 right-0 m-16 bg-[url('/circle.svg')] w-[320px] h-[280px] bg-white text-white flex justify-center items-center"/>
          <div className="absolute top-0 left-0  w-[400px] h-[350px] bg-no-repeat bg-white text-white flex ">
          <img src="/lynklog.png" alt="Description of Image" className="w-180 h-180"></img>
          </div>
          <div className="absolute bottom-0 left-0 mb-2 ml-4 bg-no-repeat bg-white text-white flex "><h2 className="text-indigo-900">Lynk247 a product of Optimize Innovations</h2></div>

{/* <div className="flex w-full h-full max-w-[550px] max-h-[700px] bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.1)] overflow-hidden justify-center items-center rounded-[20px] box-border bg-indigo-100"> */}
<div className="w-[500px]  flex justify-center absolute top-0 mt-[190px] items-center p-5 bg-white box-border bg-indigo-100 oerflow-hidden">
          <div className="w-full max-w-[350px] text-center">
          <h1 className="mt-[20px] font-bold text-5xl text-indigo-700 font-nunito">Login</h1>
            <h1 className="mt-[20px] mb-[20px] text-xl">Welcome to <span className="text-indigo-900 text-2xl">Lynk24<span className="text-indigo-900 text-xl">7</span>!</span></h1>
            <p>Please sign in to your account</p>

            <form onSubmit={handleSubmit}>
              <div className="mt-5 mb-5 text-left">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-full p-[10px] text-[16px] border border-[#ccc] rounded-[5px] box-border"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
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
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span
                    className="absolute right-[10px] cursor-pointer text-[18px] text-[#999] flex items-center justify-center w-[25px] h-[25px] group hover:text-[#333]"
                    id="toggle-password"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <Visibility /> : <VisibilityOff />}
                  </span>
                </div>
                <a
                  href="/auth/ForgotPassword"
                  className="text-[12px] text-[#5a67d8] no-underline hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              {!loading && (
                <Button className="bg-indigo-600 text-white border-0 p-2.5 rounded w-[170px] text-base cursor-pointer hover:bg-indigo-500">
                  Sign In
                </Button>
              )}
              {loading && (
                <Button className="bg-purple-700 text-white border-0 p-2.5 rounded w-[170px] text-base cursor-pointer hover:bg-indigo-500">
                  <Loader className="animate-spin" />
                </Button>
              )}
            </form>
          </div>
        {/* </div> */}
      </div>
      
    </div>
  );
};

export default App;
