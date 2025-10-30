import { Components } from "@flamework/components"
import { Service, Dependency } from "@flamework/core"
import { $assert } from "rbxts-transform-debug"
import { Track } from "server/components/Track"

@Service({})
export class TrackService {
	private track: Track | undefined

	public getPositionOnPath(waypoints: Vector3[], speed: number, t: number): Vector3 {
		const d = speed * t // total distance traveled

		let distAccum = 0
		for (let i = 0; i < waypoints.size() - 1; i++) {
			const a = waypoints[i] // current
			const b = waypoints[i + 1] // next
			const L = b.sub(a).Magnitude // length

			if (d <= distAccum + L) {
				const segDist = d - distAccum
				const alpha = segDist / L
				return a.Lerp(b, alpha)
			}

			distAccum += L
		}

		// Clamp to the last waypoint if we've passed the end
		return waypoints[waypoints.size() - 1]
	}

	public getWaypoints(): Vector3[] {
		return this.getTrack().getWaypoints()
	}

	public getTrackLength(): number {
		return this.getTrack().getTrackLength()
	}

	public getTrack(): Track {
		if (!this.track) this.track = Dependency<Components>().getAllComponents<Track>()[0]
		$assert(this.track, "No Track component found!")
		return this.track
	}
}
