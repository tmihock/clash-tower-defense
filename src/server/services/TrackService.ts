import { Components } from "@flamework/components"
import { Service, OnStart, Dependency } from "@flamework/core"
import { $assert } from "rbxts-transform-debug"
import { Track } from "server/components/Track"
import { FolderWith } from "shared/types"

interface TrackInstance extends Instance {
	waypoints: FolderWith<BasePart>
	path: FolderWith<BasePart>
	enemies: Folder
}

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

	public getWaypoints(): Vector3[] {
		return this.getTrack().getWaypoints()
	}

	public getTrackLength(): number {
		return this.getTrack().getTrackLength()
	}

	public getTrack(): Track {
		if (this.track) return this.track
		const tracks = Dependency<Components>().getAllComponents<Track>()

		$assert(tracks.size() === 1, `${tracks.size()} track components exist. If amount is 0}`)
		this.track = tracks[0]
		return tracks[0]
	}
}
