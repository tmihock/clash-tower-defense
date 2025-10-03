import { Controller, OnStart } from "@flamework/core"
import { Enemy_C } from "client/classes/Enemy_C"
import { Events } from "client/networking"
import { EnemyName } from "shared/config/EnemyConfig"

@Controller({})
export class EnemyController implements OnStart {
	private enemies = new Map<number, Enemy_C>()

	onStart() {
		Events.enemySpawned.connect((i, e) => this.onEnemySpawned(i, e))
		Events.enemyDeleted.connect(i => this.onEnemyDeleted(i))
		Events.updateEnemyHealth.connect((i, v) => this.onEnemyHealthUpdated(i, v))
	}

	public getEnemies(): Enemy_C[] {
		return [...this.enemies].map(v => v[1])
	}

	private onEnemySpawned(id: number, enemy: EnemyName) {
		const newEnemy = new Enemy_C(id, enemy)
		this.enemies.set(id, newEnemy)
	}

	private onEnemyDeleted(id: number) {
		this.enemies.get(id)!.destroy()
		this.enemies.delete(id)
	}

	private onEnemyHealthUpdated(id: number, value: number) {
		this.enemies.get(id)!.health = value
	}
}
