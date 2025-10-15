import { OnStart, Service } from "@flamework/core"
import { t } from "@rbxts/t"
import { $terrify } from "rbxts-transformer-t-new"
import { MONEY_LEADERSTAT_NAME } from "shared/constants"
import { Events } from "server/networking"
import { PlayerStateProvider } from "./PlayerStateProvider"
import { OnPlayerAdded } from "./PlayerService"
import { subscribe } from "@rbxts/charm"
import Maid from "@rbxts/maid"

const SAVE_KEY = "coins"

const tHasMoney = $terrify<{
	[SAVE_KEY]: number
}>()

@Service({})
export class MoneyService implements OnPlayerAdded {
	private playersMoneyInstances = new Map<Player, NumberValue>()
	private leaderstatsInstances = new Map<Player, Folder>()

	constructor(private playerStateProvider: PlayerStateProvider) {}

	onPlayerAdded(player: Player) {
		const leaderstats = new Instance("Folder")
		leaderstats.Name = "leaderstats"
		leaderstats.Parent = player

		const moneyInstance = new Instance("NumberValue")
		moneyInstance.Name = MONEY_LEADERSTAT_NAME
		moneyInstance.Parent = leaderstats

		this.playersMoneyInstances.set(player, moneyInstance)
		this.leaderstatsInstances.set(player, leaderstats)

		this.playerStateProvider.subscribe(player, "money", newValue => {
			this.playersMoneyInstances.get(player)!.Value = newValue
		})
	}
}
