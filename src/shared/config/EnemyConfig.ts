export interface EnemyInfo {
	health: number
	damage: number // When enemy reaches end
	speed: number
}

export const EnemyConfig = {
	Skeleton: {
		health: 1,
		damage: 1,
		speed: 5
	},
	Armored_Skeleton: {
		health: 3,
		damage: 1,
		speed: 5
	}
} satisfies Record<string, EnemyInfo>

export type EnemyName = keyof typeof EnemyConfig
