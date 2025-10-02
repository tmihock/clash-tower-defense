import { Controller, OnStart } from "@flamework/core"
import { Events } from "client/networking"
import { Players } from "@rbxts/services"
import React from "@rbxts/react"
import { createRoot, createPortal } from "@rbxts/react-roblox"
import { atom } from "@rbxts/charm"
import { MAX_HEALTH } from "shared/constants"
import { HealthBar } from "client/ui/HealthBar"

const Player = Players.LocalPlayer
const PlayerGui =
	Player.FindFirstChildOfClass("PlayerGui") ?? (Player.WaitForChild("PlayerGui") as PlayerGui)

@Controller({})
export class HungerController implements OnStart {
	private health = MAX_HEALTH

	public getHealth(): number {
		return this.health
	}

	onStart() {
		Events.healthChanged.connect(v => this.onHealthUpdated(v))

		const root = createRoot(new Instance("Folder"))

		root.render(createPortal(<HealthBar initialHealth={this.health} />, PlayerGui))
	}

	private onHealthUpdated(value: number) {
		this.health = value
	}
}
