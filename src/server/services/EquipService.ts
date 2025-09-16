import { Service, OnStart } from "@flamework/core"
import { DataIO, SaveableDataObject } from "./DataService"
import { TowerName } from "shared/config/TowerConfig"
import { $terrify } from "rbxts-transformer-t-new"
import { Events } from "server/networking"
import { EquipBar } from "shared/networking"
import { $assert } from "rbxts-transform-debug"
import { InventoryService } from "./InventoryService"
import { EQUIP_BAR_SIZE } from "shared/constants"

const SAVE_KEY = "equipped"

const tHasEquipBar = $terrify<{
	[SAVE_KEY]: EquipBar
}>()

const defaultEquips: EquipBar = ["Barbarian"]

@Service({})
export class EquipService implements OnStart, DataIO {
	private playerEquips = new Map<Player, EquipBar>()

	constructor(private inventoryService: InventoryService) {}

	onStart() {
		Events.setEquipBar.connect((p, e) => this.setEquipBar(p, e, true))
		Events.updateEquipBar.connect((p, i, v) => this.updateEquipBar(p, i, v, true))
	}

	private setEquipBar(player: Player, equipBar: EquipBar, fromClient: boolean = false) {
		if (fromClient) {
			if (equipBar.size() > EQUIP_BAR_SIZE) return
			// Remove towers player doesn't own
			equipBar = equipBar.map(tower =>
				tower && this.inventoryService.playerHasTower(player, tower) ? tower : "None"
			)
		}

		this.playerEquips.set(player, equipBar)

		if (!fromClient) {
			Events.setEquipBar.fire(player, equipBar)
		}
	}

	public updateEquipBar(
		player: Player,
		index: number,
		tower: TowerName,
		fromClient: boolean = false
	) {
		if (fromClient) {
			if (index < 0 || index > EQUIP_BAR_SIZE) return
			if (!this.inventoryService.playerHasTower(player, tower)) return
		}

		this.getEquipBar(player)![index] = tower

		if (!fromClient) {
			Events.updateEquipBar.fire(player, index, tower)
		}
	}

	public getEquipBar(player: Player) {
		const equipBar = this.playerEquips.get(player)
		$assert(
			equipBar,
			`Attempt to get Player "${player.Name}"'s equip bar before their data has loaded.`
		)
		return equipBar
	}

	onDataLoad(player: Player, data: Record<string, unknown>) {
		let equipBar: EquipBar
		if (tHasEquipBar(data)) {
			equipBar = data[SAVE_KEY]
		} else {
			equipBar = table.clone(defaultEquips)
		}
		this.setEquipBar(player, equipBar, true)
	}

	onDataSave(player: Player): SaveableDataObject<EquipBar> {
		const equipBar = this.playerEquips.get(player)
		this.playerEquips.delete(player)

		return {
			key: SAVE_KEY,
			value: equipBar!
		}
	}
}
