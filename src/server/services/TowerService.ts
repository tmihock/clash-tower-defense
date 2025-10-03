import { Service, OnStart } from "@flamework/core"
import { TowerConfig, TowerName } from "shared/config/TowerConfig"
import { ReplicatedStorage, Workspace } from "@rbxts/services"
import { InventoryService } from "./InventoryService"
import { TrackService } from "./TrackService"
import { Tower_S } from "server/classes/Tower_S"
import { EnemyService } from "./EnemyService"
import { Events, Functions } from "server/networking"
import { MoneyService } from "./MoneyService"

const towerFolder = ReplicatedStorage.Assets.Towers

let currentId = 0
function nextId(): number {
	return currentId++
}

@Service({})
export class TowerService implements OnStart {
	private towers = new Map<number, Tower_S>()

	constructor(
		private inventoryService: InventoryService,
		private trackService: TrackService,
		private enemyService: EnemyService,
		private moneyService: MoneyService
	) {}

	onStart() {
		Functions.placeTower.setCallback((p, po, t) => this.onPlaceTowerRequest(p, po, t))
	}

	private onPlaceTowerRequest(player: Player, pos: Vector3, tower: TowerName): boolean {
		if (this.canPlace(player, pos, tower)) {
			this.moneyService.removeMoney(player, TowerConfig[tower].price)
			this.spawnTower(pos, tower)
			return true
		} else {
			return false
		}
	}

	private canPlace(player: Player, pos: Vector3, tower: TowerName): boolean {
		return (
			this.posNotOnTrackOrTower(pos, tower) && this.inventoryService.playerHasTower(player, tower)
		)
	}

	private posNotOnTrackOrTower(pos: Vector3, tower: TowerName): boolean {
		return this.posNotOnTower(pos, tower) && this.posNotOnTrack(pos, tower)
	}

	private posNotOnTrack(pos: Vector3, tower: TowerName): boolean {
		const path = this.trackService.getTrack().instance.path.GetChildren()

		const radius = towerFolder[tower].hitbox.Size.Y / 2

		for (const part of path) {
			const halfSizeX = part.Size.X / 2
			const halfSizeZ = part.Size.Z / 2

			const minX = part.Position.X - halfSizeX
			const maxX = part.Position.X + halfSizeX

			const minZ = part.Position.Z - halfSizeZ
			const maxZ = part.Position.Z + halfSizeZ

			const closestX = math.clamp(pos.X, minX, maxX)
			const closestZ = math.clamp(pos.Z, minZ, maxZ)

			const dx = pos.X - closestX
			const dz = pos.Z - closestZ

			if (dx * dx + dz * dz < radius * radius) {
				return false
			}
		}

		return true
	}

	private posNotOnTower(pos: Vector3, tower: TowerName): boolean {
		const radius = towerFolder[tower].hitbox.Size.Y / 2

		const towerHitboxes = Workspace.Towers.GetChildren()
			.map(t => t.FindFirstChild("hitbox")!)
			.filter(t => t.IsA("BasePart"))

		const px = pos.X
		const pz = pos.Z

		for (const hitbox of towerHitboxes) {
			// defensive: ensure we have a valid BasePart
			if (!hitbox || !hitbox.IsA("BasePart")) continue

			const dx = px - hitbox.Position.X
			const dz = pz - hitbox.Position.Z

			if (dx * dx + dz * dz < radius * radius) {
				return false
			}
		}

		return true
	}

	public destroyTower(id: number) {
		const tower = this.towers.get(id)
		this.towers.delete(id)
		tower?.destroy()
		Events.towerDeleted.broadcast(id)
	}

	public spawnTower(pos: Vector3, tower: TowerName) {
		const id = nextId()
		const newTower = new Tower_S(tower, id, pos, this.enemyService)

		Events.towerPlaced.broadcast(id, pos, tower)

		this.towers.set(id, newTower)
	}
}
