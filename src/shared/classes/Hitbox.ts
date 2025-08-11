import { Workspace, Players } from "@rbxts/services"

export type HitboxShape = "Sphere" | "Box" | "Capsule" | "Raycast"

export interface HitboxConfig {
	shape: HitboxShape
	position: Vector3
	size?: Vector3 // For Box and Capsule
	radius?: number // For Sphere and Capsule
	height?: number // For Capsule
	direction?: Vector3 // For Raycast
	distance?: number // For Raycast
	rotation?: CFrame // For Box and Capsule
}

export interface HitboxResult {
	hit: boolean
	hitPart?: BasePart
	hitCharacter?: Model
	hitPlayer?: Player
	distance?: number
	hitPoint?: Vector3
	hitNormal?: Vector3
}

export class Hitbox {
	private config: HitboxConfig

	constructor(config: HitboxConfig) {
		this.config = config
	}

	/**
	 * Detects collisions with the hitbox
	 * @param filterFunction Optional function to filter what can be hit
	 * @returns HitboxResult with collision information
	 */
	public detect(filterFunction?: (part: BasePart) => boolean): HitboxResult {
		switch (this.config.shape) {
			case "Sphere":
				return this.detectSphere(filterFunction)
			case "Box":
				return this.detectBox(filterFunction)
			case "Capsule":
				return this.detectCapsule(filterFunction)
			case "Raycast":
				return this.detectRaycast(filterFunction)
			default:
				return { hit: false }
		}
	}

	/**
	 * Detects sphere hitbox collisions
	 */
	private detectSphere(filterFunction?: (part: BasePart) => boolean): HitboxResult {
		if (!this.config.radius) return { hit: false }

		const radius = this.config.radius
		const position = this.config.position

		// Get all parts in the sphere area
		const parts = Workspace.GetPartBoundsInBox(
			position,
			new Vector3(radius * 2, radius * 2, radius * 2)
		)

		for (const part of parts) {
			if (filterFunction && !filterFunction(part)) continue

			// Check if part is within sphere radius
			const distance = part.Position.sub(position).Magnitude
			if (distance <= radius) {
				const character = part.FindFirstAncestorOfClass("Model")
				const player = this.getPlayerFromCharacter(character)

				return {
					hit: true,
					hitPart: part,
					hitCharacter: character,
					hitPlayer: player,
					distance: distance,
					hitPoint: part.Position,
					hitNormal: part.Position.sub(position).Unit
				}
			}
		}

		return { hit: false }
	}

	/**
	 * Detects box hitbox collisions
	 */
	private detectBox(filterFunction?: (part: BasePart) => boolean): HitboxResult {
		if (!this.config.size) return { hit: false }

		const size = this.config.size
		const position = this.config.position
		const rotation = this.config.rotation || new CFrame(position)

		// Get all parts in the box area
		const parts = Workspace.GetPartBoundsInBox(position, size)

		for (const part of parts) {
			if (filterFunction && !filterFunction(part)) continue

			// Transform part position to local coordinates
			const localPosition = rotation.Inverse().PointToWorldSpace(part.Position)
			const halfSize = size.div(2)

			// Check if part is within box bounds
			if (
				math.abs(localPosition.X) <= halfSize.X &&
				math.abs(localPosition.Y) <= halfSize.Y &&
				math.abs(localPosition.Z) <= halfSize.Z
			) {
				const character = part.FindFirstAncestorOfClass("Model")
				const player = this.getPlayerFromCharacter(character)

				return {
					hit: true,
					hitPart: part,
					hitCharacter: character,
					hitPlayer: player,
					hitPoint: part.Position,
					hitNormal: rotation.LookVector
				}
			}
		}

		return { hit: false }
	}

