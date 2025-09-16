export interface TowerInfo {
	damage: number
	attackRate: number // attacks per second
	range: number
}

export const TowerConfig = {
	// null object because undefined messes with array methods
	// Used in equip bar
	None: {
		damage: -1,
		attackRate: 100,
		range: 0
	},
	Barbarian: {
		damage: 1,
		attackRate: 1,
		range: 16
	}
} satisfies Record<string, TowerInfo>

export type TowerName = keyof typeof TowerConfig

// TODO: Change to this later maybe?
export type PlaceableTowerName = Exclude<TowerName, "None">
