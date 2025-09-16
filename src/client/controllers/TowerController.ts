import { Controller, Dependency, OnStart } from "@flamework/core"
import {
	Players,
	ReplicatedStorage,
	RunService,
	UserInputService,
	Workspace
} from "@rbxts/services"
import { Tower_C } from "client/classes/Tower_C"
import { Events, Functions } from "client/networking"
import { $assert } from "rbxts-transform-debug"
import { TowerName } from "shared/config/TowerConfig"
import { EnemyController } from "./EnemyController"
import { TargetMode } from "shared/networking"

const Player = Players.LocalPlayer
const Camera = Workspace.CurrentCamera
const towerFolder = ReplicatedStorage.Assets.Towers

@Controller({})
export class TowerController implements OnStart {
	private isPlacing = false
	private previewModel?: PVInstance
	private mouseStepped?: RBXScriptConnection
	private selectedTower: TowerName = "Barbarian"

	private towers = new Map<number, Tower_C>()

	constructor(private enemyController: EnemyController) {}

	onStart() {
		UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return
			if (input.KeyCode === Enum.KeyCode.E) {
				this.togglePlacingTower()
			}
			if (input.UserInputType === Enum.UserInputType.MouseButton1 && this.isPlacing) {
				this.confirmTowerPlacement()
			}
		})

		Events.towerPlaced.connect((i, p, t) => this.onTowerPlaced(i, p, t))
		Events.towerDeleted.connect(i => this.onTowerDeleted(i))
		Events.towerAttackedEnemy.connect((t, e) => this.onTowerAttackedEnemy(t, e))
		Events.setTowerTargetMode.connect((i, t) => this.onTowerTargetModeChanged(i, t))
	}

	private onTowerTargetModeChanged(id: number, mode: TargetMode) {
		const tower = this.towers.get(id)
		tower!.targetMode = mode
	}

	private onTowerPlaced(id: number, pos: Vector3, tower: TowerName) {
		const newTower = new Tower_C(id, pos, tower, this.enemyController)
		this.towers.set(id, newTower)
	}

	private onTowerDeleted(id: number) {
		this.towers.get(id)!.destroy()
		this.towers.delete(id)
	}

	private onTowerAttackedEnemy(towerId: number, enemyId: number) {
		const tower = this.towers.get(towerId)
		if (tower) {
			tower.damageDealt += tower.info.damage
		}
	}

	public stopPlacingTower() {
		this.isPlacing = false
		this.previewModel?.Destroy()
	}

	public startPlacingTower() {
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

	private confirmTowerPlacement() {
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

	public togglePlacingTower(): boolean
	public togglePlacingTower(toggle: boolean): boolean
	public togglePlacingTower(toggle?: boolean): boolean {
		if (toggle === undefined) {
			toggle = !this.isPlacing
		}
		if (this.isPlacing) {
			this.stopPlacingTower()
		} else {
			this.startPlacingTower()
		}
		return this.isPlacing
	}
}

function makePartPreview(part: BasePart) {
	part.Transparency = 0.5
	part.CanCollide = false
	part.CanQuery = false
}
