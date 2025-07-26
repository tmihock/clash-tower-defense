import { Service, OnStart, OnInit } from "@flamework/core"
import { Modding } from "@flamework/core"
import { atom } from "@rbxts/charm"
import { Players, Workspace } from "@rbxts/services"

const characterFolder = Workspace.Live

// Fires when new player joins
// Might delay when server isn't ignited
export interface OnPlayerAdded {
	onPlayerAdded(player: Player): void
}

// Fires when player leaves or game closes
export interface OnPlayerRemoving {
	onPlayerRemoving(player: Player): void
}

@Service({})
export class PlayerService implements OnInit, OnStart {
	public playerCount = atom(0)

	onInit() {
		this.setupOnAdded()
		this.setupOnRemoving()
		this.setupCharacterFolder()
	}

	onStart() {
		Players.PlayerAdded.Connect(() => this.updatePlayerCount())
		Players.PlayerRemoving.Connect(() => this.updatePlayerCount())
	}

	private updatePlayerCount() {
		this.playerCount(Players.GetPlayers().size())
	}

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
			// Promise.all this
			//.andThen(() => {
			// promise.all(			// })
			// same for bindtoclose
		})

		game.BindToClose(() => {
			for (const player of Players.GetPlayers()) {
				listeners.forEach(l => task.spawn(() => l.onPlayerRemoving(player)))
			}
		})
	}
}
