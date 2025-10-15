import { Service, OnStart } from "@flamework/core"
import { atom, subscribe } from "@rbxts/charm"
import { Events } from "server/networking"
import { OnPlayerAdded } from "./PlayerService"

const SAVE_KEY = "playerState"

@Service({})
export class ServerStateProvider implements OnStart {
	onStart() {
		// Remotes
	}
}
