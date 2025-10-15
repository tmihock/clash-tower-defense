import { Networking } from "@flamework/networking"

// Client -> Server events
interface ServerEvents {}

// Server -> Client events
interface ClientEvents {
	playerStateChanged(key: string, newValue: unknown, oldValue: unknown): void
}

// Client -> Server -> Client functions
interface ServerFunctions {}

// Server -> Client -> Server functions
// Unsafe
interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>()
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>()
