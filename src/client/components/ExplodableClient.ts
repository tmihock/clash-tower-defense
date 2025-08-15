import { OnStart } from "@flamework/core"
import { Component, BaseComponent } from "@flamework/components"
import { TAG_EXPLODABLE } from "shared/constants"
import { FolderWith } from "shared/types"
import { ReplicatedStorage } from "@rbxts/services"
import { $print } from "rbxts-transform-debug"
import { Events } from "client/networking"
import { InventoryController } from "client/controllers/InventoryController"

interface ExplodableInstance extends Instance {
	promptPart: BasePart & {
		ProximityPrompt: ProximityPrompt
	}
	slots: FolderWith<BasePart>
	// Children are baseparts
}

interface Attributes {
	exploded: boolean
	regenTime: number
}

@Component({
	tag: TAG_EXPLODABLE,
	defaults: {
		exploded: false,
		regenTime: 2
	}
})
export class Explodable extends BaseComponent<Attributes, ExplodableInstance> implements OnStart {
	private prompt: ProximityPrompt

	constructor(private inventoryController: InventoryController) {
		super()
		this.prompt = this.instance.promptPart.ProximityPrompt
		this.updatePromptVisibility()
		this.onAttributeChanged("exploded", () => this.updatePromptVisibility())
	}

	private updatePromptVisibility() {
		this.prompt.Enabled =
			this.inventoryController.playerHasItemOfName("Dynamite") && this.attributes.exploded === false
	}

	onStart() {
		Events.itemAdded.connect(() => this.updatePromptVisibility())
		Events.itemRemoved.connect(() => this.updatePromptVisibility())
	}
}
