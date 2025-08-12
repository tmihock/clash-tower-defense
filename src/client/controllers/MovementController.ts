import { Controller, OnStart } from "@flamework/core"
import Maid from "@rbxts/maid"
import { UserInputService, Players } from "@rbxts/services"
import { SPRINT_KEY } from "shared/constants"

export const MovementConfig = {
	DefaultWalkSpeed: 16,
	SprintSpeed: 24
}

const Player = Players.LocalPlayer

@Controller()
export class MovementController implements OnStart {
	private isSprinting = false
	private maid = new Maid()

	onStart() {
		Player.CharacterAdded.Connect(char => this.bindToCharacter(char))
		Player.CharacterRemoving.Connect(char => this.maid.DoCleaning())

		// If character already exists (e.g., on client restart)
		if (Player.Character) this.bindToCharacter(Player.Character)
	}

	private bindToCharacter(character: Model) {
		const humanoid = character.WaitForChild("Humanoid") as Humanoid

		// Listen for input
		this.maid.GiveTask(
			UserInputService.InputBegan.Connect((input, gpe) => {
				if (gpe) return
				if (input.KeyCode === SPRINT_KEY) {
					this.toggleSprint(true, humanoid)
				}
			})
		)

		this.maid.GiveTask(
			UserInputService.InputEnded.Connect((input, gpe) => {
				if (input.KeyCode === SPRINT_KEY) {
					this.toggleSprint(false, humanoid)
				}
			})
		)
	}

	private toggleSprint(status: boolean, humanoid: Humanoid) {
		if (this.isSprinting === status) return
		this.isSprinting = status

		humanoid.WalkSpeed = status ? MovementConfig.SprintSpeed : MovementConfig.DefaultWalkSpeed
	}
}
