import { Dependency } from "@flamework/core"
import { $print } from "rbxts-transform-debug"
import { ItemName } from "shared/enum"
import { VitalsService } from "../VitalsService"
import { $terrify } from "rbxts-transformer-t-new"

export interface ItemInfo<R = void> {
	onM1?(player: Player, tool: Tool): R
	onM2?(player: Player, tool: Tool): R
}

function Food(name: string, hunger: number): ItemInfo {
	return {
		onM1(player, tool) {
			const hungerService = Dependency<VitalsService>()
			hungerService.addVital(player, "hunger", hunger)
			tool.Destroy()

			return true
		}
	}
}

export const ItemData = {
	Rock: {
		onM1(player, tool) {
			$print("Thrown on server")
		}
	},
	Gapple: Food("Gapple", 100)
} as Record<ItemName, ItemInfo<any>>
