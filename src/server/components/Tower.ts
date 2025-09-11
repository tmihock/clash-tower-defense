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

type Attributes = TowerInfo & {
	damageDealt: number
}

@Component({
	tag: TAG_TOWER,
	predicate: instance => Flamework.createGuard<TowerName>()(instance.Name),
	ancestorWhitelist: [Workspace],
	defaults: {
		damageDealt: 0
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
				const [closestEnemy, distance] = this.findClosestEnemy(enemies)

				const elapsed = os.clock() - this.lastAttack
				// Attack Cooldown
				if (elapsed >= this.attributes.attackRate) {
					// Found an enemy within range
					if (closestEnemy && distance <= this.attributes.range) {
						this.dealDamage(closestEnemy)
					}
				}
			})
		)
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

	private findClosestEnemy(enemies: Set<Enemy>): [Enemy, number] | [undefined, number] {
		const towerPosition = this.instance.GetPivot().Position
		let closest: Enemy | undefined
		let closestDistance = math.huge

		enemies.forEach(enemy => {
			// Ensure enemy is valid
			if (!enemy.instance || !enemy.instance.Parent) return

			// GetPivot works on Models (returns CFrame of the root)
			const enemyPosition = enemy.instance.GetPivot().Position
			const distance = towerPosition.sub(enemyPosition).Magnitude

			if (distance < closestDistance) {
				closest = enemy
				closestDistance = distance
			}
		})

		return [closest, closestDistance]
	}
}
