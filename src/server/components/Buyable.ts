import { OnStart } from "@flamework/core"
import { Component, BaseComponent } from "@flamework/components"
import { ShopInfo, ShopItem } from "server/config/Shops"
import { MoneyService } from "server/services/MoneyService"
import { InventoryService } from "server/services/InventoryService"
import { BUY_COOLDOWN, BUY_RANGE, TAG_BUYABLE } from "shared/constants"
import { $print } from "rbxts-transform-debug"
import { ItemName } from "shared/enum"

interface BuyableInstance extends Model {
	promptPart: BasePart & {
		ProximityPrompt: ProximityPrompt
	}
}

interface Attributes {}

@Component({
	tag: TAG_BUYABLE
})
export class Buyable extends BaseComponent<Attributes, BuyableInstance> implements OnStart {
	private info: ShopItem
	private prompt: ProximityPrompt
	private lastBuy: number = 0

	constructor(
		private inventoryService: InventoryService,
		private moneyService: MoneyService
	) {
		super()
		assert(
			this.instance.Name in ShopInfo,
			`Buyable "${this.instance.GetFullName()}" not found in ShopConfig`
		)
		this.info = ShopInfo[this.instance.Name as keyof typeof ShopInfo]
		this.prompt = this.instance.promptPart.ProximityPrompt
		const { price } = this.info

		this.prompt.ActionText = `Buy ${this.instance.Name}: ${price}`
	}

	onStart() {
		this.prompt.Triggered.Connect(player => {
			if (os.clock() - this.lastBuy < BUY_COOLDOWN) return
			const char = player.Character
			const rootPart = char?.FindFirstChild("HumanoidRootPart") as BasePart | undefined
			if (!char || !rootPart) return
			if (this.instance.promptPart.Position.sub(rootPart.Position).Magnitude > BUY_RANGE) return

			const { price, product } = this.info
			$print(`Bought ${product}`)
			if (this.moneyService.getMoney(player) >= price) {
				this.moneyService.removeMoney(player, price)
				this.lastBuy = os.clock()
				// fix shitty type narrowing
				switch (typeOf(product)) {
					case "string":
						this.inventoryService.giveItem(player, product as ItemName)
						break

					case "function":
						;(product as (player: Player) => void)(player)
						break
				}
			}
		})
	}
}
