import * as React from "react";

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
  const [currentMaxSlots, setCurrentMaxSlots] = React.useState(maxSlots || 25);
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
      setCurrentMaxSlots(maxSlots || 25);
      setInv(Inventory);
    } else {
      console.error("Inventory is not an array");
    }
  }, [Inventory, maxSlots]);

  const handleRightClick = (event: any, item: any) => {
    if (!item) return; // If no item, return early
    event.preventDefault(); // Prevent default context menu
    setContextMenu({
      visible: true,
      x: event.pageX,
      y: event.pageY,
    });
    setSelectedItem(item.name);
  };

  const handleContextMenuClose = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  return (
    <>
      <div onClick={handleContextMenuClose}>
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
                  onContextMenu={(e) => handleRightClick(e, item)}
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
                  console.log("clicked!", selectedItem?.item_name);
                }}
              >
                Use
              </button>
              <br />
              <button
                className="hover:bg-gray-300 p-[4px]"
                onClick={() => {
                  console.log("Dropped item");
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
