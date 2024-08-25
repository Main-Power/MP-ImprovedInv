import { fetchNui } from "../../utils/fetchNui";
import React, { useState, useEffect } from "react";

type InventoryProps = {
  Inventory: Inv[];
  maxSlots: number;
};

interface Inv {
  name: string;
  item_name: string;
  item_weight: string;
  item_amount: string;
  slot: number;
  can_use: string;
  image: string;
}

const Inventory: React.FC<InventoryProps> = ({ Inventory, maxSlots }) => {
  const slotsRange = Array.from({ length: maxSlots }, (_, i) => i + 1);
  const [inv, setInv] = useState<Inv[]>([]);
  const totalWeight = inv.reduce(
    (acc, item) => acc + parseFloat(item.item_weight || "0"),
    0
  );
  const [maxWeight] = useState(100.0); // Removed setMaxWeight
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [selectedItem, setSelectedItem] = useState<Inv | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    console.log("Inventory updated:", JSON.stringify(Inventory));
    if (Array.isArray(Inventory)) {
      setInv(Inventory);
    } else {
      console.error("Inventory is not an array");
    }
  }, [Inventory]);

  const handleRightClick = (event: React.MouseEvent, item: Inv | null) => {
    if (!item) return;
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.pageX,
      y: event.pageY,
    });
    setSelectedItem(item);
    //console.log(item.item_name, " has been right-clicked");
  };

  const handleContextMenuClose = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleMouseDown = (item: Inv | null) => {
    //console.log("Mouse down on item:", item?.item_name);
    setSelectedItem(item);
    setIsDragging(true);
  };

  const handleMouseUp = (slot: number) => {
    //console.log("Mouse up on slot:", slot);
    if (selectedItem && isDragging) {
      fetchNui("Inventory:MoveItem", { item: selectedItem, slot })
        .then(() => {
          setInv((prevInv) =>
            prevInv.map((item) =>
              item.slot === selectedItem.slot
                ? { ...item, slot }
                : item.slot === slot
                ? { ...item, slot: selectedItem.slot }
                : item
            )
          );
          setSelectedItem(null);
          setIsDragging(false);
        })
        .catch((error) => {
          console.error("Failed to fetch NUI:", error);
        });
    }
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    };

    const handleMouseUpGlobal = () => {
      if (isDragging) {
        setIsDragging(false);
        //setSelectedItem(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUpGlobal);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUpGlobal);
    };
  }, [isDragging]);

  const handleUseItem = () => {
    //console.log("handleUseItem called: ", selectedItem?.item_name);
    if (selectedItem !== null) {
      //console.log("Using item:", selectedItem?.item_name);
      fetchNui("Inventory:UseItem", selectedItem)
        .then(() => {
          //console.log(`Used item: ${selectedItem?.item_name}`);
          setSelectedItem(null);
          setIsDragging(false);
        })
        .catch((error) => {
          console.error("Failed to use item:", error);
        });
    } else {
      console.error("No item selected");
    }
  };

  return (
    <>
      <div onClick={handleContextMenuClose} className="select-none">
        <div
          className="absolute left-[-19%] top-[21.5%] w-[50%] overflow-y-auto"
          style={{
            height: "475px",
            maxWidth: "900px",
            padding: "0",
            margin: "0",
          }}
        >
          <div className="text-black text-sm font-bold text-center">
            {`${totalWeight.toFixed(2)} / ${maxWeight} lb`}
          </div>
          <div className="absolute left-[56%] top-[0.85%] w-[40%] bg-gray-400 h-4 overflow-x-hidden">
            <div
              className="bg-green-500 h-4"
              style={{ width: `${(totalWeight / maxWeight) * 100}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-5 gap-3 mt-[2%] ml-[50%]">
            {slotsRange.map((slot) => {
              const item = inv.find((item) => item.slot === slot);
              return (
                <div
                  key={slot}
                  className="h-20 m-0 border-2 border-gray-500 flex items-center justify-center relative"
                  onContextMenu={(e) => handleRightClick(e, item || null)}
                  onMouseDown={() => item && handleMouseDown(item)}
                  onMouseUp={() => handleMouseUp(slot)}
                  draggable
                  onDragStart={() => item && handleMouseDown(item)}
                >
                  {item ? (
                    <div
                      className="flex items-center justify-center w-full h-full bg-lightgray"
                      style={{
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <span className="relative z-10 text-white bg-gray-400 text-[11px] top-[30px]">
                        {item.item_amount + "x" + " " + item.item_name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-lightgray"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {contextMenu.visible && (
          <div
            className="absolute bg-white border border-gray-200 z-20"
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-200 p-[4px]">
              <button
                className="hover:bg-gray-300 p-[4px]"
                onClick={() => {
                  //console.log("Dropped item", selectedItem?.item_name);
                  setContextMenu({ ...contextMenu, visible: false });
                }}
              >
                Drop
              </button>
            </div>
          </div>
        )}
        {selectedItem && isDragging && (
          <div
            style={{
              position: "absolute",
              top: mousePosition.y,
              left: mousePosition.x,
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
            }}
          >
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="w-16 h-16"
            />
          </div>
        )}
        <div
          className="absolute left-[5%] bottom-[25.8%] bg-gray-200 hover:bg-gray-300 p-[4px] w-[100px] text-black text-center p-2 rounded"
          onClick={() => {
            //console.log("Button clicked");
            handleUseItem();
            //console.log("selected item:", selectedItem);
          }}
        >
          Use
        </div>
      </div>
    </>
  );
};

export default Inventory;
