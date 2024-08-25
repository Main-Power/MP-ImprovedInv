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
    for _, item in ipairs(items) do
      print("\n" .. item.item_name, item.item_title, item.item_weight, item.item_amount, item.can_use, item.slot)
      table.insert(
        inventory,
        {
          item_name = item.item_name,
          item_title = item.item_title,
          item_weight = item.item_weight,
          item_amount = item.item_amount,
          item_usable = item.can_use,
          slot = item.slot
        }
      )
    end
    toggleNuiFrame(true)
    SendReactMessage("showInventory", {show = true, inv = inventory, maxSlots = cfg.maxSlots})
    inventory = {}
  end
)

RegisterNUICallback(
  "Inventory:UseItem",
  function(data)
    if not data.can_use then
      return print(data.item_name .. " cannot be used.")
    end
    if string.sub(data.name, 1, 7) == "weapon_" then
      print("Weapon used. " .. data.item_name)
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
  function(data, cb)
    if type(data) == "table" and data.item and data.slot then
      local item = data.item
      local slot = data.slot
      print("Item: " .. tostring(item.name) .. ", Slot: " .. tostring(slot))
      TriggerServerEvent("inventory:moveItem", item.name, slot)
      cb("ok")
    else
      print("Invalid data received")
      cb("error")
    end
  end
)
