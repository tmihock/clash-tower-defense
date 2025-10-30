import { Service } from "@flamework/core"
import { TowerName } from "shared/config/TowerConfig"
import { PlayerStateProvider } from "./PlayerStateProvider"
import { OnPlayerAdded } from "./PlayerService"
import { ReplicatedStorage } from "@rbxts/services"

const towerToolsFolder = ReplicatedStorage.Assets.Towers //.Tools

@Service({})
export class InventoryService implements OnPlayerAdded {
	constructor(private playerStateProvider: PlayerStateProvider) {}

	public playerHasTower(player: Player, tower: TowerName): boolean {
		return this.playerStateProvider.get(player).inventory().includes(tower)
	}

	public giveTower(player: Player, tower: TowerName) {
		this.playerStateProvider.get(player).inventory(old => {
			return [...old, tower]
		})
	}

	/**
	 * Removes ONE instance of the specified tower from the player's inventory.
	 */
	public removeTower(player: Player, tower: TowerName) {
		this.playerStateProvider.get(player).inventory(old => {
			const index = old.indexOf(tower)
			if (index === -1) {
				return old
			}
			const newInventory = table.clone(old)
			newInventory.remove(index)
			return newInventory
		})
	}

	private addTowerToBackpack(player: Player, towerName: TowerName) {
		const backpack = player.WaitForChild("Backpack") as Backpack
		const newTool = towerToolsFolder.FindFirstChild(towerName)!.Clone()
		newTool.Parent = backpack
	}

	private removeTowerFromBackpack(player: Player, towerName: TowerName) {
		const backpack = player.WaitForChild("Backpack") as Backpack
		backpack.FindFirstChild(towerName)?.Destroy()
	}

	onPlayerAdded(player: Player): void {
		// Sync backpack instance with inventory atom
		this.playerStateProvider.subscribe(player, "inventory", (inventory, prev) => {
			const added = inventory.filter(item => !prev.includes(item))
			const removed = prev.filter(item => !inventory.includes(item))

			added.forEach(towerName => this.addTowerToBackpack(player, towerName))
			removed.forEach(towerName => this.removeTowerFromBackpack(player, towerName))
		})

		// Backpack is cleared when player's dies, so we need to re-add towers on spawn
		player.CharacterAdded.Connect(char => {
			const inventory = this.playerStateProvider.get(player).inventory()
			inventory.forEach(towerName => this.addTowerToBackpack(player, towerName))
		})
	}
}
