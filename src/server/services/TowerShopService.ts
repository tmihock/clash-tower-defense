import { Service, OnStart } from "@flamework/core"
import { Functions } from "server/networking"
import { PlayerStateProvider } from "./PlayerStateProvider"
import { TowerConfig, TowerName } from "shared/config/TowerConfig"
import { InventoryService } from "./InventoryService"

@Service({})
export class TowerShopService implements OnStart {
	constructor(
		private playerStateProvider: PlayerStateProvider,
		private inventoryService: InventoryService
	) {}

	onStart() {
		Functions.requestBuyTower.setCallback((p, t) => this.onPurchaseRequest(p, t))
	}

	private onPurchaseRequest(player: Player, tower: TowerName) {
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
	}
}
