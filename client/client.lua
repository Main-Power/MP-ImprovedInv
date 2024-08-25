-- Example inventory data structure
local inventory = {}
local resource = GetCurrentResourceName()
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
local showInventory = false
RegisterCommand(
  "inv",
  function()
    TriggerServerEvent("inventory:open")
    showInventory = true
  end
)

RegisterNetEvent(
  "inventory:open",
  function(items)
    for _, item in ipairs(items) do
      --print("\n" .. item.item_name, item.item_title, item.item_weight, item.item_amount, item.can_use, item.slot)
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
    SendReactMessage("showInventory", {inv = inventory, maxSlots = cfg.maxSlots})
    inventory = {}
  end
)
RegisterNUICallback(
  "hideFrame",
  function(_, cb)
    toggleNuiFrame(false)
    showInventory = false
    cb({})
  end
)

RegisterNetEvent("UseItem")
AddEventHandler(
  "Inventory:UseItem",
  function(data)
    if not data.can_use then
      return --print(data.item_name .. " cannot be used.")
    end
    if string.sub(data.name, 1, 7) == "weapon_" then
      --print("Weapon used. " .. data.item_name)
    else
      --print("Used item: " .. data.item_name)
    end
  end
)

RegisterNUICallback(
  "Inventory:UseItem",
  function(data)
    TriggerEvent("Inventory:UseItem", data)
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
      --print("Item: " .. tostring(item.name) .. ", Slot: " .. tostring(slot))
      TriggerServerEvent("inventory:moveItem", item.name, slot)
      cb("ok")
    else
      --print("Invalid data received")
      cb("error")
    end
  end
)

RegisterNetEvent(
  "inventory:addItem",
  function(inv)
    -- Debugging: Log the received inv
    --print("Received inventory: " .. json.encode(inv))
    table.insert(
      inventory,
      {
        item_name = inv.item_name,
        item_title = inv.item_title,
        item_weight = inv.item_weight,
        item_amount = inv.item_amount,
        item_usable = inv.can_use,
        slot = inv.slot
      }
    )
    SendReactMessage("addItem", {inv = inventory, maxSlots = cfg.maxSlots, isShown = showInventory})
    inventory = {}
  end
)

RegisterNetEvent(
  "inventory:removeItem",
  function(inv)
    -- Debugging: Log the received inv
    --print("Received inventory: " .. json.encode(inv))
    table.insert(
      inventory,
      {
        item_name = inv.item_name,
        item_title = inv.item_title,
        item_weight = inv.item_weight,
        item_amount = inv.item_amount,
        item_usable = inv.can_use,
        slot = inv.slot
      }
    )
    SendReactMessage("removeItem", {inv = inventory, maxSlots = cfg.maxSlots, isShown = showInventory})
    inventory = {}
  end
)

RegisterNUICallback(
  "refreshInv",
  function(data)
    if data.isShown then
      --print("testing.")
      TriggerServerEvent("inventory:open")
    else
      --print("Inventory is not shown")
    end
  end
)
