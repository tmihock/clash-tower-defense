import { TowerConfig, TowerInfo, TowerName } from "shared/config/TowerConfig"
import { ReplicatedStorage, RunService, Workspace } from "@rbxts/services"
import { EnemyController } from "client/controllers/EnemyController"
import { Enemy_C } from "./Enemy_C"
import { TargetMode } from "shared/networking"
import Maid from "@rbxts/maid"

const towerFolder = ReplicatedStorage.Assets.Towers

export const ATTR_OWNER = "owner"
export const ATTR_ID = "id"

export class Tower_C {
	public instance: PVInstance
	public info: TowerInfo
	public damageDealt = 0
	public targetMode: TargetMode = "First"

	private maid = new Maid()

	constructor(
		public id: number,
		public position: Vector3,
		tower: TowerName,
		private enemyController: EnemyController,
		public owner: Player
	) {
		this.info = TowerConfig[tower]

		const towerInstance = towerFolder[tower].Clone()
		towerInstance.PivotTo(new CFrame(position))
		towerInstance.Parent = Workspace.Towers

		this.instance = towerInstance
		this.instance.SetAttribute(ATTR_ID, id)
		this.instance.SetAttribute(ATTR_OWNER, owner.Name)
		this.maid.GiveTask(RunService.RenderStepped.Connect(() => this.faceTargetEnemy()))
	}

	private faceTargetEnemy() {
		const targetEnemy = this.findEnemy()
		if (!targetEnemy) return

		const enemyPos = targetEnemy.position
		const towerPos = this.instance.GetPivot().Position

		// Only rotate left and right
		const lookAtPos = new Vector3(enemyPos.X, towerPos.Y, enemyPos.Z)

		this.instance.PivotTo(CFrame.lookAt(towerPos, lookAtPos))
	}

	private findEnemy(): Enemy_C | undefined {
		const enemies = this.enemyController.getEnemies()
		if (enemies.size() === 0) return
		if (this.targetMode === "Closest") {
			const towerPos = this.position
			let closestEnemy: Enemy_C | undefined
			let closestDistance = this.info.range

			enemies.forEach(enemy => {
				// GetPivot works on Models (returns CFrame of the root)
				const enemyPos = enemy.position
				const distance = towerPos.sub(enemyPos).Magnitude

				if (distance < closestDistance) {
					closestEnemy = enemy
					closestDistance = distance
				}
			})

			return closestEnemy
		} else {
			const towerPos = this.position

			const enemiesInRange = enemies
				.filter(v => v.health > 0)
				.filter(enemy => {
					const enemyPos = enemy.position
					return towerPos.sub(enemyPos).Magnitude <= this.info.range
				})

			if (enemiesInRange.size() === 0) return

			// Pick the enemy with maximum progress (furthest along path)
			return enemiesInRange.reduce((best, enemy) => {
				const enemyProgress = os.clock() - enemy.timeSpawned
				const bestProgress = os.clock() - best.timeSpawned

				if (this.targetMode === "First") {
					return enemyProgress > bestProgress ? enemy : best
				} else {
					// must be "Last"
					return enemyProgress < bestProgress ? enemy : best
				}
			}, enemiesInRange[0])
		}
	}

	public destroy() {
		this.instance.Destroy()
	}
}
