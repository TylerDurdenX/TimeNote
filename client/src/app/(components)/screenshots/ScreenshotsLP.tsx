import { useGetScreenshotsQuery } from "@/store/api";
import React, { useEffect, useRef, useState } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ScreenshotsLP = () => {
  const { data, isLoading, error } = useGetScreenshotsQuery(
    {
      email: "",
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [zoomLevel, setZoomLevel] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = () => {
    setZoomLevel((prev) => prev + 0.2); // Increase zoom by 20%
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 1)); // Decrease zoom by 20%, with a minimum of 1
  };

  // Dragging functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    const { clientX, clientY } = e;
    const startX = clientX - offset.x;
    const startY = clientY - offset.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragging) return;
      const newOffsetX = moveEvent.clientX - startX;
      const newOffsetY = moveEvent.clientY - startY;
      setOffset({ x: newOffsetX, y: newOffsetY });
    };

    const handleMouseUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    if (imgRef.current) {
      // Reset offset if zoom level changes (optional, based on your preference)
      setOffset({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  return (
    <div
      className="flex flex-wrap p-5 overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 4rem)" }}
    >
      {/* Unified grid container */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {data?.map((card, index) => (
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
              src={card.base64}
              alt="Base64 Image"
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-[70vw]">
        <DialogHeader>
          <DialogTitle>{card.username}</DialogTitle>
          <DialogDescription>{card.time}</DialogDescription>
        </DialogHeader>

        {/* Image container with drag and zoom */}
        <div
          className="relative w-[70vw] overflow-hidden"
          style={{
            paddingTop: "39.375%", // 9/16 aspect ratio, 70% width
            cursor: dragging ? "grabbing" : "grab", // Change cursor during dragging
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-0 left-0 w-full h-full">
            <img
              ref={imgRef}
              src={card.base64}
              alt="Full-size Base64 Image"
              className="object-cover"
              style={{
                transform: `scale(${zoomLevel}) translate(${offset.x}px, ${offset.y}px)`,
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>

        {/* Zoom in and out buttons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Button
            color="primary"
            onClick={handleZoomIn}
            className="bg-blue-500"
          >
            Zoom In
          </Button>
          <Button
            color="secondary"
            onClick={handleZoomOut}
            className="bg-red-500"
          >
            Zoom Out
          </Button>
        </div>

        <DialogFooter>
          <Button type="submit"></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


            <div className="w-full mt-2 flex justify-between items-center">
              <div className="">{card.username}</div>

              <div className="text-sm text-gray-500">{card.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScreenshotsLP;
