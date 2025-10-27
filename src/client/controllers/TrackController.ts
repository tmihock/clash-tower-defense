import { Controller, OnInit, OnStart } from "@flamework/core"
import { CollectionService } from "@rbxts/services"
import { TAG_TRACK } from "shared/constants"
import type { TrackInstance } from "server/components/Track"

@Controller({})
export class TrackController implements OnInit, OnStart {
	private waypoints = [] as Vector3[]
	private trackLength: number = -1
	private trackInstance: TrackInstance = undefined as never as TrackInstance

	onInit() {
		/**
		 * Change to wait for all waypoints to load in
		 */
		task.wait(1)
	}

	onStart() {
		const trackInstance = CollectionService.GetTagged(TAG_TRACK)[0] as TrackInstance

		this.waypoints = trackInstance.waypoints
			.GetChildren()
			.sort((a, b) => tonumber(a.Name)! < tonumber(b.Name)!)
			.map(i => i.Position)

		let total = 0
		for (let i = 0; i < this.waypoints.size() - 1; i++) {
			total += this.waypoints[i + 1].sub(this.waypoints[i]).Magnitude
		}
		this.trackLength = total
		this.trackInstance = trackInstance
	}

	public getWaypoints(): Vector3[] {
		return this.waypoints
	}

	public getTrack(): TrackInstance {
		return this.trackInstance
	}

	public getTrackLength(): number {
		return this.trackLength
	}

	public getPositionOnTrack(speed: number, t: number): Vector3 {
		const d = speed * t // total distance traveled

		let distAccum = 0
		for (let i = 0; i < this.waypoints.size() - 1; i++) {
			const a = this.waypoints[i] // current
			const b = this.waypoints[i + 1] // next
			const L = b.sub(a).Magnitude // length

			if (d <= distAccum + L) {
				const segDist = d - distAccum
				const alpha = segDist / L
				return a.Lerp(b, alpha)
			}

			distAccum += L
		}

		// Clamp to the last waypoint if we've passed the end
		return this.waypoints[this.waypoints.size() - 1]
	}
}
