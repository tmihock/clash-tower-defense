import { Service, OnStart } from "@flamework/core"
import { $terrify } from "rbxts-transformer-t-new"
import { TowerConfig, TowerName } from "shared/config/TowerConfig"
import { Events } from "server/networking"
import { PlayerStateProvider } from "./PlayerStateProvider"
import { OnPlayerAdded } from "./PlayerService"
import { computed, subscribe } from "@rbxts/charm"

@Service({})
export class InventoryService implements OnPlayerAdded {
	constructor(private playerStateProvider: PlayerStateProvider) {}

	public playerHasTower(player: Player, tower: TowerName): boolean {
		return this.playerStateProvider.get(player).unlockedTowers().includes(tower)
	}

	public unlockTower(player: Player, tower: TowerName) {
		this.playerStateProvider.get(player).unlockedTowers(old => {
			return [...old, tower]
		})
	}

	public removeTower(player: Player, tower: TowerName) {
		this.playerStateProvider.get(player).unlockedTowers(old => old.filter(t => t !== tower))
	}

	public onExpChanged(player: Player, newExp: number, oldExp: number) {
		for (const [tower, info] of pairs(TowerConfig)) {
			if (tower === "None") continue
			if (newExp >= info.expReq && oldExp < info.expReq) {
				this.unlockTower(player, tower)
				Events.addToUnlockedInventory.fire(player, tower)
			}
		}
	}

	onPlayerAdded(player: Player): void {
		this.playerStateProvider.subscribe(player, "exp", (n, o) => {
			this.onExpChanged(player, n, o)
		})
	}
}
