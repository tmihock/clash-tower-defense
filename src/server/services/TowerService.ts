import { Service, OnStart, Dependency } from "@flamework/core"
import { TowerConfig, TowerName } from "shared/config/TowerConfig"
import { ReplicatedStorage, Workspace } from "@rbxts/services"
import { Components } from "@flamework/components"
import { Track } from "server/components/Track"
import { Tower } from "server/components/Tower"
import { Functions } from "server/networking"
import { InventoryService } from "./InventoryService"
import { TrackService } from "./TrackService"

const towerFolder = ReplicatedStorage.Assets.Towers

@Service({})
export class TowerService implements OnStart {
	constructor(
		private inventoryService: InventoryService,
		private trackService: TrackService
	) {}

	onStart() {
		task.wait(1)
		this.spawnTower(Workspace.tPos.Position, "Barbarian")

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
		return this.posNotOnTrackOrTower(pos, tower) && this.inventoryService.hasTower(player, tower)
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

	public spawnTower(pos: Vector3, tower: TowerName) {
		const track = this.trackService.getTrack()

		const newTower = towerFolder[tower]!.Clone()
		newTower.PivotTo(new CFrame(pos))
		newTower.Parent = Workspace.Towers

		const towerComponent = Dependency<Components>().getComponent<Tower>(newTower)
		assert(towerComponent, `Component for "${newTower.GetFullName()}" not found.`)

		track.addTower(towerComponent)
	}
}
