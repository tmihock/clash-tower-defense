import { Service, OnStart, Dependency } from "@flamework/core"
import { TowerConfig, TowerName } from "shared/config/TowerConfig"
import { ReplicatedStorage } from "@rbxts/services"
import { Components } from "@flamework/components"
import { Track } from "server/components/Track"
import { Tower } from "server/components/Tower"

const towerFolder = ReplicatedStorage.Assets.TowerFolder as never as Folder & {
	[K in TowerName]: Model
}

@Service({})
export class TowerService implements OnStart {
	onStart() {}

	public spawnTower(track: Track, pos: Vector3, tower: TowerName) {
		const Components = Dependency<Components>()

		const newTower = towerFolder[tower]!.Clone()
		newTower.PivotTo(new CFrame(pos))
		newTower.Parent = track.instance.towers

		const towerComponent = Components.getComponent<Tower>(newTower)
		assert(towerComponent, `Component for "${newTower.GetFullName()}" not found.`)

		track.addTower(towerComponent)
	}
}
