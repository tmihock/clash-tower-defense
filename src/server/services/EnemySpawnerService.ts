import { Service, OnStart, Modding } from "@flamework/core"
import { EnemyService } from "./EnemyService"
import { $print } from "rbxts-transform-debug"
import { ENEMY_SPAWN_RATE } from "shared/constants"
import { EnemyConfig, EnemyName, EnemyRarities, Rarity } from "shared/config/EnemyConfig"
import { Queue } from "@rbxts/better-queue"

/** TODO: Allow pausing enemy spawns */
@Service({})
export class EnemySpawnerService implements OnStart {
	private queuedEnemies = new Queue<EnemyName>()

	constructor(private enemyService: EnemyService) {}

	onStart() {
		task.wait(3)
		$print("Game started")
		this.play()
	}

	public play() {
		while (true) {
			//
			if (this.queuedEnemies.size() > 0) {
				this.enemyService.createEnemy(this.queuedEnemies.dequeue()!)
			} else {
				this.enemyService.createEnemy(this.chooseRandomEnemy())
			}
			task.wait(ENEMY_SPAWN_RATE)
		}
	}

	/**
	 * Queues an enemy to be spawned next
	 *
	 * @param {EnemyName} enemyName
	 */
	public queueEnemy(enemyName: EnemyName) {
		this.queuedEnemies.enqueue(enemyName)
	}

	private chooseRandomEnemy(): EnemyName {
		// Step 1: Pick a rarity based on weights
		const rarities = Modding.inspect<Rarity[]>()
		const totalWeight = rarities.reduce((sum, r) => sum + EnemyRarities[r].weight, 0)
		let rand = math.random() * totalWeight
		let chosenRarity: Rarity = rarities[rarities.size() - 1]

		for (const r of rarities) {
			rand -= EnemyRarities[r].weight
			if (rand <= 0) {
				chosenRarity = r
				break
			}
		}

		// 2. Pick a random enemy among that rarity
		const enemiesOfRarity: EnemyName[] = []
		for (const [name, info] of pairs(EnemyConfig)) {
			const enemy = info
			if (enemy.rarity === chosenRarity) {
				enemiesOfRarity.push(name as EnemyName)
			}
		}

		// 3. Choose random enemy from list of that rarity
		const enemyIndex = math.floor(math.random() * enemiesOfRarity.size())

		return enemiesOfRarity[enemyIndex]
	}
}
