import React, { useState, useEffect } from "react";
import "../index.css"; // Ensure Tailwind CSS is imported

const InvBackground: React.FC = () => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { action, data } = event.data;
      if (action === "slideup") {
        console.log("Slide up");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <>
      <div className="absolute left-[38%] top-[30%] w-[20%] h-[35%]">
        <div className="bg-gray-500 text-white font-bold text-2xl">
          Inventory Background
        </div>
      </div>
    </>
  );
};

export default InvBackground;
