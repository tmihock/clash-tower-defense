import { Service, OnStart } from "@flamework/core"
import { OnPlayerAdded } from "./PlayerService"

@Service({
	loadOrder: 0
})
export class ServerStateProvider implements OnStart, OnPlayerAdded {
	onStart() {}

	onPlayerAdded(player: Player): void {}
}
