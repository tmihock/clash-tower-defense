import { Controller, OnStart } from "@flamework/core"
import { Players } from "@rbxts/services"
import { TowerController } from "./TowerController"
import { ClientStateProvider } from "./ClientStateProvider"
import { $terrify } from "rbxts-transformer-t-new"
import { TowerName } from "shared/config/TowerConfig"
import Signal from "@rbxts/lemon-signal"

const player = Players.LocalPlayer

@Controller({})
export class InventoryController implements OnStart {
	public playerStoppedHoldingTower = new Signal<() => void>()

	constructor(private stateProvider: ClientStateProvider) {}

	onStart() {}
}
