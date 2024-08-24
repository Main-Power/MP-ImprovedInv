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
