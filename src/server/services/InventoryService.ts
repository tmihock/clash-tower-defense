import { Service, OnStart } from "@flamework/core"
import { DataIO, SaveableDataObject } from "./DataService"
import { $terrify } from "rbxts-transformer-t-new"
import { TowerConfig, TowerName } from "shared/config/TowerConfig"
import { Events } from "server/networking"
import { ExpService } from "./ExpService"

export type Inventory = {
	unlockedTowers: TowerName[]
	// skins: SkinName[]
}

const SAVE_KEY = "inventory"

const tHasInventory = $terrify<{
	[SAVE_KEY]: Inventory
}>()

const defaultUnlocks = ["Barbarian"] satisfies TowerName[]

@Service({})
export class InventoryService implements DataIO {
	private playerUnlockedTowers = new Map<Player, Set<TowerName>>()

	constructor(private expService: ExpService) {}

	public playerHasTower(player: Player, tower: TowerName): boolean {
		return this.playerUnlockedTowers.get(player)!.has(tower)
	}

	public unlockTower(player: Player, tower: TowerName) {
		this.playerUnlockedTowers.get(player)!.add(tower)
	}

	public removeTower(player: Player, tower: TowerName) {
		this.playerUnlockedTowers.get(player)!.delete(tower)
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

	onDataLoad(player: Player, data: Record<string, unknown>) {
		if (tHasInventory(data)) {
			this.playerUnlockedTowers.set(player, new Set(data[SAVE_KEY].unlockedTowers))
		} else {
			this.playerUnlockedTowers.set(player, new Set(table.clone(defaultUnlocks)))
		}
		Events.setUnlockedInventory.fire(player, [...this.playerUnlockedTowers.get(player)!])
		this.expService.getExpChangedSignal(player).Connect((n, o) => this.onExpChanged(player, n, o))
	}

	onDataSave(player: Player): SaveableDataObject<Inventory> {
		const inventory: Inventory = {
			unlockedTowers: [...(this.playerUnlockedTowers.get(player) ?? new Set())]
		}
		this.playerUnlockedTowers.delete(player)

		return {
			key: SAVE_KEY,
			value: inventory
		}
	}
}
