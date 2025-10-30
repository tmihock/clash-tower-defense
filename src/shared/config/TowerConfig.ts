export interface TowerInfo {
	id: number
	expReq: number

	damage: number
	attackRate: number // attacks per second
	range: number
	price: number
}

export const TowerConfig = {
	/**
	 * Null object must be used instead of undefined because Array methods require
	 * that all elements be defined.
	 */
	None: {
		id: -1,
		expReq: -1,
		damage: -1,
		attackRate: 100,
		range: 0,
		price: -1
	},
	Barbarian: {
		id: 1,
		expReq: 0,
		damage: 1,
		attackRate: 1,
		range: 8,
		price: 100
	},
	Archer: {
		id: 2,
		expReq: 10,
		damage: 1,
		attackRate: 0.5,
		range: 16,
		price: 150
	},
	Cannon: {
		id: 4,
		expReq: 50,
		damage: 2,
		attackRate: 0.8,
		range: 14,
		price: 250
	},
	Sharpshooter: {
		id: 5,
		expReq: 80,
		damage: 3,
		attackRate: 1.5,
		range: 100,
		price: 350
	}
} satisfies Record<string, TowerInfo>

export type TowerName = keyof typeof TowerConfig

// TODO: Change to this later maybe?
export type PlaceableTowerName = Exclude<TowerName, "None">
