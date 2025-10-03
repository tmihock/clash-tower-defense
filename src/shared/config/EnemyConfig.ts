export interface EnemyInfo {
	id: number
	health: number
	damage: number // When enemy reaches end
	speed: number
}

export const EnemyConfig = {
	Skeleton: {
		id: 1,
		health: 1,
		damage: 1,
		speed: 5
	},
	Armored_Skeleton: {
		id: 2,
		health: 3,
		damage: 1,
		speed: 5
	},
	Goblin: {
		id: 3,
		health: 2,
		damage: 2,
		speed: 7
	}
} satisfies Record<string, EnemyInfo>

export type EnemyName = keyof typeof EnemyConfig
