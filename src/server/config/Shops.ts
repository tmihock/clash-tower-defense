import { ItemName } from "../../shared/enum"
import { InventoryService } from "../services/InventoryService"
import { Dependency } from "@flamework/core"

/**
 * Keys are names of Buyable Instance
 * Prompt goes to Buy {key}: {price}
 */
export const ShopInfo = {
	Dynamite: {
		price: 0,
		product: "Dynamite"
	}
} satisfies Record<string, ShopItem>

export type ShopItem = {
	price: number
	product: ItemName | ((player: Player) => void)
}
