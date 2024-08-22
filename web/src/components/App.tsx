import React, { useState, useEffect } from "react";
import "./index.css"; // Ensure Tailwind CSS is imported
import InvBackground from "./InvComponents/InventoryBackground";
const App: React.FC = () => {
  const [show, setShow] = useState(true);
  const [transitionClass, setTransitionClass] = useState("");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { action, data } = event.data;
      if (action === "slideup") {
        console.log("Slide up");
        setShow(true);
      } else if (action === "slidedown") {
        console.log("Slide down");
        setShow(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (show) {
      setTransitionClass("fade-slide-enter");
      setTimeout(() => {
        setTransitionClass("fade-slide-enter fade-slide-enter-active");
      }, 10); // Small delay to ensure the transition is applied
      document.body.style.overflowY = "hidden"; // Hide vertical scrollbar
    } else {
      setTransitionClass("");
      document.body.style.overflowY = "auto"; // Restore vertical scrollbar
    }
  }, [show]);

  return (
    <>
      <div className={`flex flex-col min-h-screen ${transitionClass}`}>
        <InvBackground />
      </div>
    </>
  );
};

export default App;
