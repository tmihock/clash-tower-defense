import { Dependency } from "@flamework/core"
import { $print } from "rbxts-transform-debug"
import { ItemName } from "shared/enum"
import { $terrify } from "rbxts-transformer-t-new"
import { Players, Workspace } from "@rbxts/services"

export interface ItemInfo<R = void> {
	onM1?(player: Player, tool: Tool): R // Returns value to chain for components
	onM2?(player: Player, tool: Tool): R
}

export const ItemData = {
	Handcuffs: {}
} as Record<ItemName, ItemInfo<any>>
