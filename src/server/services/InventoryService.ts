import { Service, OnStart } from "@flamework/core"
import { DataIO, SaveableDataObject } from "./DataService"
import { $terrify } from "rbxts-transformer-t-new"
import { TowerName } from "shared/config/TowerConfig"

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

	public hasTower(player: Player, tower: TowerName): boolean {
		return this.playerUnlockedTowers.get(player)!.has(tower)
	}

	public giveTower(player: Player, tower: TowerName) {
		this.playerUnlockedTowers.get(player)!.add(tower)
	}

	public removeTower(player: Player, tower: TowerName) {
		this.playerUnlockedTowers.get(player)!.delete(tower)
	}

	onDataLoad(player: Player, data: Record<string, unknown>) {
		if (tHasInventory(data)) {
			this.playerUnlockedTowers.set(player, new Set(data[SAVE_KEY].unlockedTowers))
		} else {
			this.playerUnlockedTowers.set(player, new Set(table.clone(defaultUnlocks)))
		}
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
