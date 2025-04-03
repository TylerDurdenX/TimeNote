import Header from "@/components/Header";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="w-full mb-5">
      <div className="flex w-full text-gray-900">
        <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
          <Header name="Activity" hasFilters={false} hasTeamFilter={false} />
        </div>
      </div>
      <div className="flex justify-center items-center min-h-screen w-full"></div>
    </div>
  );
};

export default page;
