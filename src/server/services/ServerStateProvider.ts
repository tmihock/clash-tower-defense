import { Service, OnStart } from "@flamework/core"
import { atom, subscribe } from "@rbxts/charm"
import { Events } from "server/networking"
import { OnPlayerAdded } from "./PlayerService"

@Service({
	loadOrder: 0
})
export class ServerStateProvider implements OnStart, OnPlayerAdded {
	public health = atom(100)
	public gameStarted = atom(false)
	public currentRound = atom(0)

	onStart() {
		subscribe(this.health, newHealth => {
			Events.healthChanged.broadcast(newHealth)
		})
	}

	onPlayerAdded(player: Player): void {
		Events.healthChanged.fire(player, this.health())
	}
}
