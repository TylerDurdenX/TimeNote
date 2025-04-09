"use client";

import React, { useEffect, useRef, useState } from "react";
import LiveStreamHeader from "@/components/Header/liveStreamHeader";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetLiveStreamUsersQuery } from "@/store/api";
import { useSearchParams } from "next/navigation";
import { SkeletonCard as SkeletonLoader } from "./SkeletonLoader";
// import ScreenShareButton from "./ScreenShareButton";

const Page = () => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [value, setValue] = React.useState("");
  const [queriesLoaded, setQueriesLoaded] = useState(false);

  const userEmail = useSearchParams().get("email");
  localStorage.removeItem("persist:root");

  const { data, isLoading, error, isSuccess, refetch } =
    useGetLiveStreamUsersQuery(
      { email: userEmail!, username: value },
      { refetchOnMountOrArgChange: true }
    );

  useEffect(() => {
    if (!isLoading) {
      if (isSuccess) {
        setQueriesLoaded(true);
      }
    }
    refetch();
  }, [isLoading, isSuccess, refetch, value]);

  const clearFilter = () => {
    setValue("");
  };

  return (
    <>
      <div className="w-full sm:flex-row space-y-0 aspect-auto">
        <div className="flex w-full text-gray-900">
          <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
            <LiveStreamHeader
              name="Live Streaming"
              hasFilters={true}
              clearFilter={clearFilter}
              setValue={setValue}
              value={value}
              email={userEmail!}
            />
          </div>
        </div>
        <div className="flex gap-4 px-4 mr-4 h-full w-full overflow-hidden">
          <div className="grid grid-cols-5 gap-4 w-full">
            {isLoading
              ? // Show skeleton loader while loading
                Array(5)
                  .fill(0)
                  .map((_, index) => <SkeletonLoader key={index} />)
              : // Render the actual data after loading
                data?.map((card, index) => (
                  <div
                    key={index}
                    className="w-full p-1 rounded-lg shadow-md bg-white flex flex-col items-center"
                  >
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="relative w-full p-0 bg-transparent border-none focus:outline-none"
                          style={{ paddingTop: "56.25%" }}
                        >
                          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                            <img
                              src={card.screenshot.base64}
                              alt="Base64 Image"
                              className="w-full h-full object-cover"
                              onError={(
                                e: React.SyntheticEvent<HTMLImageElement>
                              ) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "path/to/fallback/image.jpg";
                              }}
                            />
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[90vw] lg:max-w-[90vw]  overflow-auto">
                        <DialogHeader>
                          <DialogTitle>{card.username}</DialogTitle>
                        </DialogHeader>

                        <div
                          className="relative w-full h-full overflow-hidden"
                          style={{
                            paddingTop: "39.375%",
                          }}
                        >
                          <div className="absolute top-0 left-0 w-[calc(100%)] h-[calc(100%)]">
                            {/* <img
                              ref={imgRef}
                              src={card.screenshot.base64}
                              alt="Full-size Base64 Image"
                              className="object-cover mb-15"
                              style={{
                                width: "100%",
                                height: "100%",
                              }}
                            /> */}
                            {/* <ScreenShareButton targetIp="" targetMac="" /> */}
                          </div>
                        </div>

                        <DialogFooter className="w-full justify-between items-center">
                          <div className="absolute flex gap-4 left-10"></div>

                          <div className="flex items-center space-x-2"></div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <div className="w-full mt-2 flex">
                      <div className="w-full">
                        <div className="text-lg font-semibold">
                          {card.username}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
