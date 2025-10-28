import { Controller, OnStart } from "@flamework/core"
import {
	CollectionService,
	Players,
	RunService,
	UserInputService,
	Workspace
} from "@rbxts/services"
import { ATTR_OWNER, TOOLTIPS_ENABLED } from "shared/constants"
import { TowerName } from "shared/config/TowerConfig"
import { atom } from "@rbxts/charm"
import { createRoot } from "@rbxts/react-roblox"
import React from "@rbxts/react"
import { TAG_TOWER } from "shared/constants"
import { findFirstAncestorWithTag } from "shared/util/findFirstAncestorWithTag"
import { TooltipUI } from "client/ui/Tooltip"
import { ClientStateProvider } from "./ClientStateProvider"

const player = Players.LocalPlayer
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui
const camera = Workspace.CurrentCamera

@Controller({})
export class TooltipController implements OnStart {
	private isPlacing = false

	constructor(private stateProvider: ClientStateProvider) {}

	onStart() {
		if (TOOLTIPS_ENABLED) {
			this.enableTowerTooltips()
		}
	}

	private enableTowerTooltips() {
		const visible = atom(true)
		const mousePos = atom(new Vector2(0, 0))
		const hoveredTower = atom<TowerName>("None")
		const towerOwnerAtom = atom<string>()

		const root = createRoot(playerGui)

		root.render(
			<TooltipUI
				hoveredTower={hoveredTower}
				visibleAtom={visible}
				mousePosAtom={mousePos}
				ownerAtom={towerOwnerAtom}
			/>
		)

		RunService.RenderStepped.Connect(dt => {
			if (this.isPlacing) return

			const { X, Y } = UserInputService.GetMouseLocation()
			const { Origin, Direction } = camera!.ViewportPointToRay(X, Y)

			const rayParams = new RaycastParams()
			rayParams.FilterType = Enum.RaycastFilterType.Include
			rayParams.FilterDescendantsInstances = CollectionService.GetTagged(TAG_TOWER)

			const rayResult = Workspace.Raycast(Origin, Direction.mul(1000), rayParams)

			if (rayResult) {
				const tower = findFirstAncestorWithTag(rayResult.Instance, TAG_TOWER)
				visible(true)
				mousePos(new Vector2(X, Y))
				towerOwnerAtom(tower?.GetAttribute(ATTR_OWNER) as string)
				hoveredTower(tower ? (tower.Name as TowerName) : "None")
			} else {
				visible(false)
			}
		})
	}
}
