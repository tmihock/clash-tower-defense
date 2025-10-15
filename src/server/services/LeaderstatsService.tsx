import { Service } from "@flamework/core"
import { PlayerStateProvider } from "./PlayerStateProvider"
import { OnPlayerAdded } from "./PlayerService"
import { useAtom } from "@rbxts/react-charm"
import { Atom } from "@rbxts/charm"
import React from "@rbxts/react"
import { createRoot } from "@rbxts/react-roblox"

@Service({})
export class LeaderstatsService implements OnPlayerAdded {
	constructor(private playerStateProvider: PlayerStateProvider) {}

	onPlayerAdded(player: Player) {
		const { rebirth, money } = this.playerStateProvider.get(player)

		const root = createRoot(player)
		root.render(<Leaderstats rebirth={rebirth} money={money} />)
	}
}

function Leaderstats(props: { rebirth: Atom<number>; money: Atom<number> }) {
	const rebirth = useAtom(props.rebirth)
	const money = useAtom(props.money)

	return (
		<folder key="leaderstats">
			<numbervalue key="money" Value={money} />
			<numbervalue key="rebirth" Value={rebirth} />
		</folder>
	)
}
