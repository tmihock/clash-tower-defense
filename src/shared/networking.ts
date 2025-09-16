import { Networking } from "@flamework/networking"
import { TowerName } from "./config/TowerConfig"
import { EnemyName } from "./config/EnemyConfig"

export interface EnemySyncInfo {
	id: number
	elapsed: number
	pos: Vector3
}

export interface TowerSyncInfo {
	id: number
	damageDealt: number
}

export type TargetMode = "First" | "Last" | "Closest"

// Client -> Server events
interface ServerEvents {}

// Server -> Client events
interface ClientEvents {
	// Enemies
	enemySpawned(id: number, enemy: EnemyName): void
	enemyDeleted(id: number): void
	updateEnemyHealth(id: number, value: number): void
	syncEnemies(info: EnemySyncInfo[]): void

	// Towers
	towerPlaced(id: number, pos: Vector3, tower: TowerName): void
	towerDeleted(id: number): void
	setTowerTargetMode(id: number, targetMode: TargetMode): void
	towerAttackedEnemy(towerId: number, enemyId: number): void
	syncTowers(info: TowerSyncInfo[]): void
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
