import * as React from "react";
import { fetchNui } from "../../utils/fetchNui";

type InventoryProps = {
  Inventory: any[];
  maxSlots: number;
};

interface Inv {
  item_name: string;
  item_weight: string;
  item_amount: string;
  slot: number;
  can_use: string;
  image: string;
}

const Inventory: React.FC<InventoryProps> = ({ Inventory, maxSlots }) => {
  const slotsRange = Array.from({ length: maxSlots }, (_, i) => i + 1);
  const [inv, setInv] = React.useState<Inv[]>([]);
  const totalWeight = inv.reduce(
    (acc, item) => acc + parseFloat(item.item_weight || "0"),
    0
  );
  const [maxWeight] = React.useState(100.0); // Removed setMaxWeight
  const [contextMenu, setContextMenu] = React.useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [selectedItem, setSelectedItem] = React.useState<Inv | null>(null);

  // Log the Inventory prop whenever it updates
  React.useEffect(() => {
    console.log("Inventory updated:", JSON.stringify(Inventory));
    if (Array.isArray(Inventory)) {
      setInv(Inventory);
    } else {
      console.error("Inventory is not an array");
    }
  }, [Inventory]);

  const handleRightClick = (event: React.MouseEvent, item: Inv | null) => {
    if (!item) return; // If no item, return early
    event.preventDefault(); // Prevent default context menu
    setContextMenu({
      visible: true,
      x: event.pageX,
      y: event.pageY,
    });
    setSelectedItem(item);
    console.log(item.item_name, " has been right-clicked");
  };

  const handleDoubleClick = (item: Inv | null) => {
    if (item) {
      console.log("Double-clicked item:", item.item_name);
      setSelectedItem(item);
      fetchNui("Inventory:UseItem", item);
    }
  };

  const handleContextMenuClose = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleMouseDown = (item: Inv) => {
    setSelectedItem(item);
  };

  const handleMouseUp = (slot: number) => {
    if (selectedItem) {
      fetchNui("Inventory:MoveItem", { item: selectedItem, slot });
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
          {/* Progress Bar */}
          <div className="text-black text-sm font-bold text-center">
            {`${totalWeight.toFixed(2)} / ${maxWeight} lb`}
          </div>
          <div className="absolute left-[56%] top-[0.85%] w-[40%] bg-gray-400 h-4 overflow-x-hidden">
            <div
              className="bg-green-500 h-4"
              style={{ width: `${(totalWeight / maxWeight) * 100}%` }}
            ></div>
          </div>
          {/* Inventory Grid */}
          <div className="grid grid-cols-5 gap-3 mt-[2%] ml-[50%]">
            {slotsRange.map((slot) => {
              const item = inv.find((item) => item.slot === slot);
              //console.log("Item for slot", slot, item); // Debug log

              return (
                <div
                  key={slot}
                  className="h-20 m-0 border-2 border-gray-500 flex items-center justify-center relative"
                  onContextMenu={(e) => handleRightClick(e, item || null)}
                  onDoubleClick={() => handleDoubleClick(item || null)}
                  onMouseDown={() => item && handleMouseDown(item)}
                  onMouseUp={() => handleMouseUp(slot)}
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
                      {/* Text overlay */}
                      <span className="relative z-10 text-white bg-gray-400 text-[11px] top-[30px]">
                        {item.item_amount + "x" + " " + item.item_name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-lightgray">
                      {/* Empty slot */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="absolute bg-white border border-gray-200 z-20" // Adjusted z-index here
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            onClick={(e) => e.stopPropagation()} // Prevent click from closing the menu
          >
            {/* Render your menu items here */}
            <div className="bg-gray-200 p-[4px]">
              <button
                className="hover:bg-gray-300 p-[4px]"
                onClick={() => {
                  console.log("Dropped item", selectedItem?.item_name);
                  setContextMenu({ ...contextMenu, visible: false });
                }}
              >
                Drop
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Inventory;
