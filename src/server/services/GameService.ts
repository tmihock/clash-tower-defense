import { Service, OnStart } from "@flamework/core"

@Service({})
export class GameService implements OnStart {
	private currentWave: number = -1
	private health: number = 200

	onStart() {}

	public takeDamage(amount: number) {
		// Play effect
		this.health -= amount
	}
}
