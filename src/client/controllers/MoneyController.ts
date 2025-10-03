import { Controller, OnStart } from "@flamework/core"
import { ClientStateProvider } from "./ClientStateProvider"
import { Atom } from "@rbxts/charm"
import { Events } from "client/networking"

@Controller({})
export class MoneyController implements OnStart {
	private money: Atom<number>

	constructor(private stateProvider: ClientStateProvider) {
		this.money = this.stateProvider.money
	}

	onStart() {
		Events.moneyChanged.connect(newAmount => {
			this.money(newAmount)
		})
	}
}
