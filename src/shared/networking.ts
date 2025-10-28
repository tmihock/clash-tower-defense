import { Networking } from "@flamework/networking"
import { TowerName } from "./config/TowerConfig"
import { EnemyName } from "./config/EnemyConfig"

export interface EnemySyncInfo {
	id: number
	elapsed: number
	pos: Vector3
}

export type TargetMode = "First" | "Last" | "Closest"
export interface TowerSyncInfo {
	id: number
	damageDealt: number
}

export type EquipBar = TowerName[]

// Client -> Server events
interface ServerEvents {
	// Inventory / Equip
	setEquipBar(equipBar: EquipBar): void
	updateEquipBar(index: number, value: TowerName): void
}

// Server -> Client events
interface ClientEvents {
	// Player State
	playerStateChanged(key: string, newValue: unknown, oldValue: unknown): void

	// Game

	// Enemies
	enemySpawned(id: number, enemy: EnemyName): void
	enemyDeleted(id: number): void
	updateEnemyHealth(id: number, value: number): void
	syncEnemies(info: EnemySyncInfo[]): void

	// Towers
	towerPlaced(id: number, pos: Vector3, tower: TowerName, owner: Player): void
	towerDeleted(id: number): void
	setTowerTargetMode(id: number, targetMode: TargetMode): void
	towerAttackedEnemy(towerId: number, enemyId: number): void
	syncTowers(info: TowerSyncInfo[]): void

	// Equip
	setEquipBar(equipBar: EquipBar): void
	updateEquipBar(index: number, value: TowerName): void

	// Inventory
	setUnlockedInventory(inventory: TowerName[]): void
	addToUnlockedInventory(tower: TowerName): void
	removeFromUnlockedInventory(tower: TowerName): void
}

// Client -> Server -> Client functions
interface ServerFunctions {
	requestPlaceTower(pos: Vector3, tower: TowerName): boolean
	requestStartGame(): boolean
}

// Server -> Client -> Server functions
// Unsafe
interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>()
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>()
