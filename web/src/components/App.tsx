import React, { useState, useEffect } from "react";
import "./transition.css";
import { debugData } from "../utils/debugData";
import Inventory from "./InvComponents/Inventory";
import InvBackground from "./InvComponents/InvBackground";
import { fetchNui } from "../utils/fetchNui";
debugData([
  {
    action: "setVisible",
    data: true,
  },
]);
interface Inv {
  item_name: string;
  item_weight: string;
  item_amount: string;
  slot: number;
  can_use: string;
  image: string;
}
const App: React.FC = () => {
  const [showInventory, setShowInventory] = useState(true);
  const [InvTransition, setInvTransition] = useState("");
  const [inv, setInv] = React.useState<Inv[]>([
    {
      item_name: "item_name",
      item_weight: "item_weight",
      item_amount: "item_amount",
      slot: 1,
      can_use: "can_use",
      image: "image",
    },
  ]);
  const [maxSlots, setMaxSlots] = React.useState(30);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { action, data } = event.data;
      if (action === "showInventory") {
        setInv([]);
        setShowInventory(data);
        const Inv = data.inv;
        const imagePath = "/public/images/";
        const imageExtension = ".png";
        const newItems = Inv.map((item: any, index: number) => {
          const name = item.item_name;
          const slot = index + 1;
          const weight = item.item_weight;
          const image = `${imagePath}${name}${imageExtension}`;
          return {
            item_name: item.item_title || "",
            item_weight: weight,
            item_amount: item.item_amount,
            slot,
            can_use: item.can_use || true,
            image,
          };
        });
        setInv((prev) => [...prev, ...newItems]);
        setMaxSlots(data.maxSlots);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  useEffect(() => {
    console.log("Inv updated:", JSON.stringify(inv));
  }, [inv]);
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
          <InvBackground />
          <Inventory Inventory={inv} maxSlots={maxSlots} />
          <div className="absolute left-[13.5%] bottom-[25.8%]">
            <button
              className="bg-gray-200 hover:bg-gray-300 p-[4px] w-[100px]"
              onClick={() => {
                setShowInventory(false);
                fetchNui("hideFrame");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
