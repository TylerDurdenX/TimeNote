import Header from "@/components/Header";
import React from "react";
import { UserWorkloadSummary } from "./UserWorkloadSummary";
import WorkloadCalendar from "./WorkloadCalendar";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="w-full mb-5">
      <WorkloadCalendar />
    </div>
  );
};

export default page;
