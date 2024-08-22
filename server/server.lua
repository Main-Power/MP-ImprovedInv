-- Version check
local version = 1.0
local resourceVersion = lib.versionCheck("overextended/ox_lib")
if resourceVersion == version then
  print("^2[INFO]^7: ox_inventory is up to date.")
else
  print("^1[ERROR]^7: ox_inventory is outdated. Please update it from https://github.com/MainPower/inventory")
end

AddEventHandler(
  "onResourceStart",
  function()
    if cfg.debug then
      print("^2[DEBUG]:^7 Script has started successfully.")
    else
      return
    end

    exports.oxmysql:execute(
      [[
      CREATE TABLE IF NOT EXISTS `mp_inventory` (
        `owner` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
        `name` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
        `data` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
        `lastupdated` TIMESTAMP NULL DEFAULT NULL,
        UNIQUE INDEX `owner` (`owner`, `name`) USING BTREE
      )
      COLLATE='utf8mb4_general_ci'
      ENGINE=InnoDB;
    ]],
      {},
      function(result)
        if result then
          print("^2[Inventory]: ^7Table created successfully.")
        else
          print("^1[Inventory]: ^7Failed to create table or table already exists.")
        end
      end
    )
  end
)
local invOpen = false
RegisterNetEvent("inventory:open")
AddEventHandler(
  "inventory:open",
  function()
    local _source = source
    invOpen = true
    local steamid = GetPlayerIdentifierByType(_source, "steam")
    local items = {}

    exports.oxmysql:execute(
      "SELECT data FROM mp_inventory WHERE owner = @steamid",
      {["@steamid"] = steamid},
      function(result)
        if #result > 0 then
          --print("Result found for " .. steamid)
          --print("result:" .. json.encode(result))

          -- Iterate over each row in the result
          for _, row in ipairs(result) do
            -- Check if data is not nil
            if row.data then
              -- Decode JSON data
              local data = json.decode(row.data)
              if data then
                for _, item in ipairs(data) do
                  table.insert(
                    items,
                    {
                      title = item.title,
                      description = "Weight: " .. item.weight .. "lbs,\nAmount: " .. item.amount,
                      disabled = not item.usable
                    }
                  )
                end
              else
                print("Failed to decode JSON data for " .. steamid)
              end
            else
              print("Data field is nil for " .. steamid)
            end
          end

          -- Check if items were successfully extracted
          if #items == 0 then
            print("No inventory found for " .. steamid)
            -- Set items table to indicate inventory is empty
            table.insert(
              items,
              {
                title = "Inventory is empty",
                description = "",
                disabled = true
              }
            )
          end
          TriggerClientEvent("inventory:open", _source, items)
        else
          print("No inventory found for " .. steamid)
        end
      end
    )
  end
)

exports(
  "addItem",
  function(target, itemName, amount)
    local targetSteamid = GetPlayerIdentifierByType(target, "steam")

    -- Check if the item exists in cfg.items
    local itemDetails = nil
    for _, item in ipairs(cfg.items) do
      if item.name == itemName then
        itemDetails = item
        break
      end
    end

    if itemDetails then
      -- Define the item data to be inserted
      local itemData = {
        name = itemName,
        title = itemDetails.title,
        weight = itemDetails.weight,
        usable = itemDetails.usable,
        amount = amount
      }

      -- Convert itemData to JSON string
      local itemDataJson = json.encode(itemData)

      -- Ensure itemDataJson is not empty
      if itemDataJson and itemDataJson ~= "" then
        -- Check if the data field is empty or null and initialize it if necessary
        exports.oxmysql:execute(
          "SELECT data FROM mp_inventory WHERE owner = @steamid",
          {["@steamid"] = targetSteamid},
          function(result)
            if #result > 0 then
              local data = result[1].data
              if not data or data == "" then
                -- Initialize data as an empty JSON array
                data = "[]"
              end

              -- Decode the existing data
              local inventory = json.decode(data)
              local itemFound = false

              -- Check if the item already exists in the inventory
              for _, item in ipairs(inventory) do
                if item.name == itemName then
                  item.amount = item.amount + amount
                  itemFound = true
                  break
                end
              end

              if not itemFound then
                -- Append the new item data
                table.insert(inventory, itemData)
              end

              -- Convert the updated inventory back to JSON
              local updatedDataJson = json.encode(inventory)

              -- Update the inventory in the database
              exports.oxmysql:execute(
                "UPDATE mp_inventory SET data = @updatedData WHERE owner = @steamid",
                {["@steamid"] = targetSteamid, ["@updatedData"] = updatedDataJson},
                function(updateResult)
                  if updateResult.affectedRows > 0 then
                    print("Item added to inventory for " .. targetSteamid)
                  else
                    print("Failed to update inventory for " .. targetSteamid)
                  end
                end
              )
            else
              print("No inventory found for " .. targetSteamid)
            end
          end
        )
      else
        print("Failed to encode item data to JSON")
      end
    else
      print("Item " .. itemName .. " doesn't exist")
    end
  end
)

RegisterCommand(
  "giveitem",
  function(source, args, rawCommand)
    local target = tonumber(args[1])
    local item = args[2]
    local amount = tonumber(args[3])
    if target and item and amount then
      exports["MP-ImprovedInv"]:addItem(target, item, amount)
    end
  end,
  false
)

exports(
  "removeItem",
  function(target, itemName, amount)
    local targetSteamid = GetPlayerIdentifierByType(target, "steam")

    -- Check if the data field is empty or null and initialize it if necessary
    exports.oxmysql:execute(
      "SELECT data FROM mp_inventory WHERE owner = @steamid",
      {["@steamid"] = targetSteamid},
      function(result)
        if #result > 0 then
          local data = result[1].data
          if not data or data == "" then
            -- Initialize data as an empty JSON array
            data = "[]"
          end

          -- Decode the existing data
          local inventory = json.decode(data)
          local itemFound = false

          -- Check if the item already exists in the inventory
          for i, item in ipairs(inventory) do
            if item.name == itemName then
              if item.amount > amount then
                item.amount = item.amount - amount
              else
                table.remove(inventory, i)
              end
              itemFound = true
              break
            end
          end

          if itemFound then
            -- Convert the updated inventory back to JSON
            local updatedDataJson = json.encode(inventory)

            -- Update the inventory in the database
            exports.oxmysql:execute(
              "UPDATE mp_inventory SET data = @updatedData WHERE owner = @steamid",
              {["@steamid"] = targetSteamid, ["@updatedData"] = updatedDataJson},
              function(updateResult)
                if updateResult.affectedRows > 0 then
                  print("Item removed from inventory for " .. targetSteamid)
                else
                  print("Failed to update inventory for " .. targetSteamid)
                end
              end
            )
          else
            print("Item " .. itemName .. " not found in inventory for " .. targetSteamid)
          end
        else
          print("No inventory found for " .. targetSteamid)
        end
      end
    )
  end
)

RegisterCommand(
  "removeitem",
  function(source, args, rawCommand)
    local target = tonumber(args[1])
    local item = args[2]
    local amount = tonumber(args[3])
    if target and item and amount then
      exports["MP-ImprovedInv"]:removeItem(target, item, amount)
    end
  end,
  false
)
