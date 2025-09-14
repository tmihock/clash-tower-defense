import { OnStart } from "@flamework/core"
import { Component, BaseComponent } from "@flamework/components"
import { TAG_TRACK } from "shared/constants"
import { RunService, Workspace } from "@rbxts/services"
import { Enemy } from "./Enemy"
import { FolderWith } from "shared/types"
import { GameService } from "server/services/GameService"
import { Tower } from "./Tower"
import { $print } from "rbxts-transform-debug"

type NumberString = `${number}`

interface TrackInstance extends Instance {
	waypoints: FolderWith<BasePart>
	path: FolderWith<BasePart>
	enemies: Folder
}

interface Attributes {}

function getPositionOnPath(waypoints: Vector3[], speed: number, t: number): Vector3 {
	const d = speed * t // total distance traveled

	let distAccum = 0
	for (let i = 0; i < waypoints.size() - 1; i++) {
		const a = waypoints[i] // current
		const b = waypoints[i + 1] // next
		const L = b.sub(a).Magnitude // length

		if (d <= distAccum + L) {
			const segDist = d - distAccum
			const alpha = segDist / L
			return a.Lerp(b, alpha)
		}

		distAccum += L
	}

	// Clamp to the last waypoint if we've passed the end
	return waypoints[waypoints.size() - 1]
}

@Component({
	tag: TAG_TRACK,
	ancestorWhitelist: [Workspace]
})
export class Track extends BaseComponent<Attributes, TrackInstance> implements OnStart {
	private trackLength: number

	private activeEnemies = new Set<Enemy>()
	private waypoints = new Array<Vector3>()
	private travelConnections = new Map<Enemy, RBXScriptConnection>()

	constructor(private gameService: GameService) {
		super()

		this.waypoints = this.instance.waypoints.GetChildren().map(v => v.Position)

		let total = 0
		for (let i = 0; i < this.waypoints.size() - 1; i++) {
			total += this.waypoints[i + 1].sub(this.waypoints[i]).Magnitude
		}
		this.trackLength = total
	}

	onStart() {}

	public addTower(tower: Tower) {}

	public addEnemy(enemy: Enemy) {
		this.activeEnemies.add(enemy)
		this.startEnemyTravel(enemy)
	}

	public getActiveEnemies(): Set<Enemy> {
		return this.activeEnemies
	}

	private startEnemyTravel(enemy: Enemy) {
		enemy.attributes.timeSpawned = os.clock()
		enemy.destroying.Once(() => {
			this.activeEnemies.delete(enemy)
			this.travelConnections.get(enemy)!.Disconnect()
			this.travelConnections.delete(enemy)
		})

		this.travelConnections.set(
			enemy,
			RunService.Heartbeat.Connect(dt => this.incrementEnemyPosition(enemy, dt))
		)
	}

	private incrementEnemyPosition(enemy: Enemy, dt: number) {
		const { speed, timeSpawned } = enemy.attributes
		const elapsed = os.clock() - timeSpawned
		const pos = getPositionOnPath(this.waypoints, speed, elapsed)

		// Approximate movement direction using a small time step
		const futurePos = getPositionOnPath(this.waypoints, speed, elapsed + dt)
		const dir = futurePos.sub(pos)

		enemy.moveTo(pos, dir)

		// Check if enemy reached the end
		const distanceTravelled = speed * elapsed
		if (distanceTravelled >= this.trackLength) {
			const damage = enemy.attributes.damage
			this.gameService.takeDamage(damage)
			enemy.kill()
		}
	}
}
