import { Dependency, Flamework, OnStart } from "@flamework/core"
import { Component, BaseComponent, Components } from "@flamework/components"
import { TowerConfig, TowerInfo, TowerName } from "shared/config/TowerConfig"
import { TAG_TOWER } from "shared/constants"
import { RunService, Workspace } from "@rbxts/services"
import { Enemy } from "./Enemy"
import Maid from "@rbxts/maid"
import { clock } from "shared/types"
import { Track } from "./Track"
import { $assert } from "rbxts-transform-debug"

interface TowerInstance extends PVInstance {
	hitbox: PVInstance
}

export type TargetMode = "First" | "Last" | "Closest"

type Attributes = TowerInfo & {
	damageDealt: number
	targetMode: TargetMode
}

@Component({
	tag: TAG_TOWER,
	predicate: instance => Flamework.createGuard<TowerName>()(instance.Name),
	ancestorWhitelist: [Workspace],
	defaults: {
		damageDealt: 0,
		damage: 0,
		attackRate: 0,
		range: 0,
		targetMode: "First"
	}
})
export class Tower extends BaseComponent<Attributes, TowerInstance> implements OnStart {
	private towerType = this.instance.Name as never as TowerName
	private maid = new Maid()

	private lastAttack: clock = 0

	constructor() {
		super()
		const { range, damage, attackRate } = TowerConfig[this.towerType]
		const attributes = this.attributes
		attributes.range = range
		attributes.damage = damage
		attributes.attackRate = attackRate
	}

	onStart() {
		const tracks = Dependency<Components>().getAllComponents<Track>()
		$assert(
			tracks.size() === 1,
			`${tracks.size()} track components exist. If amount is 0, a tower is being placed without a track being created.`
		) // Track component is a singleton
		const track = tracks[0]
		this.maid.GiveTask(
			RunService.PreSimulation.Connect(() => {
				//Find closest enemy and face it
				const enemies = track.getActiveEnemies()
				const targetEnemy = this.findEnemy(this.attributes.targetMode, enemies)

				// Found an enemy within range
				if (targetEnemy) {
					this.faceEnemy(targetEnemy)
					// Attack Cooldown
					const elapsed = os.clock() - this.lastAttack
					if (elapsed >= this.attributes.attackRate) {
						this.dealDamage(targetEnemy)
					}
				}
			})
		)
	}

	private faceEnemy(enemy: Enemy) {
		const enemyPos = enemy.instance.GetPivot().Position
		const towerPos = this.instance.GetPivot().Position

		// Ignore Y so it only rotates horizontally
		const lookAtPos = new Vector3(enemyPos.X, towerPos.Y, enemyPos.Z)

		// Apply rotation to the tower itself
		this.instance.PivotTo(CFrame.lookAt(towerPos, lookAtPos))
	}

	public dealDamage(enemy: Enemy) {
		this.lastAttack = os.clock()
		enemy.takeDamage(this.attributes.damage)
		this.attributes.damageDealt += this.attributes.damage
	}

	public destroy() {
		this.maid.DoCleaning()
		super.destroy()
	}

	/**
	 * Update to use QuadTrees or Spatial Partitioning
	 */
	private findEnemy(targetMode: TargetMode, enemies: Set<Enemy>): Enemy | undefined {
		if (enemies.size() === 0) return
		if (targetMode === "Closest") {
			const towerPosition = this.instance.GetPivot().Position
			let closestEnemy: Enemy | undefined
			let closestDistance = this.attributes.range

			enemies.forEach(enemy => {
				// Ensure enemy is valid
				if (!enemy.instance || !enemy.instance.Parent) return

				// GetPivot works on Models (returns CFrame of the root)
				const enemyPosition = enemy.instance.GetPivot().Position
				const distance = towerPosition.sub(enemyPosition).Magnitude

				if (distance < closestDistance) {
					closestEnemy = enemy
					closestDistance = distance
				}
			})

			return closestEnemy
		} else {
			const towerPos = this.instance.GetPivot().Position

			const enemiesInRange = [...enemies].filter(enemy => {
				const enemyPos = enemy.instance.GetPivot().Position
				return towerPos.sub(enemyPos).Magnitude <= this.attributes.range
			})

			if (enemiesInRange.size() === 0) return

			// Pick the enemy with maximum progress (furthest along path)
			return enemiesInRange.reduce((best, enemy) => {
				const enemyProgress = os.clock() - enemy.attributes.timeSpawned
				const bestProgress = os.clock() - best.attributes.timeSpawned

				if (targetMode === "First") {
					return enemyProgress > bestProgress ? enemy : best
				} else {
					// must be "Last"
					return enemyProgress < bestProgress ? enemy : best
				}
			}, enemiesInRange[0])
		}
	}
}
