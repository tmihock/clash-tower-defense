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

		const towerInstance = towerFolder[tower]
		const hitbox = towerInstance.hitbox

		const radius = hitbox.Size.Y / 2
		const height = hitbox.Size.X

		// CFrame for the candidate placement
		const cframe = new CFrame(pos, pos.add(hitbox.CFrame.LookVector))

		// Broad phase box query
		const overlapParams = new OverlapParams()
		overlapParams.FilterType = Enum.RaycastFilterType.Include
		overlapParams.FilterDescendantsInstances = [path, Workspace.Towers]

		const hits = Workspace.GetPartBoundsInBox(cframe, towerInstance.GetExtentsSize(), overlapParams)

		// Narrow phase: test cylinder vs each candidate’s volume
		for (const part of hits) {
			// Candidate center in cylinder space
			const rel = cframe.PointToObjectSpace(part.Position)

			// Half-extents of candidate in world space (approx radius in YZ plane)
			const partRadius = math.max(part.Size.Y, part.Size.Z) / 2
			const partHalfHeight = part.Size.X / 2

			// Height axis check (along local X of cylinder)
			const overlapX = math.abs(rel.X) <= height / 2 + partHalfHeight
			if (!overlapX) continue

			// Radial check in cylinder cross-section (local YZ)
			const dist2 = rel.Y * rel.Y + rel.Z * rel.Z
			const maxRadius = radius + partRadius
			if (dist2 <= maxRadius * maxRadius) {
				return false // overlap detected
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
