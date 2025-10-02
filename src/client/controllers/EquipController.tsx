import { Controller, OnStart } from "@flamework/core"
import { Events } from "client/networking"
import { $assert } from "rbxts-transform-debug"
import { TowerName } from "shared/config/TowerConfig"
import { EquipBar } from "shared/networking"
import { Players, UserInputService } from "@rbxts/services"
import Signal from "@rbxts/lemon-signal"
import { createPortal, createRoot } from "@rbxts/react-roblox"
import React from "@rbxts/react"
import { EquipBarUI } from "client/ui/Inventory/EquipBar"
import { TowerController } from "./TowerController"
import { Inventory } from "client/ui/Inventory"
import { atom } from "@rbxts/charm"

const player = Players.LocalPlayer
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui

const towerKeys = {
	One: 1,
	Two: 2,
	Three: 3,
	Four: 4
} as Record<Enum.KeyCode["Name"], number>

@Controller({})
export class EquipController implements OnStart {
	public equipBarChanged = new Signal<(equipBar: EquipBar) => void>()

	private unlockedInventoryAtom = atom<Set<TowerName>>(new Set())
	private inventoryOpenAtom = atom(false)

	private root: ReactRoblox.Root | undefined
	private equipBar = ["Barbarian", "None", "None", "None"] as EquipBar

	constructor(private towerController: TowerController) {}

	onStart() {
		Events.setUnlockedInventory.connect(inventory => {
			this.unlockedInventoryAtom(new Set(inventory))
		})
		Events.addToUnlockedInventory.connect(tower => {
			this.unlockedInventoryAtom(prev => {
				const newSet = new Set([...prev])
				newSet.add(tower)
				return newSet
			})
		})
		Events.removeFromUnlockedInventory.connect(tower => {
			this.unlockedInventoryAtom(prev => {
				const newSet = new Set([...prev])
				newSet.delete(tower)
				return newSet
			})
		})

		Events.setEquipBar.connect(e => this.setEquipBar(e, false))
		Events.updateEquipBar.connect((i, v) => this.updateEquipBar(i, v, false))
		this.mountUI()
		UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return
			// if (input.KeyCode === Enum.KeyCode.E) {
			// 	this.togglePlacingTower()
			// }
			const numberKey = towerKeys[input.KeyCode.Name] // 1-4
			if (numberKey) {
				const currentTower = this.equipBar[numberKey - 1]
				this.towerController.togglePlacingTower(currentTower)
			}
		})
	}

	private onEquipSlotClicked(index: number, tower: TowerName) {
		this.towerController.togglePlacingTower(tower)
	}

	private mountUI() {
		this.root = createRoot(new Instance("Folder"))

		this.root.render(
			createPortal(
				<Inventory
					visibleAtom={this.inventoryOpenAtom}
					inventoryAtom={this.unlockedInventoryAtom}
					equipBarProps={{
						selectedAtom: this.towerController.selectedTower,
						initial: this.getEquipBar(),
						onClick: (i, t) => this.onEquipSlotClicked(i, t)
					}}
				/>,
				playerGui
			)
		)
	}

	public updateEquipBar(index: number, value: TowerName, tellServer: boolean = true) {
		$assert(index >= 0 && index <= 4, `Attempt to edit ${index}th item of EquipBar.`)
		this.getEquipBar()![index] = value
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

	public getEquipBar() {
		const equipBar = this.equipBar
		$assert(
			equipBar,
			`Attempt to get Player "${player.Name}"'s equip bar before their data has loaded.`
		)
		return equipBar
	}
}
