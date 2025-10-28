import { Service, OnStart } from "@flamework/core"
import { Waves } from "shared/config/Rounds"
import { EnemyService } from "./EnemyService"
import { $print } from "rbxts-transform-debug"
import Signal from "@rbxts/lemon-signal"
import { PlayerStateProvider } from "./PlayerStateProvider"
import { ServerStateProvider } from "./ServerStateProvider"
import { Atom } from "@rbxts/charm"

@Service({})
export class RoundService implements OnStart {
	private currentRound: Atom<number>
	private isSpawning = false

	public roundEnded = new Signal<number>()

	constructor(
		private enemyService: EnemyService,
		private playerStateProvider: PlayerStateProvider,
		private serverStateProvider: ServerStateProvider
	) {
		this.currentRound = this.serverStateProvider.currentRound
	}

	onStart() {
		task.wait(5)
		$print("Game started")
		this.play()
	}

	public play() {
		while (this.currentRound() < Waves.size()) {
			this.nextRound()
			this.roundEnded.Wait()
			task.wait(1)
		}
	}

	public nextRound() {
		this.currentRound(old => old + 1)
		if (this.currentRound() < Waves.size() - 1) {
			this.playRound(this.currentRound())
			this.giveRoundEndReward(this.currentRound())
		} else {
			$print("All rounds completed!")
			$print("YOU WIN!")
		}
	}

	/**
	 * Rewards all players same amount of money and exp
	 * Gives 100 * round money and 1-5 exp
	 */
	private giveRoundEndReward(round: number) {
		const moneyToGive = 100 * round
		const expToGive = math.random(1, 5)
		this.playerStateProvider.playerState.forEach(state => {
			state.exp(old => old + expToGive)
			state.money(old => old + moneyToGive)
		})
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
			for (const _ of $range(1, count)) {
				this.enemyService.createEnemy(enemy)
				task.wait(spawnInterval)
			}
		})
		this.isSpawning = false
	}
}
