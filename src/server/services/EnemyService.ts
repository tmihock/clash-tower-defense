import { Service, OnStart } from "@flamework/core"
import { ReplicatedStorage, RunService } from "@rbxts/services"
import { EnemyName } from "shared/config/EnemyConfig"
import { Enemy_S } from "server/classes/Enemy_S"
import { TrackService } from "./TrackService"
import { Events } from "server/networking"
import { GameService } from "./GameService"
import Signal from "@rbxts/lemon-signal"

const enemyFolder = ReplicatedStorage.Assets.Enemies

let currentId = 1
function nextId(): number {
	return currentId++
}

@Service({})
export class EnemyService implements OnStart {
	// Alive Enemies
	private enemies = new Map<number, Enemy_S>()
	private travelConnections = new Map<Enemy_S, RBXScriptConnection>()

	public allEnemiesDied = new Signal()

	constructor(
		private trackService: TrackService,
		private gameService: GameService
	) {}

	onStart() {}

	public createEnemy(enemyName: EnemyName): Enemy_S {
		const id = nextId()
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
		const { speed } = enemy.info
		const elapsed = os.clock() - enemy.timeSpawned

		// Approximate movement direction using a small time step
		enemy.position = this.trackService.getPositionOnPath(
			this.trackService.getWaypoints(),
			speed,
			elapsed
		)

		// Check if enemy reached the end
		const distanceTravelled = speed * elapsed
		if (distanceTravelled >= this.trackService.getTrackLength()) {
			const damage = enemy.info.damage
			this.gameService.takeDamage(damage)
			this.killEnemy(enemy.id)
		}
	}

	public getEnemies() {
		return this.enemies
	}

	public killEnemy(id: number) {
		const enemy = this.enemies.get(id)!
		this.enemies.delete(id)
		enemy.destroying.Fire()
		if (this.enemies.size() === 0) {
			this.allEnemiesDied.Fire()
		}
	}

	public setEnemyHealth(id: number, value: number) {
		this.enemies.get(id)!.setHealth(value)
	}
}
