import { Controller, OnStart } from "@flamework/core"
import { Events } from "client/networking"
import { TowerName } from "shared/config/TowerConfig"
import { EnemyController } from "./EnemyController"
import { TargetMode } from "shared/networking"
import { ClientStateProvider } from "./ClientStateProvider"
import { Tower_C } from "client/classes/Tower_C"

/**
 * Syncs tower's data and renders tower instances
 */
@Controller({})
export class TowerRenderer implements OnStart {
	private towers = new Map<number, Tower_C>()

	constructor(
		private enemyController: EnemyController,
		private stateProvider: ClientStateProvider
	) {}

	onStart() {
		Events.towerPlaced.connect((i, p, t, o) => this.onTowerPlaced(i, p, t, o))
		Events.towerDeleted.connect(i => this.onTowerDeleted(i))
		Events.towerAttackedEnemy.connect((t, e) => this.onTowerAttackedEnemy(t, e))
		Events.setTowerTargetMode.connect((i, t) => this.onTowerTargetModeChanged(i, t))
	}

	private onTowerTargetModeChanged(id: number, mode: TargetMode) {
		const tower = this.towers.get(id)
		tower!.targetMode = mode
	}

	private onTowerPlaced(id: number, pos: Vector3, tower: TowerName, owner: Player) {
		const newTower = new Tower_C(id, pos, tower, this.enemyController, owner)
		this.towers.set(id, newTower)
	}

	private onTowerDeleted(id: number) {
		this.towers.get(id)!.destroy()
		this.towers.delete(id)
	}

	private onTowerAttackedEnemy(towerId: number, enemyId: number) {
		const tower = this.towers.get(towerId)
		if (tower) {
			tower.damageDealt += tower.info.damage
		}
	}
}
