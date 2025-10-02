import { Service, OnStart } from "@flamework/core"
import { atom } from "@rbxts/charm"
import { Waves } from "shared/config/Waves"
import { OnPlayerAdded, OnPlayerRemoving } from "./PlayerService"
import { Events } from "server/networking"
import { MAX_HEALTH } from "shared/constants"

@Service({})
export class GameService implements OnStart, OnPlayerAdded, OnPlayerRemoving {
	private currentWave = 0
	private health = atom(MAX_HEALTH)

	onStart() {}

	onPlayerAdded(player: Player): void {
		Events.healthChanged.fire(player, this.health())
	}

	onPlayerRemoving(player: Player): void {}

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
		this.health(old => old - amount)
	}

	public getHealth(): number {
		return this.health()
	}
}
