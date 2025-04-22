"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useGetFlaggedScreenshotsQuery,
  useGetLiveStreamUsersQuery,
  useUpdateScreenshotFlagMutation,
} from "@/store/api";
import { useSearchParams } from "next/navigation";
import { SkeletonCard as SkeletonLoader } from "../liveStream/SkeletonLoader";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Flag,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination, Stack } from "@mui/material";
// import ScreenShareButton from "./ScreenShareButton";

type Props = {
  value: number;
};

const FlaggedScreenshots = ({ value }: Props) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [queriesLoaded, setQueriesLoaded] = useState(false);
  const [page, setPage] = useState(1);

  const userEmail = useSearchParams().get("email");
  localStorage.removeItem("persist:root");

  const { data, isLoading, error, isSuccess, refetch } =
    useGetFlaggedScreenshotsQuery(
      { userId: value, page: page, limit: 12 },
      { refetchOnMountOrArgChange: true }
    );

  const screenshotList = data?.screenshotList || [];
  const totalPages = data?.totalPages || 0;

  useEffect(() => {
    if (!isLoading) {
      if (isSuccess) {
        setQueriesLoaded(true);
      }
    }
    refetch();
  }, [isLoading, isSuccess, refetch, value]);

  const [updateScreenshot] = useUpdateScreenshotFlagMutation();

  const handleFlagClick = async (id: number, flag: boolean) => {
    const response = await updateScreenshot({ screenshotId: id, flag: flag });
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
      toast.success(response.data.error?.message!);
    }
  };

  const [zoomLevel, setZoomLevel] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoomLevel((prev) => prev + 0.2);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 1));
  };
  const downloadImage = (base64: string, fileName = "download.png") => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const moveImage = (direction: "up" | "down" | "left" | "right") => {
    setOffset((prev) => {
      switch (direction) {
        case "up":
          return { ...prev, y: prev.y - 30 };
        case "down":
          return { ...prev, y: prev.y + 30 };
        case "left":
          return { ...prev, x: prev.x - 30 };
        case "right":
          return { ...prev, x: prev.x + 30 };
        default:
          return prev;
      }
    });
  };

  const handleDialogOpen = () => {
    setZoomLevel(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <>
      <div className="w-full">
        <div className="flex gap-4 px-4 mr-4 h-full w-full overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
            {isLoading
              ? Array(10)
                  .fill(0)
                  .map((_, index) => <SkeletonLoader key={index} />)
              : screenshotList.map((card, index) => (
                  <div
                    key={index}
                    className="w-full p-1 rounded-lg shadow-md bg-white flex flex-col items-center"
                  >
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="relative w-full p-0 bg-transparent border-none focus:outline-none"
                          style={{ paddingTop: "56.25%" }}
                          onClick={handleDialogOpen}
                        >
                          <div className="absolute top-0 left-0 w-full h-full">
                            <img
                              src={card.base64}
                              alt="Base64 Image"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[80vw] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{card.username}</DialogTitle>
                          <div className="flex items-center justify-between">
                            <DialogDescription>{card.time}</DialogDescription>
                            <button
                              onClick={() =>
                                handleFlagClick(card.id, card.flag)
                              }
                            >
                              {card.flag ? (
                                <Flag className="text-red-600" fill="red" />
                              ) : (
                                <Flag />
                              )}
                            </button>
                          </div>
                        </DialogHeader>

                        <div className="relative w-full h-[60vh] flex justify-center items-center overflow-hidden">
                          <img
                            ref={imgRef}
                            src={card.base64}
                            alt="Full-size Base64 Image"
                            className="max-w-full max-h-full object-contain transition-transform duration-200 ease-in-out"
                            style={{
                              transform: `scale(${zoomLevel}) translate(${offset.x}px, ${offset.y}px)`,
                            }}
                          />
                        </div>

                        <DialogFooter className="w-full flex justify-center items-center relative mt-4">
                          <div className="absolute flex gap-4 left-10">
                            <Button
                              onClick={handleZoomIn}
                              className="bg-blue-500"
                            >
                              <ZoomIn />
                            </Button>
                            <Button
                              onClick={handleZoomOut}
                              className="bg-red-500"
                            >
                              <ZoomOut />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 bg-green-500 text-white rounded-md mr-2"
                              onClick={() => downloadImage(card.base64)}
                            >
                              <Download />
                            </button>
                            <button
                              className="p-2 bg-blue-500 text-white rounded-md"
                              onClick={() => moveImage("left")}
                            >
                              <ChevronLeft />
                            </button>
                            <button
                              className="p-2 bg-blue-500 text-white rounded-md"
                              onClick={() => moveImage("up")}
                            >
                              <ChevronUp />
                            </button>
                            <button
                              className="p-2 bg-blue-500 text-white rounded-md"
                              onClick={() => moveImage("down")}
                            >
                              <ChevronDown />
                            </button>
                            <button
                              className="p-2 bg-blue-500 text-white rounded-md"
                              onClick={() => moveImage("right")}
                            >
                              <ChevronRight />
                            </button>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <div className="w-full mt-2 flex justify-between items-start">
                      <div className="w-[55%]">
                        <div>{card.username}</div>
                      </div>

                      <div className="w-[35%] flex flex-col text-xs text-gray-500">
                        <div className="ml-1">
                          {new Date(card.date).toISOString().split("T")[0]}
                        </div>
                        <div className="ml-1">{card.time}</div>
                      </div>

                      <div className="flex items-center">
                        <button
                          onClick={() => handleFlagClick(card.id, card.flag)}
                        >
                          {card.flag ? (
                            <Flag className="text-red-600" fill="red" />
                          ) : (
                            <Flag />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        <div className="flex justify-center items-center mt-4 w-full">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              shape="rounded"
              onChange={handlePageChange}
              page={page}
            />
          </Stack>
        </div>
      </div>
    </>
  );
};

export default FlaggedScreenshots;
