/**
 * Keys are names of Pressure Plate Instance
 * callback
 */

import { Flamework } from "@flamework/core"
import { $assert, $print } from "rbxts-transform-debug"
import { HitDetector, HitDetectorInstance } from "server/components/HitDetector"

export type HitDetectorCallback = (player: Player, obj: HitDetectorInstance) => void

export interface HitDetectorInfo {
	cooldown: number
	callback: HitDetectorCallback
}

interface ShotgunTrapInstance extends HitDetectorInstance {
	shotgun: BasePart
}

const tHasShotgun = Flamework.createGuard<ShotgunTrapInstance>()

export const HitDetectorInfo = {
	shotgun: {
		cooldown: 4,
		callback: (player: Player, obj: HitDetectorInstance) => {
			$assert(tHasShotgun(obj), `Component "${obj.GetFullName()} does not match instance type`)
			$print("shot the gun", player.GetFullName())
			/**
			 * shoot thing
			 */
		}
	}
} satisfies Record<string, HitDetectorInfo>
