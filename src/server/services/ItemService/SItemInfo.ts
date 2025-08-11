import { Dependency } from "@flamework/core"
import { $print } from "rbxts-transform-debug"
import { ItemName } from "shared/enum"
import { $terrify } from "rbxts-transformer-t-new"
import { Players, Workspace } from "@rbxts/services"

export interface ItemInfo<R = void> {
	onM1?(player: Player, tool: Tool): R
	onM2?(player: Player, tool: Tool): R
}

export const ItemData = {
	Pencil: {
		onM1(player, tool) {
			const character = player.Character
			if (!character) return false

			const humanoid = character.FindFirstChildOfClass("Humanoid") as Humanoid
			if (!humanoid || humanoid.Health <= 0) return false

			// Get the position where the player is looking
			const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart
			if (!rootPart) return false

			// Create a raycast to detect players in front of the attacker
			const raycastParams = new RaycastParams()
			raycastParams.FilterType = Enum.RaycastFilterType.Blacklist
			raycastParams.FilterDescendantsInstances = [character]

			const direction = rootPart.CFrame.LookVector
			const origin = rootPart.Position
			const raycastResult = Workspace.Raycast(origin, direction.mul(10), raycastParams)

			if (raycastResult) {
				const hitPart = raycastResult.Instance
				const hitCharacter = hitPart.FindFirstAncestorOfClass("Model")

				if (hitCharacter && hitCharacter !== character) {
					const hitHumanoid = hitCharacter.FindFirstChildOfClass("Humanoid") as Humanoid
					if (hitHumanoid && hitHumanoid.Health > 0) {
						// Deal damage to the hit player
						hitHumanoid.Health = math.max(0, hitHumanoid.Health - 25)
						$print(`Pencil attack hit ${hitCharacter.Name} for 25 damage`)
						return true
					}
				}
			}

			$print("Pencil attack missed")
			return true
		}
	}
} satisfies Record<ItemName, ItemInfo<any>>
