/**
 * Just using items
 */
import { Service, OnStart } from "@flamework/core"
import { Events, Functions } from "server/networking"
import { ItemData } from "./SItemInfo"
import { InventoryService } from "../InventoryService"
import { ItemName } from "shared/enum"
import { $terrify } from "rbxts-transformer-t-new"
import { $warn } from "rbxts-transform-debug"

@Service({})
export class ItemService implements OnStart {
	constructor(private inventoryService: InventoryService) {}

	onStart() {
		this.handleToolUse()
	}

	private handleToolUse() {
		Functions.useTool.setCallback(
			(player, tool, input) =>
				new Promise(resolve => {
					if (!tool) $warn("tool not found", player)
					const name = tool.Name
					assert($terrify<ItemName>()(name))

					if (!this.playerCanUseTool(player, name)) return
					const useItemCallback = ItemData[name]
					if (useItemCallback === undefined) return

					let success = false
					switch (input) {
						case Enum.UserInputType.MouseButton1:
							success = ItemData[name].onM1?.(player, tool) as unknown as boolean
							break
						case Enum.UserInputType.MouseButton2:
							success = ItemData[name].onM2?.(player, tool) as unknown as boolean
							break
					}
					if (success) resolve()
				})
		)
	}

	private playerCanUseTool(player: Player, itemName: ItemName) {
		return (
			this.inventoryService.playerHasItemOfNameInInventory(player, itemName) ||
			player.Character !== undefined
		)
	}
}
