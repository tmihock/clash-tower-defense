import { Controller, OnStart } from "@flamework/core"
import { Events } from "client/networking"
import { Players } from "@rbxts/services"
import React from "@rbxts/react"
import { createRoot, createPortal } from "@rbxts/react-roblox"
import { VitalsUI } from "./UI"
import { Vitals } from "shared/types"

const Player = Players.LocalPlayer
const PlayerGui =
	Player.FindFirstChildOfClass("PlayerGui") ?? (Player.WaitForChild("PlayerGui") as PlayerGui)

@Controller({})
export class VitalsController implements OnStart {
	private hunger = -1
	private thirst = -1
	private temperature = -1

	public getHunger(): number {
		return this.hunger
	}

	public getThirst(): number {
		return this.thirst
	}

	public getTemperature(): number {
		return this.temperature
	}

	onStart() {
		Events.updateVital.connect((vit, val) => this.onVitalUpdated(vit, val))

		const root = createRoot(new Instance("Folder"))

		root.render(
			createPortal(
				<VitalsUI 
					event={Events.updateVital} 
					initialHunger={this.hunger}
					initialThirst={this.thirst}
					initialTemperature={this.temperature}
				/>, 
				PlayerGui
			)
		)
	}

	private onVitalUpdated(vital: keyof Vitals, value: number) {
		switch (vital) {
			case "hunger":
				this.hunger = value
				break
			case "thirst":
				this.thirst = value
				break
			case "temperature":
				this.temperature = value
				break
		}
	}
}
