import { Controller, OnStart } from "@flamework/core"
import { Events } from "client/networking"
import { $assert } from "rbxts-transform-debug"
import { TowerName } from "shared/config/TowerConfig"
import { EquipBar } from "shared/networking"
import { Players, UserInputService } from "@rbxts/services"
import Signal from "@rbxts/lemon-signal"
import { createPortal, createRoot } from "@rbxts/react-roblox"
import React from "@rbxts/react"
import { TowerController } from "./TowerController"
import { Inventory } from "client/ui/Inventory"
import { Atom, atom } from "@rbxts/charm"
import { ClientStateProvider } from "./ClientStateProvider"

const player = Players.LocalPlayer
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui

const towerKeys = {
	One: 1,
	Two: 2,
	Three: 3,
	Four: 4
} as Record<Enum.KeyCode["Name"], number>

@Controller({})
export class InventoryController implements OnStart {
	private inventoryOpenAtom = atom(false)

	private root?: ReactRoblox.Root

	constructor(
		private towerController: TowerController,
		private stateProvider: ClientStateProvider
	) {}

	onStart() {
		this.mountUI()
		UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return
			/// FIX: this.equipBar not changing
			const numberKey = towerKeys[input.KeyCode.Name] // 1-4
			if (numberKey) {
				const currentTower = this.stateProvider.playerState.equipped()[numberKey - 1]
				this.towerController.togglePlacingTower(currentTower)
			}
			if (input.KeyCode === Enum.KeyCode.E) {
				this.toggleInventory()
			}
		})
	}

	private onEquipSlotClicked(index: number, tower: TowerName) {
		this.towerController.togglePlacingTower(tower)
	}

	private toggleInventory(value?: boolean) {
		if (value === undefined) {
			this.inventoryOpenAtom(v => !v)
		} else {
			this.inventoryOpenAtom(value)
		}
	}

	private mountUI() {
		this.root = createRoot(playerGui)
		this.root.render(
			<Inventory
				visibleAtom={this.inventoryOpenAtom}
				inventoryAtom={this.stateProvider.playerState.unlockedTowers}
				equipBarProps={{
					selectedAtom: this.stateProvider.selectedTower,
					initial: this.stateProvider.playerState.equipped,
					onClick: (i, t) => this.onEquipSlotClicked(i, t)
				}}
			/>
		)
	}

	// Updates on client, tells server
	public updateEquipBar(index: number, value: TowerName) {
		$assert(index >= 0 && index <= 4, `Attempt to edit ${index}th item of EquipBar.`)
		this.stateProvider.playerState.equipped(prev => [...prev, value])
		Events.updateEquipBar.fire(index, value)
	}

	private setEquipBar(equipBar: EquipBar) {
		this.stateProvider.playerState.equipped(equipBar)
		Events.setEquipBar.fire(equipBar)
	}

	public getEquipBar() {
		const equipBar = this.stateProvider.playerState.equipped()
		$assert(
			equipBar,
			`Attempt to get Player "${player.Name}"'s equip bar before their data has loaded.`
		)
		return equipBar
	}
}
