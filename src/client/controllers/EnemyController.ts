import { Controller, OnStart } from "@flamework/core"
import { Enemy } from "client/classes/Enemy"
import { Events } from "client/networking"
import { EnemyName } from "shared/config/EnemyConfig"

@Controller({})
export class EnemyController implements OnStart {
	private enemies = new Map<number, Enemy>()

	onStart() {
		Events.enemySpawned.connect((i, e) => this.onEnemySpawned(i, e))
		Events.enemyDeleted.connect(i => this.onEnemyDeleted(i))
		Events.updateEnemyHealth.connect((i, v) => this.onEnemyHealthUpdated(i, v))
	}

	private onEnemySpawned(id: number, enemy: EnemyName) {
		const newEnemy = new Enemy(enemy)
		this.enemies.set(id, newEnemy)
	}

	private onEnemyDeleted(id: number) {
		this.enemies.get(id)!.destroy()
		this.enemies.delete(id)
	}

	private onEnemyHealthUpdated(id: number, value: number) {
		print(this.enemies, id)

		this.enemies.get(id)!.setHealth(value)
	}
}
