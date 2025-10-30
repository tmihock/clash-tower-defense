import { Service, OnStart } from "@flamework/core"
import { Functions } from "server/networking"
import { PlayerStateProvider } from "./PlayerStateProvider"
import { TowerConfig } from "shared/config/TowerConfig"
import { InventoryService } from "./InventoryService"

@Service({})
export class TowerShopService implements OnStart {
	constructor(
		private playerStateProvider: PlayerStateProvider,
		private inventoryService: InventoryService
	) {}

	onStart() {
		Functions.requestBuyTower.setCallback((player, tower) => {
			const { money, exp } = this.playerStateProvider.get(player)
			const { price, expReq } = TowerConfig[tower]

			const canBuy = money() >= price && exp() >= expReq

			if (canBuy) {
				money(prev => prev - price)
				this.inventoryService.giveTower(player, tower)
				return true
			} else {
				return false
			}
		})
	}
}
