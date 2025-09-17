import { Controller, OnStart } from "@flamework/core"
import { Events } from "client/networking"
import { $assert } from "rbxts-transform-debug"
import { TowerName } from "shared/config/TowerConfig"
import { EquipBar } from "shared/networking"
import { Players } from "@rbxts/services"
import Signal from "@rbxts/lemon-signal"
import { createPortal, createRoot } from "@rbxts/react-roblox"
import { EquipBarUI } from "client/ui/EquipBar"
import React from "react-roblox"
import { TowerController } from "./TowerController"

const player = Players.LocalPlayer
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui

@Controller({})
export class EquipController implements OnStart {
	public equipBarChanged = new Signal<(equipBar: EquipBar) => void>()

	private root: ReactRoblox.Root | undefined
	private equipBar = ["None", "None", "None", "None"] as EquipBar

	constructor(private towerController: TowerController) {}

	onStart() {
		Events.setEquipBar.connect(e => this.setEquipBar(e, false))
		Events.updateEquipBar.connect((i, v) => this.updateEquipBar(i, v, false))
		this.mountUI()
	}

	
		private onEquipSlotClicked(index: number, tower: TowerName) {
			this.towerController.togglePlacingTower(tower)
		}
		
	private mountUI() {
		this.root = createRoot(new Instance("Folder"))

		this.root.render(
			createPortal(<EquipBarUI initial={this.equipBar }onClick={(i, t) => this.onEquipSlotClicked(i,t)}/>, playerGui)
		)
	}

	public updateEquipBar(index: number, value: TowerName, tellServer: boolean = true) {
		$assert(index >= 0 && index <= 4, `Attempt to edit ${index}th item of EquipBar.`)
		this.getEquipBar(player)![index] = value
		this.equipBarChanged.Fire(this.equipBar)
		if (tellServer) {
			Events.updateEquipBar.fire(index, value)
		}
	}

	private setEquipBar(equipBar: EquipBar, tellServer: boolean = true) {
		this.equipBar = equipBar
		this.equipBarChanged.Fire(equipBar)
		if (tellServer) {
			Events.setEquipBar.fire(equipBar)
		}
	}

	public getEquipBar(player: Player) {
		const equipBar = this.equipBar
		$assert(
			equipBar,
			`Attempt to get Player "${player.Name}"'s equip bar before their data has loaded.`
		)
		return equipBar
	}
}
