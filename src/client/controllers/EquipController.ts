import { Controller, OnStart } from "@flamework/core"
import { Events } from "client/networking"
import { $assert } from "rbxts-transform-debug"
import { TowerName } from "shared/config/TowerConfig"
import { EquipBar } from "shared/networking"
import { Players } from "@rbxts/services"
import Signal from "@rbxts/lemon-signal"

const player = Players.LocalPlayer

@Controller({})
export class EquipController implements OnStart {
	public equipBarChanged = new Signal<(equipBar: EquipBar) => void>()

	private equipBar = [] as EquipBar

	onStart() {
		Events.setEquipBar.connect(e => this.setEquipBar(e, false))
		Events.updateEquipBar.connect((i, v) => this.updateEquipBar(i, v, false))
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
