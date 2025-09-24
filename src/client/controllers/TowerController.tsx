import { Controller, OnStart } from "@flamework/core"
import {
	CollectionService,
	Players,
	ReplicatedStorage,
	RunService,
	UserInputService,
	Workspace
} from "@rbxts/services"
import { Tower_C } from "client/classes/Tower_C"
import { Events, Functions } from "client/networking"
import { $assert, $print } from "rbxts-transform-debug"
import { TowerName } from "shared/config/TowerConfig"
import { EnemyController } from "./EnemyController"
import { TargetMode } from "shared/networking"
import { atom } from "@rbxts/charm"
import { createPortal, createRoot } from "@rbxts/react-roblox"
import React from "@rbxts/react"
import { TAG_TOWER } from "shared/constants"
import { findFirstAncestorWithTag } from "shared/util/findFirstAncestorWithTag"
import { TooltipUI } from "client/ui/Tooltip"
import { TrackController } from "./TrackController"

const player = Players.LocalPlayer
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui
const camera = Workspace.CurrentCamera
const towerFolder = ReplicatedStorage.Assets.Towers

@Controller({})
export class TowerController implements OnStart {
	private isPlacing = false
	private previewModel?: PVInstance
	private mouseStepped?: RBXScriptConnection
	public selectedTower = atom<TowerName>("None")

	private towers = new Map<number, Tower_C>()
	private tooltipsEnabled = true

	constructor(
		private enemyController: EnemyController,
		private trackController: TrackController
	) {}

