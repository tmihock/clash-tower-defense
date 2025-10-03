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
	public equipBarChanged = new Signal<(equipBar: EquipBar) => void>()

	private unlockedInventoryAtom = atom<Set<TowerName>>(new Set())
	private inventoryOpenAtom = atom(false)

	private root?: ReactRoblox.Root

	// Doesn't properly render inital bar, all start as empty
	private equipBar = atom(["None", "None", "None", "None"]) as Atom<EquipBar>

	constructor(
		private towerController: TowerController,
		private stateProvider: ClientStateProvider
	) {
		this.unlockedInventoryAtom = stateProvider.unlockedInventory
	}

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
			/// FIX: this.equipBar not changing
			const numberKey = towerKeys[input.KeyCode.Name] // 1-4
			if (numberKey) {
				const currentTower = this.equipBar()[numberKey - 1]
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
				inventoryAtom={this.unlockedInventoryAtom}
				equipBarProps={{
					selectedAtom: this.stateProvider.selectedTower,
					initial: this.getEquipBar(),
					onClick: (i, t) => this.onEquipSlotClicked(i, t)
				}}
			/>
		)
	}

	public updateEquipBar(index: number, value: TowerName, tellServer: boolean = true) {
		$assert(index >= 0 && index <= 4, `Attempt to edit ${index}th item of EquipBar.`)
		this.equipBar(prev => {
			const newBar = [...prev]
			newBar[index] = value
			return newBar
		})
		this.equipBarChanged.Fire(this.equipBar())
		if (tellServer) {
			Events.updateEquipBar.fire(index, value)
		}
	}

	private setEquipBar(equipBar: EquipBar, tellServer: boolean = true) {
		this.equipBar(equipBar)
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
