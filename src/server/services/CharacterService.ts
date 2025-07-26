/**
 * CharacterService.ts
 * Handles character respawning, saving, and loading.
 * Saves player's position and health
 */
import { Service, OnStart } from "@flamework/core"
import { DataIO, SaveableDataObject } from "./DataService"
import { loadCharacterAsync } from "shared/util/loadCharacterAsync"
import { OnPlayerAdded } from "./PlayerService"
import { RunService } from "@rbxts/services"
import { $terrify } from "rbxts-transformer-t-new"
import { $print, $warn } from "rbxts-transform-debug"
import { RESPAWN_TIME } from "shared/constants"

const SAVE_KEY = "character"
const STARTER_SPAWN = new CFrame() // change later

function serializeCFrame(cframe?: CFrame): number[] {
	if (!cframe) {
		return [...STARTER_SPAWN.GetComponents()]
	}
	return [...cframe.GetComponents()]
}

const defaultData = {
	pos: serializeCFrame(STARTER_SPAWN),
	health: 100
}

// CFrame.GetComponents()
const tSavedPos = $terrify<{
	pos: [
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number
	]
	health: number
}>()

interface CharacterInfo {
	lastPos?: CFrame
	health: number
}

@Service({})
export class CharacterService implements OnPlayerAdded, DataIO {
	private charInfo = new Map<Player, CharacterInfo>()
	private updateCharConnections = new Map<Player, RBXScriptConnection>()

	onStart() {}

	onPlayerAdded(player: Player) {
		this.handleRespawn(player)
		this.handleSaving(player)
	}

	private handleRespawn(player: Player) {
		player.CharacterAdded.Connect(character => {
			const humanoid = character.WaitForChild("Humanoid") as Humanoid

			humanoid.Died.Once(() => {
				task.wait(RESPAWN_TIME)
				player.LoadCharacter()
			})
		})
	}

	private handleSaving(player: Player) {
		this.charInfo.set(player, {
			lastPos: STARTER_SPAWN,
			health: 100
		})

		this.updateCharConnections.set(
			player,
			RunService.Heartbeat.Connect(() => {
				const char = player.Character
				const humanoid = char?.FindFirstChildOfClass("Humanoid")
				if (char && char.PrimaryPart && humanoid) {
					this.charInfo.get(player)!.health = humanoid.Health
					if (humanoid.Health > 0) {
						this.charInfo.get(player)!.lastPos = char.GetPivot()
					}
				}
			})
		)
	}

	onDataLoad(player: Player, data: Record<string, unknown>) {
		if (SAVE_KEY in data) {
			let charData = data[SAVE_KEY]
			const char = loadCharacterAsync(player, ["Humanoid", "HumanoidRootPart"]).expect()
			if (tSavedPos(charData) && charData.health > 0) {
				// Alive
				char.PivotTo(new CFrame(...charData.pos))
				char.FindFirstChildOfClass("Humanoid")!.Health = charData.health
			} else {
				// New player or logged when dead
				// Uses spawnLocation by default
			}
		}
	}

	onDataSave(player: Player): SaveableDataObject {
		const charInfo = this.charInfo.get(player)
		if (!charInfo) {
			$warn(`No character info found for player ${player.Name}. Returning default data.`)
			return {
				key: SAVE_KEY,
				value: defaultData
			}
		}
		let savedPos = charInfo.health > 0 ? charInfo.lastPos : STARTER_SPAWN

		this.charInfo.delete(player)
		this.updateCharConnections.get(player)?.Disconnect()
		this.updateCharConnections.delete(player)
		return {
			key: SAVE_KEY,
			value: {
				pos: serializeCFrame(savedPos),
				health: charInfo.health
			}
		}
	}
}

print(1)