	onStart() {
		UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return
			// if (input.KeyCode === Enum.KeyCode.E) {
			// 	this.togglePlacingTower()
			// }

			if (input.KeyCode)
				if (input.UserInputType === Enum.UserInputType.MouseButton1 && this.isPlacing) {
					this.confirmTowerPlacement()
				}
		})

		Events.towerPlaced.connect((i, p, t) => this.onTowerPlaced(i, p, t))
		Events.towerDeleted.connect(i => this.onTowerDeleted(i))
		Events.towerAttackedEnemy.connect((t, e) => this.onTowerAttackedEnemy(t, e))
		Events.setTowerTargetMode.connect((i, t) => this.onTowerTargetModeChanged(i, t))

		this.enableTowerTooltips()
	}

	private enableTowerTooltips() {
		const visible = atom(true)
		const mousePos = atom(new Vector2(0, 0))
		const hoveredTower = atom<TowerName>("None")

		const root = createRoot(new Instance("Folder"))

		root.render(
			createPortal(
				<TooltipUI hoveredTower={hoveredTower} visibleAtom={visible} mousePosAtom={mousePos} />,
				playerGui
			)
		)

		RunService.RenderStepped.Connect(dt => {
			if (!this.tooltipsEnabled) return
			if (this.isPlacing) return

			const { X, Y } = UserInputService.GetMouseLocation()
			const { Origin, Direction } = camera!.ViewportPointToRay(X, Y)

			const rayParams = new RaycastParams()
			rayParams.FilterType = Enum.RaycastFilterType.Include
			rayParams.FilterDescendantsInstances = CollectionService.GetTagged(TAG_TOWER)

			const rayResult = Workspace.Raycast(Origin, Direction.mul(1000), rayParams)

			if (rayResult) {
				const tower = findFirstAncestorWithTag(rayResult.Instance, TAG_TOWER)
				visible(true)
				mousePos(new Vector2(X, Y))
				hoveredTower(tower ? (tower.Name as TowerName) : "None")
			} else {
				visible(false)
			}
		})
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
		this.selectedTower("None")
		this.mouseStepped?.Disconnect()
		this.previewModel?.Destroy()
	}

	public startPlacingTower(tower: TowerName) {
		if (this.isPlacing) this.stopPlacingTower()
		if (tower === "None") return
		this.selectedTower(tower)
		this.isPlacing = true

		const preview = towerFolder[tower].Clone()
		this.previewModel = preview
		preview.Parent = Workspace.Preview

		preview
			.GetDescendants()
			.filter(i => i.IsA("BasePart"))
			.forEach(makePartPreview)

		// Create cylinder (shadow) under tower based on hitbox size
		const previewHitbox = preview.hitbox
		previewHitbox.Transparency = 0.5

		this.mouseStepped = RunService.RenderStepped.Connect(dt => {
			const pos = this.mouseToTowerPos(tower)
			if (pos) {
				if (this.canPlace()) {
					previewHitbox.Color = new Color3(0, 1, 0)
				} else {
					previewHitbox.Color = new Color3(1, 0, 0)
				}
				preview.MoveTo(pos)
			}
		})
	}

	private canPlace(): boolean {
		const mousePos = this.mouseToTowerPos(this.selectedTower())
		return (
			mousePos !== undefined && this.posNotOnTrackOrTower(mousePos) && this.isPlacing // && Tower doesn't hit track
		)
	}

	private posNotOnTrackOrTower(pos: Vector3): boolean {
		return this.posNotOnTower(pos) && this.posNotOnTrack(pos)
	}

	private posNotOnTrack(pos: Vector3): boolean {
		const path = this.trackController.getTrack().path.GetChildren()
		const tower = this.selectedTower()

		const radius = towerFolder[tower].hitbox.Size.Y / 2

		for (const part of path) {
			const halfSizeX = part.Size.X / 2
			const halfSizeZ = part.Size.Z / 2

			const minX = part.Position.X - halfSizeX
			const maxX = part.Position.X + halfSizeX

			const minZ = part.Position.Z - halfSizeZ
			const maxZ = part.Position.Z + halfSizeZ

			const closestX = math.clamp(pos.X, minX, maxX)
			const closestZ = math.clamp(pos.Z, minZ, maxZ)

			const dx = pos.X - closestX
			const dz = pos.Z - closestZ

			if (dx * dx + dz * dz < radius * radius) {
				return false
			}
		}

		return true
	}

	private posNotOnTower(pos: Vector3): boolean {
		const tower = this.selectedTower()

		const radius = towerFolder[tower].hitbox.Size.Y / 2

		const towerHitboxes = Workspace.Towers.GetChildren()
			.map(t => t.FindFirstChild("hitbox")!)
			.filter(t => t.IsA("BasePart"))

		const px = pos.X
		const pz = pos.Z

		for (const hitbox of towerHitboxes) {
			// defensive: ensure we have a valid BasePart
			if (!hitbox || !hitbox.IsA("BasePart")) continue

			const dx = px - hitbox.Position.X
			const dz = pz - hitbox.Position.Z

			if (dx * dx + dz * dz < radius * radius) {
				return false
			}
		}

		return true
	}

	private confirmTowerPlacement() {
		const selectedTower = this.selectedTower()
		$assert(this.isPlacing)
		$assert(selectedTower !== "None")
		const placementPos = this.mouseToTowerPos(selectedTower)
		$assert(placementPos, `this.mouseToTowerPos(${this.selectedTower}) returned undefined`)

		const clone = this.previewModel?.Clone()

		Functions.placeTower.invoke(placementPos, selectedTower).then(wasPlaced => {
			if (wasPlaced) {
				clone?.Destroy()
			} else {
				// Failed, make clone red then destroy or seomthing
				clone?.Destroy()
			}
		})
	}

	private mouseToTowerPos(tower: TowerName): Vector3 | undefined {
		const { X, Y } = UserInputService.GetMouseLocation()
		const { Origin, Direction } = camera!.ViewportPointToRay(X, Y)

		const rayParams = new RaycastParams()
		rayParams.FilterType = Enum.RaycastFilterType.Exclude
		rayParams.FilterDescendantsInstances = [Workspace.Preview, Workspace.Live, Workspace.Towers]

		const rayResult = Workspace.Raycast(Origin, Direction.mul(1000), rayParams)

		if (rayResult) {
			const { X, Z } = rayResult.Position

			const worldSize = towerFolder[tower].GetExtentsSize()
			const Y = rayResult.Position.Y + worldSize.Y / 2

			return new Vector3(X, Y, Z)
		}
	}

	public togglePlacingTower(tower: TowerName): boolean
	public togglePlacingTower(tower: TowerName, toggle: boolean): boolean
	public togglePlacingTower(tower: TowerName, toggle?: boolean): boolean {
		if (toggle === undefined) {
			toggle = !this.isPlacing
		}
		if (this.isPlacing) {
			this.stopPlacingTower()
		} else {
			this.startPlacingTower(tower)
		}
		return this.isPlacing
	}
}

function makePartPreview(part: BasePart) {
	if (part.Name === "hitbox") return
	part.Transparency = 0.5
	part.CanCollide = false
	part.CanQuery = false
}
