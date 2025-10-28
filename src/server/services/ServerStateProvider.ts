import { Service, OnStart } from "@flamework/core"
import { atom, subscribe } from "@rbxts/charm"
import { Events } from "server/networking"
import { OnPlayerAdded } from "./PlayerService"

@Service({
	loadOrder: 0
})
export class ServerStateProvider implements OnStart, OnPlayerAdded {
	onStart() {}

	onPlayerAdded(player: Player): void {}
}
