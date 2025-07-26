import { Networking } from "@flamework/networking"
import { Vitals } from "./types"

// Client -> Server events
interface ServerEvents {}

// Server -> Client events
interface ClientEvents {
	updateVital(vital: keyof Vitals, value: number): void
}

// Client -> Server -> Client functions
interface ServerFunctions {
	useTool(tool: Tool, input: Enum.UserInputType): boolean | undefined | void
}

// Server -> Client -> Server functions
// Unsafe
interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>()
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>()
