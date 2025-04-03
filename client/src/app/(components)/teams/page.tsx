"use client";

import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import TeamsPage from "./TeamsPage";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useCreateTeamMutation, useGetTeamLeadsQuery } from "@/store/api";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const page = () => {
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamLeadEmail, setTeamLeadEmail] = useState("");
  const [teamLeadName, setTeamLeadName] = useState("");

  const userEmail = useSearchParams().get("email");

  const [createTeam, { isLoading: isLoadingCreateTeam }] =
    useCreateTeamMutation();

  const { data } = useGetTeamLeadsQuery(
    { email: userEmail! },
    { refetchOnMountOrArgChange: true }
  );

  const isFormValid = () => {
    return teamLeadName && teamDescription && teamLeadEmail && teamLeadName;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      name: teamName,
      description: teamDescription,
      teamLeadName: teamLeadName,
      teamLeadEmail: teamLeadEmail,
      email: userEmail!,
    };
    try {
      const response = await createTeam(formData);
      setTeamName("");
      setTeamDescription("");
      setTeamLeadEmail("");
      setTeamLeadName("");
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

  useEffect(() => {
    data?.map((team) => {
      if (team.email === teamLeadEmail) {
        setTeamLeadName(team.name);
      }
    });
  }, [teamLeadEmail]);

  return (
    <>
      <div className="w-full mb-5">
        <div className="flex w-full text-gray-900">
          <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
            <Header name="Teams" hasFilters={false} hasTeamFilter={false} />
          </div>
        </div>
        <div className="flex gap-4 px-4 w-full h-full  box-border overflow-x-hidden">
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="grid w-full grid-cols-2 w-[400px]">
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="createTeam">Create Team</TabsTrigger>
            </TabsList>
            <TabsContent value="teams" className="w-full">
              <Card>
                <TeamsPage />
              </Card>
            </TabsContent>
            <TabsContent value="createTeam">
              <Card>
                <CardHeader>
                  <CardTitle>Create Team</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-2">
                    <div className="grid gap-4 py-1">
                      <div className="grid grid-cols-8 items-center gap-4 mr-1">
                        <Label className="text-center">
                          Team Name<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          className="col-span-7"
                          required
                        />
                        <Label className="text-center">
                          Team Description
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <textarea
                          value={teamDescription}
                          onChange={(e) => setTeamDescription(e.target.value)}
                          className="col-span-7 shadow border"
                        ></textarea>
                        <Label className="text-center">
                          TeamLeader<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                          value={teamLeadEmail}
                          onValueChange={(value: string) => {
                            setTeamLeadEmail(value);
                          }}
                        >
                          <SelectTrigger className=" col-span-7 p-2 border rounded-md">
                            <SelectValue placeholder="Select Team Leader" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {data?.map((teamLead) => (
                                <SelectItem
                                  key={teamLead.name}
                                  value={teamLead.email}
                                >
                                  {teamLead.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      disabled={!isFormValid() || isLoadingCreateTeam}
                    >
                      Create Team
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
