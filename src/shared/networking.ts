import { Networking } from "@flamework/networking"
import { TowerName } from "./config/TowerConfig"
import { EnemyName } from "./config/EnemyConfig"

// Client -> Server events
interface ServerEvents {}

// Server -> Client events
interface ClientEvents {
	enemySpawned(id: number, enemy: EnemyName): void
	enemyDeleted(id: number): void
	updateEnemyHealth(id: number, value: number): void
	syncEnemyTime(id: number, t: number): void
}

// Client -> Server -> Client functions
interface ServerFunctions {
	placeTower(pos: Vector3, tower: TowerName): boolean
}

// Server -> Client -> Server functions
// Unsafe
interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>()
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>()
