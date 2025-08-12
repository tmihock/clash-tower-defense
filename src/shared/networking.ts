import { Networking } from "@flamework/networking"
import { ChoosableRole, Role } from "./types"

// Client -> Server events
interface ServerEvents {
	chooseRole(role: ChoosableRole): void
	startChoosing(): void
}

// Server -> Client events
interface ClientEvents {}

// Client -> Server -> Client functions
interface ServerFunctions {
	useTool(tool: Tool, input: Enum.UserInputType): boolean | undefined | void
}

// Server -> Client -> Server functions
// Unsafe
interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>()
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>()
