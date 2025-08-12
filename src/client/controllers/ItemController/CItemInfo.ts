import { $print } from "rbxts-transform-debug"
import { ItemName } from "shared/enum"
import { CollectionService, Players } from "@rbxts/services"
import { Events } from "client/networking"

const Player = Players.LocalPlayer
const mouse = Player.GetMouse()

export interface ItemInfo {
	onM1?(tool: Tool): void
	onM2?(tool: Tool): void
	onM1PostSuccess?(tool: Tool): void
	onM2PostSuccess?(tool: Tool): void
	onEquip?(tool: Tool): void
	onUnequip?(tool: Tool): void
}

export const ItemData = {} as Record<ItemName, ItemInfo>
