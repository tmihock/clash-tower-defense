// import { Flamework, OnStart } from "@flamework/core"
// import { Component, BaseComponent } from "@flamework/components"
// import { TAG_ENEMY } from "shared/constants"
// import { EnemyConfig, EnemyInfo, EnemyName } from "shared/config/EnemyConfig"
// import { Workspace } from "@rbxts/services"
// import { clock } from "shared/types"
// import Signal from "@rbxts/lemon-signal"

// interface EnemyInstance extends PVInstance {
// 	hitbox: PVInstance
// }

// type Attributes = EnemyInfo & {
// 	timeSpawned: clock
// }

// @Component({
// 	tag: TAG_ENEMY,
// 	predicate: instance => Flamework.createGuard<EnemyName>()(instance.Name),
// 	ancestorWhitelist: [Workspace],
// 	defaults: {
// 		// Default here or instance requires them to be already made
// 		health: -1,
// 		damage: -1,
// 		speed: -1,
// 		timeSpawned: -1
// 	}
// })
// export class Enemy extends BaseComponent<Attributes, EnemyInstance> implements OnStart {
// 	private enemyType = this.instance.Name as never as EnemyName

// 	public destroying = new Signal()

// 	constructor() {
// 		super()
// 		const { health, damage, speed } = EnemyConfig[this.enemyType]
// 		const attributes = this.attributes
// 		attributes.health = health
// 		attributes.damage = damage
// 		attributes.speed = speed
// 	}

// 	onStart() {}

// 	public moveTo(pos: Vector3, lookDir?: Vector3) {
// 		if (!lookDir || lookDir.Magnitude <= 0) {
// 			this.instance.PivotTo(new CFrame(pos))
// 			return
// 		}

// 		// Current orientation
// 		const current = this.instance.GetPivot()

// 		// Target orientation (facing movement direction)
// 		const target = CFrame.lookAt(pos, pos.add(lookDir.Unit))

// 		// Adjust the alpha to control turn speed (closer to 1 = faster snap)
// 		const alpha = 0.1

// 		const smoothed = current.Lerp(target, alpha)
// 		this.instance.PivotTo(smoothed)
// 	}

// 	public takeDamage(amount: number) {
// 		this.attributes.health -= amount
// 		if (this.attributes.health >= 0) {
// 			this.kill()
// 		}
// 	}

// 	public kill() {
// 		// Do animation
// 		this.destroying.Fire()
// 		this.instance.Destroy()
// 		this.destroy()
// 	}
// }
