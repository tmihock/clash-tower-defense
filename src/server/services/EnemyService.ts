import { Service, OnStart, Flamework, Dependency } from "@flamework/core"
import { Track } from "server/components/Track"
import { ReplicatedStorage } from "@rbxts/services"
import { EnemyConfig, EnemyName } from "shared/config/EnemyConfig"
import { Component, Components } from "@flamework/components"
import { Enemy } from "server/components/Enemy"
import { $print } from "rbxts-transform-debug"

const enemyFolder = ReplicatedStorage.Assets.Enemies

@Service({})
export class EnemyService implements OnStart {
	onStart() {
		task.wait(3)
		for (const i of $range(1, 100)) {
			task.wait(0.5)
			this.spawnEnemy("Skeleton")
		}
	}

	public spawnEnemy(enemy: EnemyName) {
		const Components = Dependency<Components>()
		const track = Components.getAllComponents<Track>()[0]

		const newEnemy = enemyFolder[enemy]!.Clone()
		newEnemy.Parent = track.instance.enemies

		const enemyComponent = Components.getComponent<Enemy>(newEnemy)
		assert(enemyComponent, `Component for "${newEnemy.GetFullName()}" not found.`)

		track.addEnemy(enemyComponent)
	}
}
