import { Service, OnStart, Dependency } from "@flamework/core"
import { TowerConfig, TowerName } from "shared/config/TowerConfig"
import { ReplicatedStorage, Workspace } from "@rbxts/services"
import { Components } from "@flamework/components"
import { Track } from "server/components/Track"
import { InventoryService } from "./InventoryService"
import { TrackService } from "./TrackService"
import { Tower_S } from "server/classes/Tower_S"
import { EnemyService } from "./EnemyService"
import { Events, Functions } from "server/networking"

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
		private enemyService: EnemyService
	) {}

	onStart() {
		Functions.placeTower.setCallback((p, po, t) => this.onPlaceTower(p, po, t))
	}

	private onPlaceTower(player: Player, pos: Vector3, tower: TowerName): boolean {
		if (this.canPlace(player, pos, tower)) {
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
		const track = this.trackService.getTrack()
		const path = track.instance.path

		const { X, Z } = towerFolder[tower].hitbox.Size
		const towerSize = new Vector3(X, 1000, Z) // xz-plane

		const overlapParams = new OverlapParams()
		overlapParams.FilterType = Enum.RaycastFilterType.Include
		overlapParams.FilterDescendantsInstances = [path, Workspace.Towers]

		// Query physics: does this box overlap any track parts?
		const hits = Workspace.GetPartBoundsInBox(
			new CFrame(pos), // center of the tower
			towerSize, // size of the tower
			overlapParams
		)

		// If we got any hits → tower is on the track
		return hits.size() === 0
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
