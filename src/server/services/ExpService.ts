import { Service, OnStart } from "@flamework/core"
import { DataIO, SaveableDataObject } from "./DataService"
import { $terrify } from "rbxts-transformer-t-new"
import { Events } from "server/networking"
import Signal from "@rbxts/lemon-signal"

const SAVE_KEY = "exp"

const tHasExp = $terrify<{
	[SAVE_KEY]: number
}>()

@Service({})
export class ExpService implements DataIO {
	private playerExp = new Map<Player, number>()
	private expChanged = new Map<Player, Signal<[newValue: number, oldValue: number]>>()

	public getExpChangedSignal(player: Player): Signal<[newValue: number, oldValue: number]> {
		return this.expChanged.get(player)!
	}

	public setExp(player: Player, amount: number) {
		const oldValue = this.playerExp.get(player) ?? 0
		this.playerExp.set(player, amount)
		Events.expChanged.fire(player, amount, oldValue)

		const exp = this.playerExp.get(player)
	}

	public addExp(player: Player, amount: number) {
		this.setExp(player, (this.playerExp.get(player) ?? 0) + amount)
	}

	onDataLoad(player: Player, data: Record<string, unknown>): void {
		if (tHasExp(data)) {
			this.setExp(player, data[SAVE_KEY])
		} else {
			this.setExp(player, 0)
		}
		this.expChanged.set(player, new Signal<[newValue: number, oldValue: number]>())
	}

	onDataSave(player: Player): SaveableDataObject<number> {
		const exp = this.playerExp.get(player) ?? 0
		this.playerExp.delete(player)
		this.expChanged.get(player)?.Destroy()
		this.expChanged.delete(player)
		return {
			key: SAVE_KEY,
			value: exp
		}
	}
}
