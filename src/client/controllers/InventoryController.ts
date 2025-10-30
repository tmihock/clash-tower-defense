import { Controller, OnStart } from "@flamework/core"
import { Players } from "@rbxts/services"
import { ClientStateProvider } from "./ClientStateProvider"
import Signal from "@rbxts/lemon-signal"

const player = Players.LocalPlayer

@Controller({})
export class InventoryController implements OnStart {
	public playerStoppedHoldingTower = new Signal<() => void>()

	constructor(private stateProvider: ClientStateProvider) {}

	onStart() {}
}
