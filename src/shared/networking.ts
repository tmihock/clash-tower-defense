import { Networking } from "@flamework/networking"
import { ChoosableRole, Role } from "./types"

// Client -> Server events
interface ServerEvents {
	// Teams
	chooseRole(role: ChoosableRole): void
	startChoosing(): void
	// Guns
	shootPlayer(tool: Tool, player: Player): void
}

// Server -> Client events
interface ClientEvents {
	itemAdded(tool: Tool): void
	itemRemoved(tool: Tool): void
}

// Client -> Server -> Client functions
interface ServerFunctions {
	useTool(tool: Tool, input: Enum.UserInputType): boolean | undefined | void

	canShoot(tool: Tool): boolean
}

// Server -> Client -> Server functions
// Unsafe
interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>()
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>()
