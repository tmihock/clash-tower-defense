import { Service, OnStart, OnInit } from "@flamework/core"
import { Modding } from "@flamework/core"
import { Players, Workspace } from "@rbxts/services"

const characterFolder = Workspace.Live

/** Hook into the OnPlayerAdded lifecycle event. */
export interface OnPlayerAdded {
	/**
	 * Called when a player enters the game. Call might be delayed if flamework's
	 * server-side isn't ignited yet.
	 *
	 * @param {Player} player
	 */
	onPlayerAdded(player: Player): void
}

/** Hook into the OnPlayerRemoving lifecycle event. */
export interface OnPlayerRemoving {
	/**
	 * Called when a player is about to leave the game. This can happen from
	 * either game.BindToClose() or Players.PlayerRemoving.
	 *
	 * @param {Player} player
	 */
	onPlayerRemoving(player: Player): void
}

@Service({})
export class PlayerService implements OnInit, OnStart {
	onInit() {
		this.setupOnAdded()
		this.setupOnRemoving()
		this.setupCharacterFolder()
	}

	onStart() {}

	private setupCharacterFolder() {
		Players.PlayerAdded.Connect(player => {
			player.CharacterAdded.Connect(char => {
				task.wait()
				char.Parent = characterFolder
			})
		})
	}

	private setupOnAdded() {
		const listeners = new Set<OnPlayerAdded>()

		Modding.onListenerAdded<OnPlayerAdded>(o => listeners.add(o))
		Modding.onListenerRemoved<OnPlayerAdded>(o => listeners.delete(o))

		Players.PlayerAdded.Connect(player => {
			listeners.forEach(l => task.spawn(() => l.onPlayerAdded(player)))
		})

		for (const player of Players.GetPlayers()) {
			listeners.forEach(l => task.spawn(() => l.onPlayerAdded(player)))
		}
	}

	private setupOnRemoving() {
		const listeners = new Set<OnPlayerRemoving>()

		Modding.onListenerAdded<OnPlayerRemoving>(o => listeners.add(o))
		Modding.onListenerRemoved<OnPlayerRemoving>(o => listeners.delete(o))

		Players.PlayerRemoving.Connect(player => {
			listeners.forEach(l => task.spawn(() => l.onPlayerRemoving(player)))
		})

		game.BindToClose(() => {
			for (const player of Players.GetPlayers()) {
				listeners.forEach(l => task.spawn(() => l.onPlayerRemoving(player)))
			}
		})
	}
}
