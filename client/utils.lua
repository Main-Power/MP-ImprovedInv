--- A simple wrapper around SendNUIMessage that you can use to
--- dispatch actions to the React frame.
---
---@param action string The action you wish to target
---@param data any The data you wish to send along with this action
function SendReactMessage(action, data)
  SendNUIMessage(
    {
      action = action,
      data = data
    }
  )
end

function toggleNuiFrame(shouldShow)
  SetNuiFocus(shouldShow, shouldShow)
  SendReactMessage("setVisible", shouldShow)
end

AddEventHandler(
  "Inventory:UseItem",
  function(data)
    if not data.can_use then
      return lib.notify(
        {
          title = "error",
          description = data.item_name .. " cannot be used.",
          type = "error"
        }
      )
    end
    if string.sub(data.name, 1, 7) == "weapon_" then
      print("Weapon used. " .. data.item_name)
    else
      print("Used item: " .. data.item_name)
    end
  end
)
