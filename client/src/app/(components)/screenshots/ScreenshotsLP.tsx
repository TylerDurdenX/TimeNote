"use client";

import {
  useGetScreenshotsQuery,
  useUpdateScreenshotFlagMutation,
} from "@/store/api";
import React, { useEffect, useRef, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { SkeletonCard as SkeletonLoader } from "../liveStream/SkeletonLoader";
import { Button } from "@/components/ui/button";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Flag,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Stack } from "@mui/material";
import CircularLoading from "@/components/Sidebar/loading";
import toast from "react-hot-toast";

type Props = {
  from: string;
  to: string;
  setReRenderPage: (page: number) => void;
};

const ScreenshotsLP = ({ from, to, setReRenderPage }: Props) => {
  const [queriesLoaded, setQueriesLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [flagSelected, setFlagSelected] = useState(false);

  localStorage.removeItem("persist:root");

  const { data, isLoading, error, isSuccess, refetch } = useGetScreenshotsQuery(
    { userId: 0, page: page, limit: 12, from, to },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {}, [from, to]);

  useEffect(() => {
    if (!isLoading) {
      // Ensure both queries have finished loading
      if (isSuccess) {
        setQueriesLoaded(true); // Set the flag indicating both queries are loaded
      }
    }
    refetch();
  }, [isLoading, isSuccess, refetch, setReRenderPage]);

  const screenshotList = data?.screenshotList || [];
  const totalPages = data?.totalPages || 0;

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

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
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleZoomIn = () => {
    setZoomLevel((prev) => prev + 0.2);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 1));
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

  const downloadImage = (base64: string, fileName = "download.png") => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {!queriesLoaded ? (
        <div className="grid grid-cols-3 gap-4 w-full">
          {Array(12)
            .fill(0)
            .map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
        </div>
      ) : (
        <>
          <div
            className="flex flex-wrap p-5 mb-2"
            // style={{ maxHeight: "calc(100vh - 1rem)" }}
          >
            <div className="grid grid-cols-3 gap-4 w-full">
              {screenshotList.map((card, index) => (
                <div
                  key={card.id}
                  className="w-full p-1 rounded-lg shadow-md bg-white flex flex-col items-center"
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="relative w-full p-0 bg-transparent border-none focus:outline-none"
                        style={{ paddingTop: "56.25%" }}
                        onClick={handleDialogOpen}
                      >
                        <div className="absolute top-0 left-0 w-full h-full ">
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
                            onClick={() => handleFlagClick(card.id, card.flag)}
                          >
                            {card.flag ? (
                              <>
                                {" "}
                                <Flag className="text-red-600" fill="red" />
                              </>
                            ) : (
                              <>
                                {" "}
                                <Flag />
                              </>
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
                            color="primary"
                            onClick={handleZoomIn}
                            className="bg-blue-500"
                          >
                            <ZoomIn />
                          </Button>
                          <Button
                            color="secondary"
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

                  <div className="w-full mt-2 flex">
                    <div className="w-[55%]">
                      <div className="">{card.username}</div>
                    </div>

                    <div className="w-[35%] flex flex-col">
                      <div className="flex-grow text-xs text-gray-500 ml-1">
                        {new Date(card.date).toISOString().split("T")[0]}
                      </div>

                      <div className="w-[55%] text-xs text-gray-500 ml-1">
                        {card.time}
                      </div>
                    </div>
                    <div className="flex items-center h-full">
                      <div className="w-[10%] text-xs text-gray-500 mt-2">
                        {/* <button
                          onClick={() => handleFlagClick(card.id, card.flag)}
                        > */}
                        {card.flag ? (
                          <>
                            {" "}
                            <Flag className="text-red-600" fill="red" />
                          </>
                        ) : (
                          <>
                            {" "}
                            <Flag />
                          </>
                        )}
                        {/* </button> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
      )}
    </>
  );
};

export default ScreenshotsLP;
