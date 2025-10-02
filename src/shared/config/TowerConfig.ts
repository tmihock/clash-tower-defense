export interface TowerInfo {
	id: number

	damage: number
	attackRate: number // attacks per second
	range: number
	price: number
}

export const TowerConfig = {
	// null object because undefined messes with array methods
	// Used in equip bar
	None: {
		id: -1,
		damage: -1,
		attackRate: 100,
		range: 0,
		price: -1
	},
	Barbarian: {
		id: 1,
		damage: 1,
		attackRate: 1,
		range: 5,
		price: 100
	},
	Archer: {
		id: 2,
		damage: 1,
		attackRate: 0.5,
		range: 16,
		price: 150
	}
} satisfies Record<string, TowerInfo>

export type TowerName = keyof typeof TowerConfig

// TODO: Change to this later maybe?
export type PlaceableTowerName = Exclude<TowerName, "None">
