import { EnemyName } from "./EnemyConfig"

export interface RoundInfo {
	enemies: { enemy: EnemyName; count: number; spawnInterval: number }[]
}

export const Waves = [
	{
		enemies: [{ enemy: "Skeleton", count: 5, spawnInterval: 1 }]
	},
	{
		enemies: [{ enemy: "Skeleton", count: 10, spawnInterval: 0.75 }]
	},
	{
		enemies: [
			{ enemy: "Skeleton", count: 5, spawnInterval: 1 },
			{ enemy: "Armored_Skeleton", count: 5, spawnInterval: 1 }
		]
	},
	{
		enemies: [
			{ enemy: "Skeleton", count: 10, spawnInterval: 0.5 },
			{ enemy: "Armored_Skeleton", count: 10, spawnInterval: 1 }
		]
	},
	{
		enemies: [
			{ enemy: "Goblin", count: 5, spawnInterval: 1 },
			{ enemy: "Armored_Skeleton", count: 10, spawnInterval: 0.75 }
		]
	}
] satisfies RoundInfo[]
