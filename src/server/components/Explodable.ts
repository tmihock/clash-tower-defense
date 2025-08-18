import { OnStart } from "@flamework/core"
import { Component, BaseComponent } from "@flamework/components"
import { TAG_EXPLODABLE } from "shared/constants"
import { InventoryService } from "server/services/InventoryService"
import { FolderWith } from "shared/types"
import { ReplicatedStorage } from "@rbxts/services"
import { $print } from "rbxts-transform-debug"
import { hideBasePart } from "shared/util/hidePart"
import { OnPlayerAdded } from "server/services/PlayerService"

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

const dynamiteModel = ReplicatedStorage.Assets.Dynamite

@Component({
	tag: TAG_EXPLODABLE,
	defaults: {
		exploded: false,
		regenTime: 2
	}
})
export class Explodable extends BaseComponent<Attributes, ExplodableInstance> implements OnStart {
	private dynamiteCount = 0
	private totalSlots: number

	private prompt: ProximityPrompt
	private emptySlots: BasePart[]
	private takenSlots: BasePart[] = []
	private placedDynamite: Instance[] = []

	constructor(private inventoryService: InventoryService) {
		super()
		this.prompt = this.instance.promptPart.ProximityPrompt
		this.prompt.ActionText = `Place dynamite`
		this.emptySlots = this.instance.slots.GetChildren()
		this.totalSlots = this.instance.slots.GetChildren().size()

		this.emptySlots.forEach(hideBasePart)
	}

	onStart() {
		this.prompt.Triggered.Connect(player => {
			if (this.attributes.exploded) return
			if (this.inventoryService.playerOwnsItem(player, "Dynamite")) {
				this.inventoryService.removeItem(player, "Dynamite")
				this.placeDynamite()
				if (this.dynamiteCount >= this.totalSlots) {
					this.startExplosion()
				}
			}
		})
	}

	private startExplosion() {
		$print("starting to explode")
		task.wait(5)
		$print("Explodedd")
		this.attributes.exploded = true
		this.instance
			.GetChildren()
			.filter(i => i.IsA("BasePart"))
			.forEach(basePart => {
				basePart.Transparency = 0.5
				basePart.CanCollide = false
			})

		task.wait(this.attributes.regenTime)
		$print("rebuilding")
		this.placedDynamite.forEach(instance => instance.Destroy())
		this.dynamiteCount = 0

		this.emptySlots = [...this.takenSlots]
		this.takenSlots.move(0, this.takenSlots.size(), 0, this.emptySlots)
		table.clear(this.takenSlots)
		/**
		 * 15 second timer wait for (display it)
		 * explode
		 * parts (cloned) go everywhere and show effect + sound
		 * parts cant collide
		 * parts wait regenTime / 2 then fade out transparency for regenTime / 4
		 * regenTime timer hit -> restore real parts,
		 */
	}

	private placeDynamite() {
		const chosenSlot = this.emptySlots.pop()
		assert(chosenSlot !== undefined, `Explodable.emptySlots is empty`)
		this.takenSlots.push(chosenSlot)
		const newDynamite = dynamiteModel.Clone()

		newDynamite.PivotTo(chosenSlot.GetPivot())
		newDynamite.Anchored = true
		newDynamite.CanCollide = false
		newDynamite.Parent = this.instance

		this.placedDynamite.push(newDynamite)
		this.dynamiteCount++
	}
}
