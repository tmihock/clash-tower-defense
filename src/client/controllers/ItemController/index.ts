import { Controller, OnStart } from "@flamework/core"
import { Players, UserInputService } from "@rbxts/services"
import { $assert } from "rbxts-transform-debug"
import { $terrify } from "rbxts-transformer-t-new"
import { ItemName } from "shared/enum"
import { ItemData } from "./CItemInfo"
import { Functions } from "client/networking"

const Player = Players.LocalPlayer
const validUseButtons = new Set<Enum.UserInputType>([
	Enum.UserInputType.MouseButton1,
	Enum.UserInputType.MouseButton2
])
const tToolName = $terrify<ItemName>()

@Controller({})
export class ItemController implements OnStart {
	onStart() {
		this.handleToolUse()
		this.trackToolEquip()
	}

	private handleToolUse() {
		UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return

			if (validUseButtons.has(input.UserInputType) && this.isHoldingTool()) {
				const tool = this.getHeldTool()!
				const itemName = tool.Name as ItemName
				$assert(tToolName(itemName), `Bad tool name "${itemName}"`)

				const serverInvoke = Functions.useTool.invoke(tool, input.UserInputType).then().catch(warn)

				const itemInfo = ItemData[itemName]
				if (itemInfo === undefined) return

				switch (input.UserInputType) {
					case Enum.UserInputType.MouseButton1:
						itemInfo.onM1?.(tool)
						serverInvoke.then(_ => itemInfo.onM1PostSuccess?.(tool)).catch(warn)
						break
					case Enum.UserInputType.MouseButton2:
						itemInfo.onM2?.(tool)
						serverInvoke.then(_ => itemInfo.onM2PostSuccess?.(tool)).catch(warn)
						break
				}
			}
		})
	}

	private trackToolEquip() {
		const character = Player.Character || Player.CharacterAdded.Wait()[0]

		// When a tool is added to the character, treat that as equip
		character.ChildAdded.Connect(child => {
			if (child.IsA("Tool")) {
				const itemName = child.Name
				$assert(tToolName(itemName), `Bad tool name "${itemName}"`)
				ItemData[itemName]?.onEquip?.(child)
			}
		})

		// When a tool is removed from the character, treat that as unequip
		character.ChildRemoved.Connect(child => {
			if (child.IsA("Tool")) {
				const itemName = child.Name
				$assert(tToolName(itemName), `Bad tool name "${itemName}"`)
				ItemData[itemName]?.onUnequip?.(child)
			}
		})

		// If holding a tool at startup
		const heldTool = this.getHeldTool()
		if (heldTool) {
			const itemName = heldTool.Name
			$assert(tToolName(itemName), `Bad tool name "${itemName}"`)
			ItemData[itemName]?.onEquip?.(heldTool)
		}
	}

	private isHoldingTool(): boolean {
		return this.getHeldTool() !== undefined
	}

	private getHeldTool(): Tool | undefined {
		return Player.Character?.FindFirstChildOfClass("Tool")
	}
}
