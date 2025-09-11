export interface TowerInfo {
	damage: number
	attackRate: number // attacks per second
	range: number
}

export const TowerConfig = {
	Barbarian: {
		damage: 1,
		attackRate: 1,
		range: 16
	}
} satisfies Record<string, TowerInfo>

export type TowerName = keyof typeof TowerConfig
