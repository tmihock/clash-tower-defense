import { Networking } from "@flamework/networking"
import { EquipBar, GlobalEvents, GlobalFunctions } from "../shared/networking"
import { TowerName } from "shared/config/TowerConfig"
import { EQUIP_BAR_SIZE } from "shared/constants"
import { Dependency } from "@flamework/core"
import { InventoryService } from "./services/InventoryService"

function setEquipBarMiddleware(): Networking.EventMiddleware<[equipBar: EquipBar]> {
	return (processNext, event) => {
		return (player, ...args) => {
			const inventoryService = Dependency<InventoryService>()

			const equipBar = args[0]
			if (!player) return
			if (equipBar.size() > EQUIP_BAR_SIZE) return
			for (const tower of equipBar) {
				if (!inventoryService.playerHasTower(player, tower)) return
			}

			processNext(player, ...args)
		}
	}
}

function updateEquipBarMiddleware(): Networking.EventMiddleware<[index: number, tower: TowerName]> {
	return (processNext, event) => {
		return (player, ...args) => {
			const inventoryService = Dependency<InventoryService>()

			const [index, tower] = args
			if (!player) return
			if (index < 0 || index > EQUIP_BAR_SIZE) return
			if (!inventoryService.playerHasTower(player, tower)) return

			processNext(player, ...args)
		}
	}
}

export const Events = GlobalEvents.createServer({
	middleware: {
		setEquipBar: [setEquipBarMiddleware()],
		updateEquipBar: [updateEquipBarMiddleware()]
	}
})
export const Functions = GlobalFunctions.createServer({})
