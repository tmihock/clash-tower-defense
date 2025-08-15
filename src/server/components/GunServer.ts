import { Component } from "@flamework/components"
import { OnStart } from "@flamework/core"
import { Action } from "@rbxts/shared-components-flamework"
import { GunShared } from "shared/components/GunShared"
import { TAG_GUN } from "shared/constants"

@Component({ tag: TAG_GUN })
export class GunServer extends GunShared implements OnStart {
	override onStart() {
		task.spawn(() => {
			while (task.wait(3)) {
				this.Increment()
			}
		})
	}

	@Action() // State modifier
	private Increment() {
		return {
			...this.state,
			ammo: this.state.ammo - 1
		}
	}
}
