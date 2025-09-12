import { Service, OnStart } from "@flamework/core"
import { Waves } from "shared/config/Waves"

@Service({})
export class GameService implements OnStart {
	private currentWave = 0
	private health = 200

	onStart() {}

	public nextWave() {
		this.currentWave++

		const currentWave = Waves[this.currentWave]
		// Play waves
	}

	public getCurrentWave(): number {
		return this.currentWave
	}

	public takeDamage(amount: number) {
		// Play effect
		this.health -= amount
	}

	public getHealth(): number {
		return this.health
	}
}
