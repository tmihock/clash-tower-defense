import { Controller, OnStart } from "@flamework/core"
import React from "@rbxts/react"
import { Players } from "@rbxts/services"
import { createPortal, createRoot, Root } from "@rbxts/react-roblox"
import { Events } from "client/networking"
import { RoleSelection } from "client/ui/RoleSelection"
import { ChoosableRole, Role } from "shared/types"

const Player = Players.LocalPlayer
const PlayerGui = Player.WaitForChild("PlayerGui") as PlayerGui

@Controller({})
export class RoleController implements OnStart {
	private root?: Root

	onStart() {
		this.showRoleSelection()
	}

	private showRoleSelection() {
		Events.startChoosing.fire()
		// Mount the UI
		this.root = createRoot(new Instance("Folder"))

		this.root.render(
			createPortal(<RoleSelection onChoose={(r) => this.chooseRole(r)}/>, PlayerGui)
		)
	}

	private chooseRole(role: ChoosableRole) {
		Events.chooseRole.fire(role)
		this.root?.unmount()
		this.root = undefined
	}
}
