import { Controller, OnStart } from "@flamework/core"
import { atom } from "@rbxts/charm"
import { Events } from "client/networking"

@Controller({})
export class GameController implements OnStart {
	private health = atom(-1)

	onStart() {
		Events.healthChanged.connect(value => this.health(value))
	}
}
