import { Controller, OnStart } from "@flamework/core"
import { Players, UserInputService } from "@rbxts/services"
import { $assert } from "rbxts-transform-debug"
import { $terrify } from "rbxts-transformer-t-new"
import { ItemName } from "shared/enum"
import { ItemData } from "./CItemInfo"
import { Events, Functions } from "client/networking"

const Player = Players.LocalPlayer
const validUseButtons = new Set<Enum.UserInputType>([
	Enum.UserInputType.MouseButton1,
	Enum.UserInputType.MouseButton2
])
const tToolName = $terrify<ItemName>()

const buttonToFunc = {
	[Enum.UserInputType.MouseButton1.Name]: "onM1",
	[Enum.UserInputType.MouseButton2.Name]: "onM2"
} as const

@Controller({})
export class ItemController implements OnStart {
	onStart() {
		this.handleToolUse()
	}

	private handleToolUse() {
		UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return

			if (validUseButtons.has(input.UserInputType) && this.isHoldingTool()) {
				const tool = this.getHeldTool()!
				const itemName = tool.Name
				$assert(tToolName(itemName), `bad tool name [${itemName}]`)

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
						serverInvoke.then(_ => itemInfo.onM1PostSuccess?.(tool)).catch(warn)
						break
				}
			}
		})
	}

	private isHoldingTool(): boolean {
		return this.getHeldTool() !== undefined
	}

	private getHeldTool(): Tool | undefined {
		return Player.Character?.FindFirstChildOfClass("Tool")
	}
}
