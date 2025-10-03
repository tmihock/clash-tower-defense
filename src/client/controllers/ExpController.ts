import { Controller, OnStart } from "@flamework/core"
import { Events } from "client/networking"
import { ClientStateProvider } from "./ClientStateProvider"
import { Atom } from "@rbxts/charm"

@Controller({})
export class ExpController implements OnStart {
	private exp: Atom<number>

	constructor(private stateProvider: ClientStateProvider) {
		this.exp = this.stateProvider.exp
	}

	onStart() {
		Events.moneyChanged.connect(newAmount => {
			this.exp(newAmount)
		})
	}
}
