import { Service, OnStart, Flamework, Dependency } from "@flamework/core"
import { Track } from "server/components/Track"
import { ReplicatedStorage } from "@rbxts/services"
import { EnemyConfig, EnemyName } from "shared/config/EnemyConfig"
import { Component, Components } from "@flamework/components"
import { Enemy } from "server/components/Enemy"

const enemyFolder = ReplicatedStorage.Assets.EnemyFolder as never as Folder & {
	[K in EnemyName]: Model
}

@Service({})
export class EnemyService implements OnStart {
	onStart() {}

	public spawnEnemy(track: Track, enemy: EnemyName) {
		const Components = Dependency<Components>()

		const newEnemy = enemyFolder[enemy]!.Clone()
		newEnemy.Parent = track.instance.enemies

		const enemyComponent = Components.getComponent<Enemy>(newEnemy)
		assert(enemyComponent, `Component for "${newEnemy.GetFullName()}" not found.`)

		track.addEnemy(enemyComponent)
	}
}
