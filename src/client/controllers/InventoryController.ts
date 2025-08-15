/**
 * Incrementally add stuff here when needed
 */
import { Controller, OnStart } from "@flamework/core"
import { Players } from "@rbxts/services"
import { ItemName } from "shared/enum"

const player = Players.LocalPlayer

@Controller({})
export class InventoryController implements OnStart {
	onStart() {}

	public playerHasItemOfName(name: ItemName): boolean {
		const char = player.Character
		const backpack = player.FindFirstChildOfClass("Backpack")
		if (!char) return false
		if (!backpack) return false

		const item = backpack.FindFirstChild(name) ?? char.FindFirstChild(name)

		return item?.IsA("Tool") || false
	}
}
