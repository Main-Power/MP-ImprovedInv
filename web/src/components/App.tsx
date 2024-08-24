import React, { useState, useEffect } from "react";
import "./transition.css";
import { debugData } from "../utils/debugData";
import InvBackground from "./InvComponents/InvBackground";
import Inventory from "./InvComponents/Inventory";
debugData([
  {
    action: "setVisible",
    data: true,
  },
]);

const App: React.FC = () => {
  const [showInventory, setShowInventory] = useState(true);
  const [InvTransition, setInvTransition] = useState("");
  const [visible, setVisible] = useState<boolean | null>(null);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { action, data } = event.data;
      if (action === "showInventory") {
        console.log("Inventory", data);
        setShowInventory(data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (showInventory) {
      setInvTransition("fade-swipe-enter");
      setTimeout(() => {
        setInvTransition("fade-swipe-enter fade-swipe-enter-active");
      }, 10); // Small delay to ensure the transition is applied
      document.body.style.overflowY = "hidden"; // Hide vertical scrollbar
      document.body.style.overflowX = "hidden"; // Hide horizontal scrollbar
    } else {
      setInvTransition("fade-swipe-exit");
      setTimeout(() => {
        setInvTransition("");
        document.body.style.overflowY = "auto"; // Restore vertical scrollbar
        document.body.style.overflowX = "auto"; // Restore horizontal scrollbar
      }, 500); // Duration of the exit transition
    }
  }, [showInventory]);

  return (
    <>
      {showInventory && (
        <div className={`flex flex-col min-h-screen ${InvTransition}`}>
          <Inventory visible={visible} setVisible={setVisible} />
        </div>
      )}
    </>
  );
};

export default App;
