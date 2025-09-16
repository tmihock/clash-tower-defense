import { EnemyConfig, EnemyInfo, EnemyName } from "shared/config/EnemyConfig"
import { ReplicatedStorage, RunService, Workspace } from "@rbxts/services"
import { TrackController } from "client/controllers/TrackController"
import { Dependency } from "@flamework/core"
import { $print } from "rbxts-transform-debug"

const enemyFolder = ReplicatedStorage.Assets.Enemies

export class Enemy {
	private health: number
	private info: EnemyInfo
	private instance: PVInstance
	private trackController: TrackController
	private timeSpawned = os.clock()

	constructor(enemyName: EnemyName) {
		this.info = EnemyConfig[enemyName]
		this.health = this.info.health

		this.instance = enemyFolder[enemyName].Clone()
		this.instance.Parent = Workspace.Enemies

		this.trackController = Dependency<TrackController>()

		this.startTravel()
	}

	private startTravel() {
		RunService.RenderStepped.Connect(dt => {
			const { speed } = this.info
			const elapsed = os.clock() - this.timeSpawned
			const pos = this.trackController.getPositionOnTrack(speed, elapsed)

			// Approximate movement direction using a small time step
			const futurePos = this.trackController.getPositionOnTrack(speed, elapsed + dt)

			const dir = futurePos.sub(pos)

			this.moveTo(pos, dir)
		})
	}

	private moveTo(pos: Vector3, lookDir?: Vector3) {
		if (!lookDir || lookDir.Magnitude <= 0) {
			this.instance.PivotTo(new CFrame(pos))
			return
		}

		// Current orientation
		const current = this.instance.GetPivot()

		// Target orientation (facing movement direction)
		const target = CFrame.lookAt(pos, pos.add(lookDir.Unit))

		// Adjust the alpha to control turn speed (closer to 1 = faster snap)
		const alpha = 0.1

		const smoothed = current.Lerp(target, alpha)
		this.instance.PivotTo(smoothed)
	}

	public setHealth(value: number) {
		this.health = value
	}

	public destroy() {
		this.instance.Destroy()
	}
}
