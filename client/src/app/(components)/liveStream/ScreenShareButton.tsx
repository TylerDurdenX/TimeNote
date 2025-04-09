// // components/ScreenShareButton.tsx
// "use client";
// import React, { useRef, useEffect } from "react";
// import io from "socket.io-client";

// // Define TypeScript types
// interface ScreenShareButtonProps {
//   targetIp: string;
//   targetMac: string;
// }

// interface Offer {
//   sdp: string;
//   type: RTCSdpType; // ✅ Explicitly define the type
// }

// const socket = io("http://localhost:8000");

// const ScreenShareButton: React.FC<ScreenShareButtonProps> = ({
//   targetIp,
//   targetMac,
// }) => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);

//   const startScreenSharing = async () => {
//     socket.emit("start-screen-share", { ip: targetIp, mac: targetMac });
//   };

//   //   useEffect(() => {
//   //     socket.on("connect", () => {
//   //       console.log("Connected to WebSocket:", socket.id);
//   //     });

//   //     return () => {
//   //       socket.off("connect");
//   //     };
//   //   }, []);

//   //   useEffect(() => {
//   //     socket.on("screen-offer", async (offer: Offer) => {
//   //       const peerConnection = new RTCPeerConnection();
//   //       peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

//   //       peerConnection.ontrack = (event: RTCTrackEvent) => {
//   //         if (videoRef.current) {
//   //           videoRef.current.srcObject = event.streams[0] as MediaStream;
//   //         }
//   //       };

//   //       const answer = await peerConnection.createAnswer();
//   //       await peerConnection.setLocalDescription(answer);
//   //       socket.emit("screen-answer", answer);
//   //     });

//   //     return () => {
//   //       socket.off("screen-offer");
//   //     };
//   //   }, []);

//   return (
//     <div>
//       <button onClick={startScreenSharing}>Start Screen Sharing</button>
//       <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }} />
//     </div>
//   );
// };

// export default ScreenShareButton;
