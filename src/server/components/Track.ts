import { OnStart } from "@flamework/core"
import { Component, BaseComponent } from "@flamework/components"
import { TAG_TRACK } from "shared/constants"
import { RunService, Workspace } from "@rbxts/services"
import { Enemy } from "./Enemy"
import { FolderWith } from "shared/types"

type NumberString = `${number}`

interface TrackInstance extends Instance {
	waypoints: FolderWith<BasePart>
	enemies: Folder
}

interface Attributes {}

export function getPositionOnPath(waypoints: Vector3[], speed: number, t: number): Vector3 {
	const d = speed * t // total distance traveled

	// Precompute segment lengths
	const lengths = table.create<number>(waypoints.size())
	for (let i = 0; i < waypoints.size() - 1; i++) {
		lengths.push(waypoints[i + 1].sub(waypoints[i]).Magnitude)
	}

	// Walk along the path
	let distAccum = 0
	for (let i = 0; i < lengths.size(); i++) {
		const L = lengths[i]
		if (d <= distAccum + L) {
			const segDist = d - distAccum
			const alpha = segDist / L

			// interpolate between waypoints[i] and waypoints[i+1]
			return waypoints[i].Lerp(waypoints[i + 1], alpha)
		}
		distAccum += L
	}

	// If we've gone past the end, clamp to the final waypoint
	return waypoints[waypoints.size() - 1]
}

@Component({
	tag: TAG_TRACK,
	ancestorWhitelist: [Workspace]
})
export class Track extends BaseComponent<Attributes, TrackInstance> implements OnStart {
	private trackLength: number

	private activeEnemies = new Array<Enemy>()
	private waypoints = new Array<Vector3>()
	private travelConnections = new Map<Enemy, RBXScriptConnection>()

	constructor() {
		super()

		this.waypoints = this.instance.waypoints.GetChildren().map(v => v.Position)

		let total = 0
		for (let i = 0; i < this.waypoints.size() - 1; i++) {
			total += this.waypoints[i + 1].sub(this.waypoints[i]).Magnitude
		}
		this.trackLength = total
	}

	onStart() {}

	public addEnemy(enemy: Enemy) {
		this.activeEnemies.push(enemy)
		this.startEnemyTravel(enemy)
	}

	private startEnemyTravel(enemy: Enemy) {
		enemy.attributes.timeSpawned = os.clock()
		enemy.destroying.Once(() => this.travelConnections.delete(enemy))

		this.travelConnections.set(
			enemy,
			RunService.PreRender.Connect(() => this.incrementEnemyPosition(enemy))
		)
	}

	incrementEnemyPosition(enemy: Enemy) {
		const { speed, timeSpawned } = enemy.attributes
		const elapsed = os.clock() - timeSpawned

		const pos = getPositionOnPath(this.waypoints, speed, elapsed)

		// Approximate movement direction using a small time step
		const futurePos = getPositionOnPath(
			this.waypoints,
			speed,
			elapsed + RunService.Heartbeat.Wait()[0]
		)
		const dir = futurePos.sub(pos)

		enemy.moveTo(pos, dir)

		// Finished check
		const distanceTravelled = speed * elapsed
		if (distanceTravelled >= this.trackLength) {
			enemy.kill()
		}
	}
}
