import { Controller, Dependency, OnStart } from "@flamework/core"
import {
	Players,
	ReplicatedStorage,
	RunService,
	UserInputService,
	Workspace
} from "@rbxts/services"
import { Functions } from "client/networking"
import { $assert } from "rbxts-transform-debug"
import { TowerName } from "shared/config/TowerConfig"

const Player = Players.LocalPlayer
const Camera = Workspace.CurrentCamera
const towerFolder = ReplicatedStorage.Assets.Towers

@Controller({})
export class TowerController implements OnStart {
	private isPlacing = false
	private previewModel?: PVInstance
	private mouseStepped?: RBXScriptConnection
	private selectedTower: TowerName = "Barbarian"

	onStart() {
		UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return
			if (input.KeyCode === Enum.KeyCode.E) {
				this.togglePlacing()
			}
			if (input.UserInputType === Enum.UserInputType.MouseButton1 && this.isPlacing) {
				this.confirmPlacement()
			}
		})
	}

	public stopPlacing() {
		this.isPlacing = false
		this.previewModel?.Destroy()
	}

	public startPlacing() {
		$assert(!this.isPlacing, "Player is already placing")
		this.isPlacing = true

		const preview = towerFolder[this.selectedTower].Clone()
		this.previewModel = preview
		preview.Parent = Workspace

		preview
			.GetDescendants()
			.filter(i => i.IsA("BasePart"))
			.forEach(makePartPreview)

		this.mouseStepped = RunService.RenderStepped.Connect(dt => {
			const pos = this.mouseToTowerPos()
			if (pos) {
				preview.MoveTo(pos)
			}
		})
	}

	private confirmPlacement() {
		$assert(this.isPlacing)
		const placementPos = this.mouseToTowerPos()
		$assert(placementPos, `this.mouseToTowerPos(${this.selectedTower}) returned undefined`)

		const clone = this.previewModel?.Clone()

		Functions.placeTower.invoke(placementPos, this.selectedTower).then(wasPlaced => {
			if (wasPlaced) {
				clone?.Destroy()
			} else {
				// Failed, make clone red then destroy or seomthing
				clone?.Destroy()
			}
		})
	}

	private mouseToTowerPos(): Vector3 | undefined {
		const { X, Y } = UserInputService.GetMouseLocation()
		const { Origin, Direction } = Camera!.ViewportPointToRay(X, Y)

		const rayParams = new RaycastParams()
		rayParams.FilterType = Enum.RaycastFilterType.Exclude
		rayParams.FilterDescendantsInstances = [Workspace.Preview, Workspace.Live, Workspace.Towers]

		const rayResult = Workspace.Raycast(Origin, Direction.mul(1000), rayParams)

		if (rayResult) {
			const { X, Z } = rayResult.Position
			const Y = rayResult.Position.Y + towerFolder[this.selectedTower].hitbox.Size.Y / 2

			return new Vector3(X, Y, Z)
		}
	}

	public togglePlacing(): boolean
	public togglePlacing(toggle: boolean): boolean
	public togglePlacing(toggle?: boolean): boolean {
		if (toggle === undefined) {
			toggle = !this.isPlacing
		}
		if (this.isPlacing) {
			this.stopPlacing()
		} else {
			this.startPlacing()
		}
		return this.isPlacing
	}
}

function makePartPreview(part: BasePart) {
	part.Transparency = 0.5
	part.CanCollide = false
	part.CanQuery = false
}
