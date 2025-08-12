import { $print } from "rbxts-transform-debug"
import { ItemName } from "shared/enum"
import { CollectionService, Players } from "@rbxts/services"
import { Events } from "client/networking"
import { Dependency } from "@flamework/core"
import { CameraController } from "../CameraController"

const Player = Players.LocalPlayer
const mouse = Player.GetMouse()

export interface ItemInfo {
	onM1?: (tool: Tool) => void
	onM2?: (tool: Tool) => void
	onM1PostSuccess?: (tool: Tool) => void
	onM2PostSuccess?: (tool: Tool) => void
	onEquip?: (tool: Tool) => void
	onUnequip?: (tool: Tool) => void
}

function Gun(base: ItemInfo): ItemInfo {
	const oldOnEquip = base.onEquip
	base.onEquip = (tool: Tool) => {
		const cameraController = Dependency<CameraController>()
		cameraController.setMode("ShiftLock")
		oldOnEquip?.(tool)
	}

	const oldOnUnequip = base.onUnequip
	base.onUnequip = (tool: Tool) => {
		const cameraController = Dependency<CameraController>()
		cameraController.setMode("Default")
		oldOnUnequip?.(tool)
	}

	return base
}

export const ItemData = {
	Revolver: Gun({})
} as Record<ItemName, ItemInfo>
