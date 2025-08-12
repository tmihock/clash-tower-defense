/**
 * 0.1.1
 *
 * TODO:
 *   -  Smooth transition for Shiftlock -> Default
 */
import { Controller, OnStart } from "@flamework/core"
import { Players, RunService, UserInputService, Workspace } from "@rbxts/services"
import { $print } from "rbxts-transform-debug"

const Player = Players.LocalPlayer
const Camera = Workspace.CurrentCamera!

type CameraModeSettings = {
	fieldOfView: number
	offset: Vector3
	sensitivity: number
	lerpSpeed: number
}

export type CameraMode = "Default" | "ShiftLock"

const verticalAngleMin = math.rad(-55) // Looking down (camera above)
const verticalAngleMax = math.rad(65) // Looking up (camera below)

const cameraSettings = {
	Default: {
		fieldOfView: 70,
		offset: new Vector3(0, 0, 0),
		sensitivity: 0,
		lerpSpeed: 0.25
	},
	ShiftLock: {
		fieldOfView: 70,
		offset: new Vector3(3, 2.5, 9), // X: Right, Y: Up, Z: Back
		sensitivity: 3,
		lerpSpeed: 0.25
	}
}

@Controller({})
export class CameraController implements OnStart {
	private horizontalAngle = 0
	private verticalAngle = 0

	private activeMode: CameraMode = "Default"

	onStart() {
		RunService.RenderStepped.Connect(() => {
			if (this.activeMode === "ShiftLock") this.updateShiftLockCamera()
		})

		UserInputService.InputChanged.Connect(input => {
			if (this.activeMode !== "ShiftLock") return

			if (input.UserInputType === Enum.UserInputType.MouseMovement) {
				const mouseDelta = input.Delta
				const { sensitivity } = cameraSettings.ShiftLock

				this.horizontalAngle -= (mouseDelta.X / Camera.ViewportSize.X) * sensitivity
				this.verticalAngle -= (mouseDelta.Y / Camera.ViewportSize.Y) * sensitivity
				this.verticalAngle = math.clamp(this.verticalAngle, verticalAngleMin, verticalAngleMax)
			}
		})
	}

	public setMode(mode: CameraMode) {
		$print(`Camera mode set to: ${mode}`)

		this.activeMode = mode
		switch (mode) {
			case "Default":
				Camera.CameraType = Enum.CameraType.Custom
				Camera.CameraSubject = Player.Character?.FindFirstChildWhichIsA("Humanoid") ?? undefined
				UserInputService.MouseBehavior = Enum.MouseBehavior.Default
				break
			case "ShiftLock":
				Camera.CameraType = Enum.CameraType.Scriptable
				UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter

				// Calculate angles from current camera look direction
				const hrp = Player.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined
				if (hrp) {
					// Get the direction from character to current camera position
					const lookDirection = Camera.CFrame.LookVector

					// Calculate horizontal angle (Y-axis rotation)
					this.horizontalAngle = math.atan2(-lookDirection.Z, lookDirection.X) - math.pi / 2

					// Calculate vertical angle (X-axis rotation)
					const horizontalDistance = math.sqrt(lookDirection.X ** 2 + lookDirection.Z ** 2)
					this.verticalAngle = -math.atan2(-lookDirection.Y, horizontalDistance)
					this.verticalAngle = math.clamp(this.verticalAngle, verticalAngleMin, verticalAngleMax)
				}

				break
		}
	}

	private updateShiftLockCamera() {
		const hrp = Player.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined
		if (!hrp) return

		const { offset, fieldOfView, lerpSpeed } = cameraSettings.ShiftLock

		const desiredCFrame = new CFrame(hrp.Position)
			.mul(CFrame.Angles(0, this.horizontalAngle, 0))
			.mul(CFrame.Angles(this.verticalAngle, 0, 0))
			.mul(new CFrame(offset))

		Camera.CFrame = Camera.CFrame.Lerp(desiredCFrame, lerpSpeed)
		Camera.FieldOfView = Camera.FieldOfView + (fieldOfView - Camera.FieldOfView) * lerpSpeed

		const lookDir = new Vector3(
			math.cos(this.horizontalAngle + math.pi / 2),
			0,
			-math.sin(this.horizontalAngle + math.pi / 2)
		)

		hrp.CFrame = hrp.CFrame.Lerp(new CFrame(hrp.Position, hrp.Position.add(lookDir)), lerpSpeed / 2)
	}
}
