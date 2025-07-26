import { Service, OnStart } from "@flamework/core"
import { DataIO, SaveableDataObject } from "./DataService"
import { $terrify } from "rbxts-transformer-t-new"
import { MAX_VITAL } from "shared/constants"
import { Events } from "server/networking"
import { $print } from "rbxts-transform-debug"
import { Vitals } from "shared/types"
import { OnPlayerAdded, OnPlayerRemoving } from "./PlayerService"
import Maid from "@rbxts/maid"

/**
 * ROUND ONLY SERVICE, DOES NOT SAVE DATA
 */

@Service()
export class VitalsService implements OnPlayerAdded, OnPlayerRemoving {
	private playerVitals = new Map<Player, Vitals>()
	private playerMaids = new Map<Player, Maid>()

	/**
	 * Clamps between 0 and MAX_VITAL
	 */
	public setVital(player: Player, vital: keyof Vitals, value: number) {
		this.playerVitals.get(player)![vital] = math.clamp(value, 0, MAX_VITAL)
		Events.updateVital.fire(player, vital, math.clamp(value, 0, MAX_VITAL))
	}

	public removeVital(player: Player, vital: keyof Vitals, value: number) {
		this.setVital(player, vital, this.getVital(player, vital) - value)
	}

	public addVital(player: Player, vital: keyof Vitals, value: number) {
		this.setVital(player, vital, this.getVital(player, vital) + value)
	}

	public setMaxVital(player: Player, vital: keyof Vitals) {
		this.setVital(player, vital, MAX_VITAL)
	}

	public setMaxVitals(player: Player) {
		this.setMaxVital(player, "hunger")
		this.setMaxVital(player, "thirst")
		this.setMaxVital(player, "temperature")
	}

	public getVital(player: Player, vital: keyof Vitals): number {
		return this.playerVitals.get(player)![vital]
	}

	onPlayerAdded(player: Player) {
		this.playerVitals.set(player, {
			hunger: MAX_VITAL,
			thirst: MAX_VITAL,
			temperature: MAX_VITAL
		})
		this.playerMaids.set(player, new Maid())
		this.startVitalsLoop(player)
	}

	onPlayerRemoving(player: Player) {
		this.playerVitals.delete(player)
		this.playerMaids.get(player)!.DoCleaning()
		this.playerMaids.delete(player)
	}

	private startVitalsLoop(player: Player) {
		this.playerMaids.get(player)!.GiveTask(this.createVitalLoop(player, "hunger", 2))
		this.playerMaids.get(player)!.GiveTask(this.createVitalLoop(player, "thirst", 4))
		this.playerMaids.get(player)!.GiveTask(this.createVitalLoop(player, "temperature", 1))

		// Fill hunger on respawn
		player.CharacterAdded.Connect(char => {
			const human = char.WaitForChild("Humanoid") as Humanoid
			human.Died.Connect(() => {
				player.CharacterAdded.Wait()
				this.setMaxVitals(player)
			})
		})
	}

	private createVitalLoop(player: Player, vital: keyof Vitals, depletionRate: number): thread {
		return task.spawn(() => {
			while (true) {
				task.wait(depletionRate)
				const char = player.Character
				const human = char?.FindFirstChildOfClass("Humanoid")
				if (!(char && human)) continue
				if (this.getVital(player, vital) === 0) continue
				if (human.Health <= 0) continue

				// Change rate later
				this.removeVital(player, vital, 1)
			}
		})
	}
}
