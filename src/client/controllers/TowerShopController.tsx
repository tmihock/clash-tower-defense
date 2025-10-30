import { Controller, OnStart } from "@flamework/core"
import { atom } from "@rbxts/charm"
import { createRoot } from "@rbxts/react-roblox"
import { Players, UserInputService } from "@rbxts/services"
import { TowerShop } from "client/ui/TowerShop"
import { KEY_OPEN_TOWER_SHOP } from "shared/constants"
import React from "@rbxts/react"
import { ClientStateProvider } from "./ClientStateProvider"
import { TowerName } from "shared/config/TowerConfig"
import { Functions } from "client/networking"

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui

@Controller({})
export class TowerShopController implements OnStart {
	private visible = atom(false)

	constructor(private clientStateProvider: ClientStateProvider) {}

	onStart() {
		this.loadShopUI()
		UserInputService.InputBegan.Connect((input, gpe) => {
			if (gpe) return

			if (input.KeyCode === KEY_OPEN_TOWER_SHOP) {
				this.visible(prev => !prev)
			}
		})
	}

	private onPurchase(towerName: TowerName) {
		Functions.requestBuyTower.invoke(towerName).then(success => {
			if (success) {
				// this.successAnimation
			} else {
				// this.successSound
			}
		})
	}

	private loadShopUI() {
		const { money, exp } = this.clientStateProvider.playerState

		const root = createRoot(playerGui)

		root.render(
			<TowerShop
				visibleAtom={this.visible}
				moneyAtom={money}
				expAtom={exp}
				onPurchase={t => this.onPurchase(t)}
			/>
		)
	}
}
