import { EnemyName } from "./EnemyConfig"

export interface WaveInfo {
	enemies: { enemy: EnemyName; amount: number }[]
}

export const Waves = [
	{
		enemies: [
			{
				enemy: "Skeleton",
				amount: 5
			}
		]
	}
] satisfies WaveInfo[]
