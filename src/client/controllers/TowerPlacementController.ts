import { Controller, OnStart } from "@flamework/core"
import {
	CollectionService,
	Players,
	ReplicatedStorage,
	RunService,
	UserInputService,
	Workspace
} from "@rbxts/services"
import { ATTR_OWNER } from "shared/constants"
import { Events, Functions } from "client/networking"
import { $assert } from "rbxts-transform-debug"
import { TowerConfig, TowerName } from "shared/config/TowerConfig"
import { EnemyController } from "./EnemyController"
import { TargetMode } from "shared/networking"
import { Atom, atom } from "@rbxts/charm"
import { createRoot } from "@rbxts/react-roblox"
import React from "@rbxts/react"
import { TAG_TOWER } from "shared/constants"
import { findFirstAncestorWithTag } from "shared/util/findFirstAncestorWithTag"
import { TooltipUI } from "client/ui/Tooltip"
import { TrackController } from "./TrackController"
import { ClientStateProvider } from "./ClientStateProvider"
import { Tower_C } from "client/classes/Tower_C"
import { InventoryController } from "./InventoryController"
import { $terrify } from "rbxts-transformer-t-new"

const player = Players.LocalPlayer
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui
const camera = Workspace.CurrentCamera
const towerFolder = ReplicatedStorage.Assets.Towers

const tTowerName = $terrify<TowerName>()

/**
 * Handles tower placement (preview, input, placement logic, etc.)
 */
@Controller({})
export class TowerPlacementController implements OnStart {
	private isPlacing = false
	private previewModel?: PVInstance
	private mouseStepped?: RBXScriptConnection
	private selectedTower: Atom<TowerName>

	private rangePreview = new Instance("Part")

	constructor(
		private trackController: TrackController,
		private stateProvider: ClientStateProvider
	) {
		this.selectedTower = this.stateProvider.selectedTower
	}

	onStart() {
		// Setup range preview part
		this.rangePreview.Anchored = true
		this.rangePreview.CanCollide = false
		this.rangePreview.Transparency = 1
		this.rangePreview.Material = Enum.Material.Neon
		this.rangePreview.Color = new Color3(1, 1, 1)
		this.rangePreview.Parent = Workspace.Preview
		this.rangePreview.Shape = Enum.PartType.Cylinder
		this.rangePreview.Orientation = new Vector3(0, 90, 90)

		// Equipping tower tools (to place)
		player.CharacterAdded.Connect(char => {
			const human = char.WaitForChild("Humanoid") as Humanoid

			char.ChildAdded.Connect(child => {
				if (!(child.IsA("Tool") && tTowerName(child.Name))) return

				this.startPlacingTower(child)
				const c = char.AncestryChanged.Connect((_, p) => {
					if (p !== char) {
						this.stopPlacingTower()
						c.Disconnect()
					}
				})
			})
			human.Died.Connect(() => this.stopPlacingTower())
		})

		// Confirm placement
		UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return

			if (input.UserInputType === Enum.UserInputType.MouseButton1 && this.isPlacing) {
				this.confirmTowerPlacement()
			}
		})
	}

	public stopPlacingTower() {
		if (!this.isPlacing) return
		this.isPlacing = false
		this.selectedTower("None")
		this.mouseStepped?.Disconnect()
		this.rangePreview.Parent = Workspace.Preview
		this.rangePreview.Transparency = 1
		this.previewModel?.Destroy()
	}

	public startPlacingTower(tool: Tool) {
		const tower = tool.Name as TowerName
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

		const previewHitbox = preview.hitbox
		previewHitbox.Transparency = 0.9

		const range = TowerConfig[tower].range

		this.rangePreview.PivotTo(previewHitbox.CFrame)
		this.rangePreview.Size = new Vector3(0.1, range * 2, range * 2)
		this.rangePreview.Transparency = 0.9
		this.rangePreview.Parent = preview

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

		tool.AncestryChanged.Connect(parent => {
			if (parent !== player.Character) {
				this.stopPlacingTower()
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
		Functions.requestPlaceTower.invoke(placementPos, selectedTower).then(wasPlaced => {
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
}

function makePartPreview(part: BasePart) {
	if (part.Name === "hitbox") return
	part.Transparency = 0.5
	part.CanCollide = false
	part.CanQuery = false
}
