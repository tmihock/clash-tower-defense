import { Service } from "@flamework/core"
import { PlayerStateProvider } from "./PlayerStateProvider"
import { OnPlayerAdded, OnPlayerRemoving } from "./PlayerService"
import { useAtom } from "@rbxts/react-charm"
import { Atom } from "@rbxts/charm"
import React from "@rbxts/react"
import ReactRoblox, { createPortal, createRoot } from "@rbxts/react-roblox"

@Service({})
export class MoneyService implements OnPlayerAdded, OnPlayerRemoving {
	private leaderstatsRoots = new Map<Player, ReactRoblox.Root>()

	constructor(private playerStateProvider: PlayerStateProvider) {}

	onPlayerAdded(player: Player) {
		const { money, rebirth } = this.playerStateProvider.get(player)

		// ReactRoblox semantics require using a portal for some reason
		const root = createRoot(player.FindFirstChildOfClass("PlayerGui")!)
		root.render(createPortal(<Leaderstats money={money} rebirth={rebirth} />, player))
		this.leaderstatsRoots.set(player, root)
	}

	onPlayerRemoving(player: Player) {
		this.leaderstatsRoots.get(player)?.unmount()
		this.leaderstatsRoots.delete(player)
	}
}

interface LeaderstatsProps {
	money: Atom<number>
	rebirth: Atom<number>
}

function Leaderstats({ money, rebirth }: LeaderstatsProps) {
	const moneyVal = useAtom(money)
	const rebirthVal = useAtom(rebirth)

	return (
		<folder key="leaderstats">
			<numbervalue key="Money" Value={moneyVal} />
			<numbervalue key="Rebirth" Value={rebirthVal} />
		</folder>
	)
}
