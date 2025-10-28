import { Service, OnStart } from "@flamework/core"
import { $terrify } from "rbxts-transformer-t-new"
import { Events } from "server/networking"
import { EquipBar } from "shared/networking"
import { PlayerStateProvider } from "./PlayerStateProvider"

const SAVE_KEY = "equipped"

const tHasEquipBar = $terrify<{
	[SAVE_KEY]: EquipBar
}>()

const defaultEquips: EquipBar = ["Barbarian"]

@Service({})
export class EquipService implements OnStart {
	constructor(private playerStateProvider: PlayerStateProvider) {}

	onStart() {
		Events.setEquipBar.connect((p, e) => this.setEquipBar(p, e))
	}

	// USED INTERNALLY ONLY, DOES NOT SYNC
	private setEquipBar(player: Player, equipBar: EquipBar) {
		this.playerStateProvider.get(player)!.equipped(old => {
			return table.clone(equipBar)
		})
	}
}
