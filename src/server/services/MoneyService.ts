import { Service } from "@flamework/core"
import { DataIO, SaveableDataObject } from "./DataService"
import { t } from "@rbxts/t"
import { $terrify } from "rbxts-transformer-t-new"
import { MONEY_LEADERSTAT_NAME } from "shared/constants"
import { Events } from "server/networking"

const SAVE_KEY = "coins"

const tHasMoney = $terrify<{
	[SAVE_KEY]: number
}>()

@Service({})
export class MoneyService implements DataIO {
	private playersMoneyInstances = new Map<Player, NumberValue>()
	private leaderstatsInstances = new Map<Player, Folder>()

	public setLeaderstat(player: Player, leaderstat: string, value: number) {
		return new Promise<void>(resolve => {
			while (!this.leaderstatsInstances.has(player)) task.wait() // Load order

			const leaderstatValue = this.leaderstatsInstances
				.get(player)!
				.FindFirstChild(leaderstat) as NumberValue
			const oldValue = leaderstatValue.Value
			leaderstatValue.Value = value
			Events.moneyChanged.fire(player, value, oldValue)
			resolve()
		})
	}

	public setMoney(player: Player, amount: number) {
		const moneyInstance = this.playersMoneyInstances.get(player)
		assert(moneyInstance, `Leaderstats not loaded`)
		moneyInstance.Value = math.floor(amount)
	}

	public addMoney(player: Player, amount: number) {
		this.setMoney(player, this.getMoney(player) + amount)
	}

	public removeMoney(player: Player, amount: number) {
		this.setMoney(player, this.getMoney(player) - amount)
	}

	public getMoney(player: Player): number {
		const money = this.playersMoneyInstances.get(player)
		assert(money, `Money not loaded for player ${player.Name}`)
		return money.Value
	}

	public getMoneyChangedSignal(player: Player): RBXScriptSignal {
		return this.playersMoneyInstances.get(player)!.GetPropertyChangedSignal("Value")
	}

	onDataLoad(player: Player, data: Record<string, unknown>): void {
		const leaderstats = new Instance("Folder")
		leaderstats.Name = "leaderstats"
		leaderstats.Parent = player

		const moneyInstance = new Instance("NumberValue")
		moneyInstance.Name = MONEY_LEADERSTAT_NAME
		moneyInstance.Parent = leaderstats

		this.playersMoneyInstances.set(player, moneyInstance)
		this.leaderstatsInstances.set(player, leaderstats)

		if (tHasMoney(data)) {
			this.setMoney(player, data[SAVE_KEY])
		} else {
			this.setMoney(player, 0)
		}
	}

	onDataSave(player: Player): SaveableDataObject<number> {
		const playerMoney = this.getMoney(player)
		this.playersMoneyInstances.delete(player)
		this.leaderstatsInstances.delete(player)
		return {
			key: SAVE_KEY,
			value: playerMoney
		}
	}
}
