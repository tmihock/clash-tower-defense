import { Service, OnStart } from "@flamework/core"
import { Atom, atom, subscribe } from "@rbxts/charm"
import { OnPlayerAdded, OnPlayerRemoving } from "./PlayerService"
import { Events, Functions } from "server/networking"
import { ServerStateProvider } from "./ServerStateProvider"
import { RoundService } from "./RoundService"

@Service({})
export class GameService implements OnStart, OnPlayerAdded, OnPlayerRemoving {
	private health: Atom<number>
	private gameStarted: Atom<boolean>

	constructor(
		private stateProvider: ServerStateProvider,
		private roundSerivice: RoundService
	) {
		this.health = this.stateProvider.health
		this.gameStarted = this.stateProvider.gameStarted
	}

	onStart() {
		Functions.requestStartGame.setCallback(p => this.onStartGameRequest(p))
	}

	// Returns true if game was started
	private onStartGameRequest(player: Player): boolean {
		if (!this.gameStarted()) {
			this.startGame()
			return true
		} else {
			return false
		}
	}

	onPlayerAdded(player: Player): void {
		Events.healthChanged.fire(player, this.health())
	}

	onPlayerRemoving(player: Player): void {}

	public startGame() {
		assert(!this.gameStarted, "Game has already started")

		task.spawn(() => {
			this.roundSerivice.play()
		})
	}
}
