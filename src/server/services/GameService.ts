import { Service, OnStart } from "@flamework/core"
import { atom } from "@rbxts/charm"
import { Waves } from "shared/config/Rounds"
import { OnPlayerAdded, OnPlayerRemoving } from "./PlayerService"
import { Events } from "server/networking"
import { MAX_HEALTH } from "shared/constants"
import { $print } from "rbxts-transform-debug"

@Service({})
export class GameService implements OnStart, OnPlayerAdded, OnPlayerRemoving {
	private health = atom(MAX_HEALTH)

	constructor() {}

	onStart() {}

	onPlayerAdded(player: Player): void {
		Events.healthChanged.fire(player, this.health())
	}

	onPlayerRemoving(player: Player): void {}

	public takeDamage(amount: number) {
		// Play effect
		this.health(old => old - amount)
	}

	public getHealth(): number {
		return this.health()
	}
}
