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
local invOpen = false
RegisterCommand(
  "inv",
  function()
    --TriggerServerEvent("inventory:open")
    SendReactMessage("setVisible", not invOpen)
    SendReactMessage("showInventory", not invOpen)
    invOpen = not invOpen
  end
)
-- open inventory event.
RegisterNetEvent(
  "inventory:open",
  function(items)
    local items2 = {}
    for k, v in pairs(items) do
      --print(v.title, v.description, v.disabled)
      table.insert(
        items2,
        {
          title = v.title,
          description = v.description,
          disabled = v.disabled
        }
      )
    end
    --print("items2", json.encode(items2))

    lib.registerContext(
      {
        id = "main_menui",
        title = "Your Inventory",
        options = items2
      }
    )
    lib.showContext("main_menui")
  end
)
