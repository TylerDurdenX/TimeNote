"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Airplay, GalleryVerticalEnd, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { setAuthUser } from "@/store/authSlice";
import { setUserRoles } from "@/store/store";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  type Role = {
    code: string;
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
      setTimeout(() => {}, 3000);
      const user = response.data.data.user;

      if (user.roles !== null && user.roles !== undefined) {
        const commaSeparatedNames = user.roles
          .map((role: Role) => role.code)
          .join(", ");
        sessionStorage.setItem("userRoles", commaSeparatedNames);
        dispatch(setUserRoles(commaSeparatedNames));
      }
      toast.success("Login Successful");
      dispatch(setAuthUser(user));
      sessionStorage.setItem("email", user.email);
      //router.push(`/Dashboard?email=${encodeURIComponent(formData.email)}`);
      router.push(`/projectsDashboard?email=${encodeURIComponent(user.email)}`);
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-hidden sm:overflow-auto ">
      <Toaster position="top-right" />

      {/* <div className="w-[500px]  flex justify-center absolute top-0 mt-[190px] items-center p-5 bg-white box-border oerflow-hidden">
        <div className="w-full max-w-[350px] text-center">
          <h1 className="mt-[20px] font-bold text-5xl text-indigo-700 font-nunito">
            Login
          </h1>
          <h1 className="mt-[20px] mb-[20px] text-xl">
            Welcome to{" "}
            <span className="text-indigo-900 text-2xl">
              Lynk24<span className="text-indigo-900 text-xl">7</span>!
            </span>
          </h1>
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
      </div> */}
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Airplay className="size-4" />
            </div>
            TimeNote
          </a>
          {/* <LoginForm /> */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Login with your Credientials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
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
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="/auth/ForgotPassword"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
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
                      </div>{" "}
                    </div>
                    {!loading && (
                      <Button type="submit" className="w-full">
                        Login
                      </Button>
                    )}
                    {loading && (
                      <Button className="w-full">
                        <Loader className="animate-spin" />
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default App;
