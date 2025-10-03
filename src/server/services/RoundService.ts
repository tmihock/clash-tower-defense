import { Service, OnStart } from "@flamework/core"
import { Waves } from "shared/config/Rounds"
import { EnemyService } from "./EnemyService"
import { $print } from "rbxts-transform-debug"
import Signal from "@rbxts/lemon-signal"

@Service({})
export class RoundService implements OnStart {
	private currentRound = 0
	private isSpawning = false

	public roundEnded = new Signal<number>()

	constructor(private enemyService: EnemyService) {}

	onStart() {
		task.wait(5)
		$print("Game started")
		this.play()
	}

	public play() {
		while (this.currentRound < Waves.size()) {
			this.nextRound()
			this.roundEnded.Wait()
			task.wait(1)
		}
	}

	public nextRound() {
		this.currentRound++
		if (this.currentRound < Waves.size() - 1) {
			this.playRound(this.currentRound)
		} else {
			$print("All rounds completed!")
			$print("YOU WIN!")
		}
	}

	private playRound(round: number) {
		$print(`Starting round ${round}`)
		this.isSpawning = true
		const waveInfo = Waves[round]
		const c = this.enemyService.allEnemiesDied.Connect(() => {
			if (this.isSpawning) return

			this.roundEnded.Fire(round)
			c.Disconnect()
		})
		waveInfo.enemies.forEach(enemyInfo => {
			const { count, enemy, spawnInterval } = enemyInfo
			for (const i of $range(1, count)) {
				this.enemyService.createEnemy(enemy)
				task.wait(spawnInterval)
			}
		})
		this.isSpawning = false
	}

	public getCurrentRound(): number {
		return this.currentRound
	}
}
