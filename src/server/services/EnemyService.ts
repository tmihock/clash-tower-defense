import { Service, OnStart } from "@flamework/core"
import { RunService } from "@rbxts/services"
import { EnemyName } from "shared/config/EnemyConfig"
import { Enemy_S } from "server/classes/Enemy_S"
import { TrackService } from "./TrackService"
import { Events } from "server/networking"
import Signal from "@rbxts/lemon-signal"
import { ServerStateProvider } from "./ServerStateProvider"
import { ENEMY_SPEED } from "shared/constants"
import { EnemySyncInfo } from "shared/networking"
import { IdManager } from "shared/util/IdManager"
import { SharedClock } from "shared/util/SharedClock"

const idManager = new IdManager(9999)

@Service({})
export class EnemyService implements OnStart {
	// Alive Enemies
	private enemies = new Map<number, Enemy_S>()
	private travelConnections = new Map<Enemy_S, RBXScriptConnection>()

	public allEnemiesDied = new Signal()

	constructor(
		private trackService: TrackService,
		private stateProvider: ServerStateProvider
	) {}

	onStart() {}

	public createEnemy(enemyName: EnemyName): Enemy_S {
		const id = idManager.nextId()
		const newEnemy = new Enemy_S(enemyName, id)

		this.enemies.set(id, newEnemy)
		Events.enemySpawned.broadcast(id, enemyName)
		this.startEnemyTravel(newEnemy)
		return newEnemy
	}

	private startEnemyTravel(enemy: Enemy_S) {
		enemy.destroying.Once(() => {
			this.travelConnections.get(enemy)!.Disconnect()
			this.travelConnections.delete(enemy)

			Events.enemyDeleted.broadcast(enemy.id)
		})

		this.travelConnections.set(
			enemy,
			RunService.Heartbeat.Connect(dt => this.incrementEnemyPosition(enemy, dt))
		)
	}

	private incrementEnemyPosition(enemy: Enemy_S, dt: number) {
		const elapsed = SharedClock() - enemy.timeSpawned

		// Approximate movement direction using a small time step
		enemy.position = this.trackService.getPositionOnPath(
			this.trackService.getWaypoints(),
			ENEMY_SPEED,
			elapsed
		)

		// Enemy reached end -> kill it
		const distanceTravelled = ENEMY_SPEED * elapsed
		if (distanceTravelled >= this.trackService.getTrackLength()) {
			this.killEnemy(enemy.id)
		}
	}

	public getEnemies() {
		return this.enemies
	}

	public killEnemy(id: number) {
		print(debug.traceback())
		const enemy = this.enemies.get(id)!
		this.enemies.delete(id)
		idManager.release(id)
		enemy.destroying.Fire()
		if (this.enemies.size() === 0) {
			this.allEnemiesDied.Fire()
		}
	}

	public setEnemyHealth(id: number, value: number) {
		this.enemies.get(id)!.setHealth(value)
	}
}
