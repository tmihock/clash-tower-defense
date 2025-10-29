import Maid from "@rbxts/maid"
import { RunService } from "@rbxts/services"
import { EnemyService } from "server/services/EnemyService"
import { TowerConfig, TowerInfo, TowerName } from "shared/config/TowerConfig"
import { clock } from "shared/types"
import { Enemy_S } from "./Enemy_S"
import { Events } from "server/networking"
import { TargetMode } from "shared/networking"
import { PlayerStateProvider } from "server/services/PlayerStateProvider"
import { SharedClock } from "shared/util/SharedClock"

export class Tower_S {
	public targetMode: TargetMode = "First"
	public info: TowerInfo

	private damageDealt = 0
	private lastAttack: clock = 0
	private maid = new Maid()

	constructor(
		towerName: TowerName,
		public id: number,
		public position: Vector3,
		private enemyService: EnemyService,
		public owner: Player,
		private playerStateProvider: PlayerStateProvider
	) {
		this.info = TowerConfig[towerName]
		this.startAttacking()
	}

	public getDamageDealt(): number {
		return this.damageDealt
	}

	private startAttacking() {
		this.maid.GiveTask(
			RunService.PreSimulation.Connect(() => {
				//Find closest enemy and face it
				const enemies = this.enemyService.getEnemies()
				const targetEnemy = this.findEnemy(this.targetMode, enemies)

				// Found an enemy within range
				if (targetEnemy) {
					// Attack Cooldown
					const elapsed = SharedClock() - this.lastAttack
					if (elapsed >= this.info.attackRate) {
						this.attackEnemy(targetEnemy)
					}
				}
			})
		)
	}

	public attackEnemy(enemy: Enemy_S) {
		this.lastAttack = SharedClock()
		// animation.Play()
		// task.wait(animation.Length/2) // Change to be on swing finish
		enemy.takeDamage(this.info.damage)
		Events.towerAttackedEnemy.broadcast(this.id, enemy.id)
		this.damageDealt += this.info.damage

		this.playerStateProvider.get(this.owner).money(old => old + this.info.damage * 1)
		this.playerStateProvider.get(this.owner).exp(old => old + 1)
	}

	private findEnemy(targetMode: TargetMode, enemies: Map<number, Enemy_S>): Enemy_S | undefined {
		if (enemies.size() === 0) return
		if (targetMode === "Closest") {
			const towerPos = this.position
			let closestEnemy: Enemy_S | undefined
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

			const enemiesInRange = [...enemies]
				.map(v => v[1])
				.filter(v => v.getHealth() > 0)
				.filter(enemy => {
					const enemyPos = enemy.position
					return towerPos.sub(enemyPos).Magnitude <= this.info.range
				})

			if (enemiesInRange.size() === 0) return

			// Pick the enemy with maximum progress (furthest along path)
			return enemiesInRange.reduce((best, enemy) => {
				const enemyProgress = SharedClock() - enemy.timeSpawned
				const bestProgress = SharedClock() - best.timeSpawned

				if (targetMode === "First") {
					return enemyProgress > bestProgress ? enemy : best
				} else {
					// must be "Last"
					return enemyProgress < bestProgress ? enemy : best
				}
			}, enemiesInRange[0])
		}
	}

	destroy() {
		this.maid.DoCleaning()
	}
}
