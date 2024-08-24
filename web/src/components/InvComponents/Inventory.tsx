import * as React from "react";
import { fetchNui } from "../../utils/fetchNui";
import InvBackground from "./InvBackground";
type InventoryProps = {
  visible: boolean | null;
  setVisible: React.Dispatch<React.SetStateAction<boolean | null>>;
};

interface Inv {
  name: string;
  slot: number;
  weight: number;
  quantity: number;
  image: string;
}
interface cfg {
  name: string;
  label: string;
  weight: number;
}

const Inventory: React.FC<InventoryProps> = ({ visible, setVisible }) => {
  const maxSlots = 50;
  const slotsRange = Array.from({ length: maxSlots }, (_, i) => i + 1);
  const [inv, setInv] = React.useState<Inv[]>([
    {
      name: "Water Bottle",
      slot: 1,
      weight: 1.0,
      quantity: 1,
      image: `/images/water_bottle.png`,
    },
  ]);
  const totalWeight = inv.reduce((acc, item) => acc + item.weight, 0);
  const [maxWeight, setMaxWeight] = React.useState(100.0);
  const [contextMenu, setContextMenu] = React.useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [selectedItem, setSelectedItem] = React.useState<Inv | null>(null);
  const [cfg, setCfg] = React.useState<cfg[]>([]);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { action, data } = event.data;
      if (action === "show") {
        setMaxWeight(data.maxWeight);
        setInv([]);
        setCfg([]);
        const Inv = data.inventory;
        const Cfg = data.cfg;
        const imagePath = "/public/images/"; // Adjust this path to where your images are now stored
        const imageExtension = ".png"; // Adjust the file extension as needed

        const newItems = Inv.map((item: any, index: number) => {
          const slot = index + 1;
          const weight = item.weight;
          // Find the corresponding cfg item by matching the label
          const cfgItem = Cfg.find((cfg: any) => cfg.label === item.label);
          // Use the name from the matched cfg item, fallback to label if not found
          const name = cfgItem ? cfgItem.name : item.label;
          // Construct the image path using the name from cfg
          const image = `${imagePath}${name}${imageExtension}`;
          return {
            name: item.label, // Use the name from cfg
            slot,
            weight,
            quantity: item.quantity,
            image, // Assign the constructed image path
          };
        });
        setInv((prev) => [...prev, ...newItems]);

        const newCfgItems = Cfg.map((item: any) => {
          // Construct the image path for cfg items as well
          const image = `${imagePath}${item.name}${imageExtension}`;
          return {
            name: item.name,
            label: item.label,
            weight: item.weight,
            image, // Assign the constructed image path
          };
        });
        setCfg((prev) => [...prev, ...newCfgItems]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function handleDrop(targetSlot: number, e: React.DragEvent<HTMLDivElement>) {
    console.log("Handling drop");
    e.preventDefault();
    // Parse the source slot from the drag event
    const sourceSlot = parseInt(e.dataTransfer.getData("text/plain"), 10);

    // Create a deep copy of the inventory to manipulate
    const updatedInv = [...inv];

    // Find the items in source and target slots within the copied inventory
    const sourceItemIndex = updatedInv.findIndex(
      (item) => item.slot === sourceSlot
    );
    const targetItemIndex = updatedInv.findIndex(
      (item) => item.slot === targetSlot
    );

    if (sourceItemIndex !== -1 && targetItemIndex !== -1) {
      // Swap the entire items if both slots are occupied
      const temp = updatedInv[sourceItemIndex];
      updatedInv[sourceItemIndex] = updatedInv[targetItemIndex];
      updatedInv[targetItemIndex] = temp;

      // Optionally, if you still need to swap slots to maintain consistency
      updatedInv[sourceItemIndex].slot = sourceSlot;
      updatedInv[targetItemIndex].slot = targetSlot;
    } else if (sourceItemIndex !== -1) {
      // Move item to the empty slot
      updatedInv[sourceItemIndex].slot = targetSlot;
    }

    // Update the state to reflect changes
    setInv(updatedInv);
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, slot: number) {
    console.log("starting drag", slot);
    e.dataTransfer.setData("text/plain", slot.toString());
  }

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

  const UseItem = async (item: any) => {
    //setContextMenu({ ...contextMenu, visible: false });
    const findItem: any = cfg.find((c: any) => c.label === item);
    if (!findItem) return console.error("Item doesn't have a name");
    const itemName = findItem.name;
    console.log(`[UI]: Found item: ${itemName}`);
    if (!itemName.startsWith("weapon_")) {
      const newInv = [...inv];
      const index = newInv.findIndex((i) => i.name === item);
      if (index !== -1) {
        const cfgItem: any = cfg.find((c: any) => c.label === item);
        if (cfgItem) {
          // Decrease the weight
          const newWeight = parseFloat(
            (newInv[index].weight - cfgItem.weight).toFixed(2)
          );
          newInv[index].weight = newWeight;
          // Decrease the quantity
          newInv[index].quantity = (newInv[index].quantity || 1) - 1;
          // Remove the item if weight is <= 0 or quantity is 0
          if (newInv[index].weight <= 0 || newInv[index].quantity <= 0) {
            newInv.splice(index, 1);
          }
          setInv(newInv);
        }
      }
    }
    handleContextMenuClose();
    fetchNui("Inventory:UseItem", { item: item, amount: 1 });
  };

  // Add this inside your component return, where you render the items
  return (
    <>
      <InvBackground />
      {visible && (
        <div onClick={handleContextMenuClose}>
          <div
            className="absolute left-[16%] top-[22%] w-[50%] overflow-y-auto"
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
                const Item = inv.find((item) => item.slot === slot);

                return (
                  <div
                    key={slot}
                    className="h-20 m-0 border-2 border-gray-500 flex items-center justify-center relative"
                    draggable={!!Item} // Ensure draggable only if Item exists
                    onContextMenu={(e) => handleRightClick(e, Item)}
                    onDrop={(e) => handleDrop(slot, e)}
                    onDragOver={(e) => e.preventDefault()} // Explicitly allow dropping
                    onDragStart={(e) => Item && handleDragStart(e, Item.slot)} // Ensure drag only starts if Item exists
                  >
                    {Item && (
                      <div
                        className="flex items-center justify-center w-full h-full bg-lightgray"
                        style={{
                          backgroundImage: `url(${Item.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {/* Text overlay */}
                        <span className="relative z-10 text-white bg-gray-400 text-[11px] top-[30px]">
                          {Item.quantity + "x" + " " + Item.name}
                        </span>
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
                    UseItem(selectedItem);
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
          <div className="absolute left-[48.5%] bottom-[25.8%]">
            <button
              className="bg-gray-200 hover:bg-gray-300 p-[4px] w-[100px]"
              onClick={() => fetchNui("hideFrame")}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Inventory;
