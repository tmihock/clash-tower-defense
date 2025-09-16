import { EnemyConfig, EnemyInfo, EnemyName } from "shared/config/EnemyConfig"
import { ReplicatedStorage } from "@rbxts/services"
import Signal from "@rbxts/lemon-signal"
import { Events } from "server/networking"

const enemyFolder = ReplicatedStorage.Assets.Enemies

export class Enemy {
	private health: number

	public info: EnemyInfo
	public timeSpawned = os.clock()
	public position: Vector3 = Vector3.zero
	public destroying = new Signal()

	constructor(
		enemy: EnemyName,
		public id: number
	) {
		this.info = EnemyConfig[enemy]
		this.health = this.info.health
	}

	public takeDamage(value: number) {
		this.setHealth(this.health - value)
	}

	public setHealth(value: number) {
		this.health = value
		if (this.health <= 0) {
			this.kill()
		} else {
			Events.updateEnemyHealth.broadcast(this.id, value)
		}
	}

	public getHealth(): number {
		return this.health
	}

	public kill() {
		this.health = 0
		this.destroying.Fire()
	}
}
