import { OnStart } from "@flamework/core"
import { Component, BaseComponent } from "@flamework/components"
import { TAG_TRACK } from "shared/constants"
import { RunService, Workspace } from "@rbxts/services"
import { FolderWith } from "shared/types"
import { GameService } from "server/services/GameService"
import { Tower } from "./Tower"
import { $print } from "rbxts-transform-debug"
import { Enemy } from "server/classes/Enemy"
import { EnemyService } from "server/services/EnemyService"

type NumberString = `${number}`

export interface TrackInstance extends Instance {
	waypoints: FolderWith<BasePart>
	path: FolderWith<BasePart>
	enemies: Folder
}

interface Attributes {}

@Component({
	tag: TAG_TRACK,
	ancestorWhitelist: [Workspace]
})
export class Track extends BaseComponent<Attributes, TrackInstance> implements OnStart {
	private trackLength: number
	private waypoints = new Array<Vector3>()

	constructor() {
		super()

		this.waypoints = this.instance.waypoints
			.GetChildren()
			.sort((a, b) => tonumber(a.Name)! < tonumber(b.Name)!)
			.map(i => i.Position)

		let total = 0
		for (let i = 0; i < this.waypoints.size() - 1; i++) {
			total += this.waypoints[i + 1].sub(this.waypoints[i]).Magnitude
		}
		this.trackLength = total
	}

	public getWaypoints(): Vector3[] {
		return this.waypoints
	}

	public getTrackLength(): number {
		return this.trackLength
	}

	onStart() {}

	public addTower(tower: Tower) {}
}
