import { Service, OnStart, Dependency } from "@flamework/core"
import { ReplicatedStorage, Workspace } from "@rbxts/services"
import { $assert } from "rbxts-transform-debug"
import { TrackService } from "./TrackService"
import { Components } from "@flamework/components"
import { Track } from "server/components/Track"

const mapFolder = ReplicatedStorage.Assets.Maps

@Service({})
export class MapService implements OnStart {
	private currentMap: PVInstance | undefined

	constructor(private trackService: TrackService) {}

	onStart() {}

	public loadMap(mapName: string) {
		const chosen = mapFolder.FindFirstChild(mapName)!
		const newMap = chosen.Clone()
		$assert(newMap.IsA("Model"), `Map "${newMap.Name}" is not a model`)

		newMap.Parent = Workspace.Map
		newMap.PivotTo(Workspace.Map.spawnPosition.GetPivot())
		this.currentMap = newMap
		this.trackService.setTrack(this.getFirstTrack())
		return newMap
	}

	private getFirstTrack() {
		const tracks = Dependency<Components>().getAllComponents<Track>()

		$assert(
			tracks.size() === 1,
			`${tracks.size()} track components exist. Amount should only be one.`
		)
		return tracks[0]
	}

	public loadRandomMap() {
		const chosen = mapFolder.GetChildren()[math.random(mapFolder.GetChildren().size()) - 1].Name
		return this.loadMap(chosen)
	}

	public unloadMap() {
		if (this.currentMap) {
			this.trackService.setTrack(undefined)
			this.currentMap.Destroy()
			this.currentMap = undefined
		}
	}
}
