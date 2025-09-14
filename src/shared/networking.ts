import { Networking } from "@flamework/networking"
import { TowerName } from "./config/TowerConfig"

// Client -> Server events
interface ServerEvents {}

// Server -> Client events
interface ClientEvents {}

// Client -> Server -> Client functions
interface ServerFunctions {
	placeTower(pos: Vector3, tower: TowerName): boolean
}

// Server -> Client -> Server functions
// Unsafe
interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>()
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>()