	/**
	 * Detects capsule hitbox collisions
	 */
	private detectCapsule(filterFunction?: (part: BasePart) => boolean): HitboxResult {
		if (!this.config.radius || !this.config.height) return { hit: false }

		const radius = this.config.radius
		const height = this.config.height
		const position = this.config.position
		const rotation = this.config.rotation || CFrame.new(position)

		// Get all parts in the capsule area
		const parts = Workspace.GetPartBoundsInBox(
			position,
			new Vector3(radius * 2, height, radius * 2)
		)

		for (const part of parts) {
			if (filterFunction && !filterFunction(part)) continue

			// Transform part position to local coordinates
			const localPosition = rotation.Inverse().PointToWorldSpace(part.Position)
			const halfHeight = height / 2

			// Check if part is within capsule bounds
			const horizontalDistance = math.sqrt(
				localPosition.X * localPosition.X + localPosition.Z * localPosition.Z
			)

			if (horizontalDistance <= radius && math.abs(localPosition.Y) <= halfHeight) {
				const character = part.FindFirstAncestorOfClass("Model")
				const player = this.getPlayerFromCharacter(character)

				return {
					hit: true,
					hitPart: part,
					hitCharacter: character,
					hitPlayer: player,
					hitPoint: part.Position,
					hitNormal: rotation.LookVector
				}
			}
		}

		return { hit: false }
	}

	/**
	 * Detects raycast hitbox collisions
	 */
	private detectRaycast(filterFunction?: (part: BasePart) => boolean): HitboxResult {
		if (!this.config.direction || !this.config.distance) return { hit: false }

		const origin = this.config.position
		const direction = this.config.direction
		const distance = this.config.distance

		const raycastParams = new RaycastParams()
		raycastParams.FilterType = Enum.RaycastFilterType.Blacklist
		raycastParams.FilterDescendantsInstances = []

		const raycastResult = Workspace.Raycast(origin, direction.mul(distance), raycastParams)

		if (raycastResult) {
			const hitPart = raycastResult.Instance

			if (filterFunction && !filterFunction(hitPart)) {
				return { hit: false }
			}

			const character = hitPart.FindFirstAncestorOfClass("Model")
			const player = this.getPlayerFromCharacter(character)

			return {
				hit: true,
				hitPart: hitPart,
				hitCharacter: character,
				hitPlayer: player,
				distance: raycastResult.Distance,
				hitPoint: raycastResult.Position,
				hitNormal: raycastResult.Normal
			}
		}

		return { hit: false }
	}

	/**
	 * Gets the player from a character model
	 */
	private getPlayerFromCharacter(character?: Model): Player | undefined {
		if (!character) return undefined

		for (const player of Players.GetPlayers()) {
			if (player.Character === character) {
				return player
			}
		}

		return undefined
	}

	/**
	 * Creates a sphere hitbox
	 */
	public static createSphere(position: Vector3, radius: number): Hitbox {
		return new Hitbox({
			shape: "Sphere",
			position: position,
			radius: radius
		})
	}

	/**
	 * Creates a box hitbox
	 */
	public static createBox(position: Vector3, size: Vector3, rotation?: CFrame): Hitbox {
		return new Hitbox({
			shape: "Box",
			position: position,
			size: size,
			rotation: rotation
		})
	}

	/**
	 * Creates a capsule hitbox
	 */
	public static createCapsule(
		position: Vector3,
		radius: number,
		height: number,
		rotation?: CFrame
	): Hitbox {
		return new Hitbox({
			shape: "Capsule",
			position: position,
			radius: radius,
			height: height,
			rotation: rotation
		})
	}

	/**
	 * Creates a raycast hitbox
	 */
	public static createRaycast(origin: Vector3, direction: Vector3, distance: number): Hitbox {
		return new Hitbox({
			shape: "Raycast",
			position: origin,
			direction: direction,
			distance: distance
		})
	}

	/**
	 * Creates a forward-facing raycast hitbox from a character
	 */
	public static createForwardRaycast(character: Model, distance: number): Hitbox {
		const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart
		if (!rootPart) {
			throw new Error("Character must have a HumanoidRootPart")
		}

		const direction = rootPart.CFrame.LookVector
		return Hitbox.createRaycast(rootPart.Position, direction, distance)
	}

	/**
	 * Creates a sphere hitbox around a character
	 */
	public static createCharacterSphere(character: Model, radius: number): Hitbox {
		const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart
		if (!rootPart) {
			throw new Error("Character must have a HumanoidRootPart")
		}

		return Hitbox.createSphere(rootPart.Position, radius)
	}

	/**
	 * Creates a box hitbox around a character
	 */
	public static createCharacterBox(character: Model, size: Vector3): Hitbox {
		const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart
		if (!rootPart) {
			throw new Error("Character must have a HumanoidRootPart")
		}

		return Hitbox.createBox(rootPart.Position, size, rootPart.CFrame)
	}
}
