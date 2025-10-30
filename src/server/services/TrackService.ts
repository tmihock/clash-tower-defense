import { Service, OnStart } from "@flamework/core"
import { Track } from "server/components/Track"

@Service({})
export class TrackService implements OnStart {
	private track: Track | undefined

	constructor() {}

	onStart() {}

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

	public setTrack(track?: Track) {
		this.track = track
	}

	public getWaypoints(): Vector3[] {
		return this.getTrack()!.getWaypoints()
	}

	public getTrackLength(): number {
		return this.getTrack()!.getTrackLength()
	}

	public getTrack(): Track {
		if (!this.track) this.track = Dependency<Components>().getAllComponents<Track>()[0]
		$assert(this.track, "No Track component found!")
		return this.track
	}
}
