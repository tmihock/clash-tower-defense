export interface EnemyInfo {
	id: number
	health: number
	rarity: Rarity
}

export interface RarityInfo {
	color: string
	weight: number
}

export const EnemyRarities = {
	Common: { color: "White", weight: 50 },
	Uncommon: { color: "Green", weight: 30 },
	Rare: { color: "Blue", weight: 15 },
	Epic: { color: "Purple", weight: 1 },
	Legendary: { color: "Orange", weight: 0.1 }
} satisfies Record<string, RarityInfo>

export const EnemyConfig = {
	Skeleton: {
		id: 1,
		health: 5,
		rarity: "Common"
	},
	Armored_Skeleton: {
		id: 2,
		health: 15,
		rarity: "Common"
	},
	Goblin: {
		id: 3,
		health: 20,
		rarity: "Common"
	}
} satisfies Record<string, EnemyInfo>

export type EnemyName = keyof typeof EnemyConfig
export type Rarity = keyof typeof EnemyRarities
