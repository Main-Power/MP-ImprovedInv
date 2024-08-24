-- Example inventory data structure
local inventory = {}

-- closes the inventory when resource stops.
AddEventHandler(
  "onResourceStop",
  function()
    lib.hideContext(false)
  end
)
-- toggleNuiFrame(shouldShow)
-- SendReactMessage(action, data)

-- open inventory command (temporary).
RegisterCommand(
  "inv",
  function()
    TriggerServerEvent("inventory:open")
  end
)

RegisterNetEvent(
  "inventory:open",
  function(items)
    local inventory = {}
    for _, item in ipairs(items) do
      table.insert(
        inventory,
        {
          item_name = item.item_name,
          item_title = item.item_title,
          item_weight = item.item_weight,
          item_amount = item.item_amount,
          item_usable = item.can_use
        }
      )
    end
    toggleNuiFrame(true)
    SendReactMessage("showInventory", {show = true, inv = inventory, maxSlots = cfg.maxSlots})
  end
)

RegisterNUICallback(
  "Inventory:UseItem",
  function(data)
    if string.sub(data.item_name, 1, 7) == "weapon_" then
      print("Weapon used.")
    else
      print("Used item: " .. data.item_name)
    end
  end
)

-- Function to find an item in the inventory
local function findItem(item_name)
  for i, item in ipairs(inventory) do
    if item.item_name == item_name then
      return item, i
    end
  end
  return nil, nil
end

-- NUI Callback to move an item
RegisterNUICallback(
  "Inventory:MoveItem",
  function(data)
    return print(table.unpack(data))
  end
)
