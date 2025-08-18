import { OnStart } from "@flamework/core"
import { Component, BaseComponent } from "@flamework/components"
import { TAG_HIT_DETECTOR } from "shared/constants"
import { HitDetectorInfo } from "server/config/HitDetector"
import { Players } from "@rbxts/services"

export interface HitDetectorInstance extends Instance {
	hitPart: BasePart
}

interface Attributes {}

@Component({
	tag: TAG_HIT_DETECTOR
})
export class HitDetector extends BaseComponent<Attributes, HitDetectorInstance> implements OnStart {
	private info: HitDetectorInfo
	private lastTouch = 0

	constructor() {
		super()
		assert(
			this.instance.Name in HitDetectorInfo,
			`[HitDetector] "${this.instance.Name}" not found in Config`
		)
		this.info = HitDetectorInfo[this.instance.Name as keyof typeof HitDetectorInfo]
	}

	private onTouch(hit: BasePart) {
		const player = Players.GetPlayerFromCharacter(hit.Parent)
		if (player && os.clock() - this.lastTouch >= this.info.cooldown) {
			this.lastTouch = os.clock()
			this.info.callback(player, this.instance)
		}
	}

	onStart() {
		this.instance.hitPart.Touched.Connect(hit => this.onTouch(hit))
	}
}
