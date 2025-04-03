"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
import { useCreateBreakMutation } from "@/store/api";
import { Card } from "@mui/material";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import BreaksTable from "./breaksTable";

const page = () => {
  const userEmail = useSearchParams().get("email");

  const [breakName, setBreakName] = useState("");
  const [breakDescription, setBreakDescription] = useState("");
  const [breakCode, setBreakCode] = useState("");
  const [breakTimeInMinutes, setBreakTimeInMinutes] = useState("");

  const [createBreak, { isLoading }] = useCreateBreakMutation();

  const isFormValid = () => {
    return breakName && breakDescription && breakCode && breakTimeInMinutes;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9_]*$/; // Only alphanumeric characters and underscore

    // Check if the value matches the regex
    if (regex.test(value)) {
      setBreakCode(value); // Update the state only if valid
    } else {
      // Show a toast message when an invalid character is entered
      toast.error(
        "Invalid character! Only letters, numbers, and underscores are allowed."
      );
    }
  };

  const handleChangeBreakTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[0-9]*$/; // Only alphanumeric characters and underscore

    // Check if the value matches the regex
    if (regex.test(value)) {
      setBreakTimeInMinutes(value); // Update the state only if valid
    } else {
      // Show a toast message when an invalid character is entered
      toast.error("Invalid character! Only numbers are allowed.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      breakName: breakName,
      breakDescription: breakDescription,
      breakCode: breakCode,
      breakTimeInMinutes: breakTimeInMinutes,
      email: userEmail!,
    };
    try {
      const response = await createBreak(formData);
      setBreakCode("");
      setBreakDescription("");
      setBreakName("");
      setBreakTimeInMinutes("");
      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        // @ts-ignore
        toast.success(response.data?.message);
      }
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  return (
    <>
      <div className="w-full mb-5">
        <div className="flex w-full text-gray-900">
          <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
            <Header name="Breaks" hasFilters={false} hasTeamFilter={false} />
          </div>
        </div>
        <div className="flex gap-4 px-4 w-full h-full  box-border overflow-x-hidden">
          <Tabs defaultValue="breaks" className="w-full">
            <TabsList className="grid w-full grid-cols-2 w-[400px]">
              <TabsTrigger value="breaks">Breaks</TabsTrigger>
              <TabsTrigger value="createBreak">Create Break</TabsTrigger>
            </TabsList>
            <TabsContent value="breaks" className="w-full">
              <Card>
                <BreaksTable />
              </Card>
            </TabsContent>
            <TabsContent value="createBreak">
              <Card>
                <CardHeader>
                  <CardTitle>Create Break</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-2">
                    <div className="grid gap-4 py-1">
                      <div className="grid grid-cols-8 items-center gap-4 mr-1">
                        <Label className="text-center">
                          Break Name<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          value={breakName}
                          onChange={(e) => setBreakName(e.target.value)}
                          className="col-span-7"
                          required
                        />
                        <Label className="text-center">
                          Break Code<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          value={breakCode}
                          onChange={handleChange}
                          className="col-span-7"
                          required
                          placeholder="allowed characters a-z, A-Z, 0-9"
                        />
                        <Label className="text-center">
                          Break Description
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <textarea
                          value={breakDescription}
                          onChange={(e) => setBreakDescription(e.target.value)}
                          className="col-span-7 shadow border"
                        ></textarea>
                        <Label className="text-center">
                          Break Duration
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          value={breakTimeInMinutes}
                          onChange={handleChangeBreakTime}
                          className="col-span-7"
                          placeholder="Please enter duration in minutes"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      disabled={!isFormValid() || isLoading}
                    >
                      Create Break
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default page;
