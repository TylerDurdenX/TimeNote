import React, { useEffect, useRef, useState } from "react";
import { usePiP } from "./PIPContext"; // Import the context

const PiPVideo: React.FC = () => {
  const { isPiPEnabled } = usePiP();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Timer logic to increase seconds
  useEffect(() => {
    if (isPiPActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      // Clean up the timer when PiP mode is disabled
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    // Clean up interval when component unmounts or PiP is disabled
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPiPActive]);

  // Handle PiP mode with Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // If the page becomes hidden (user switches to another window), PiP stays visible
        try {
          if (!document.pictureInPictureElement && videoRef.current) {
            await videoRef.current.requestPictureInPicture();
            setIsPiPActive(true); // Mark PiP as active
          }
        } catch (err) {
          console.error("Error with PiP:", err);
        }
      } else {
        // If the page becomes visible again (user switches back), exit PiP
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
          setIsPiPActive(false); // Mark PiP as inactive
        }
      }
    };

    // Add event listener for visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPiPActive]);

  // Handle user gesture to start PiP
  const handlePiPClick = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true); // Mark PiP as active after the user click
      } catch (err) {
        console.error("Error entering PiP:", err);
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Timer: {seconds}s</h2>
      <video
        ref={videoRef}
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        controls
        width="300"
        style={{ marginBottom: "20px", borderRadius: "10px" }}
        autoPlay
      ></video>
      {/* Button to manually enable PiP */}
      <button onClick={handlePiPClick}>Enable Picture-in-Picture</button>
    </div>
  );
};

export default PiPVideo;
