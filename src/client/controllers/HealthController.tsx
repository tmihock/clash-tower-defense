import { Controller, OnStart } from "@flamework/core"
import { Players } from "@rbxts/services"
import React from "@rbxts/react"
import { createRoot } from "@rbxts/react-roblox"
import { HealthBar } from "client/ui/HealthBar"
import { ClientStateProvider } from "./ClientStateProvider"

const player = Players.LocalPlayer
const playerGui =
	player.FindFirstChildOfClass("PlayerGui") ?? (player.WaitForChild("PlayerGui") as PlayerGui)

@Controller({})
export class HealthController implements OnStart {
	constructor(private stateProvider: ClientStateProvider) {}

	onStart() {
		const root = createRoot(playerGui)
		root.render(<HealthBar healthAtom={this.stateProvider.health} />)
	}
}
