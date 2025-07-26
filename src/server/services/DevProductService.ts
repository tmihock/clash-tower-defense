import { Service, OnInit, OnStart } from "@flamework/core"
import { MarketplaceService, Players } from "@rbxts/services"
import { DataIO, SaveableDataObject } from "./DataService"
import { $terrify } from "rbxts-transformer-t-new"

const SAVE_KEY = "purchase_history"

type PurchaseCallback = (player: Player) => void

export type PurchaseInfo = {
	time: number // os.time()
	productId: number
}

const tPurchaseHistory = $terrify<PurchaseInfo[]>()

@Service({})
export class DevProductService implements OnStart, DataIO {
	private purchaseCallbacks = new Map<number, PurchaseCallback>()
	private purchaseHistory = new Map<Player, PurchaseInfo[]>()

	onStart() {
		MarketplaceService.ProcessReceipt = receiptInfo => {
			const player = Players.GetPlayerByUserId(receiptInfo.PlayerId)
			if (!player) return Enum.ProductPurchaseDecision.NotProcessedYet

			const callback = this.purchaseCallbacks.get(receiptInfo.ProductId)
			if (callback) {
				callback(player)
				this.logPurchase(player, receiptInfo.ProductId)
				return Enum.ProductPurchaseDecision.PurchaseGranted
			}

			return Enum.ProductPurchaseDecision.NotProcessedYet
		}
	}

	private logPurchase(player: Player, productId: number) {
		this.purchaseHistory.get(player)?.push({
			time: os.time(),
			productId: productId
		})
	}

	public registerCallback(productId: number, callback: PurchaseCallback) {
		this.purchaseCallbacks.set(productId, callback)
	}

	public promptProduct(player: Player, productId: number) {
		MarketplaceService.PromptProductPurchase(player, productId)
	}


	onDataLoad(player: Player, data: Record<string, unknown>): void {
		let purchaseHistory
		if (SAVE_KEY in data && tPurchaseHistory(data[SAVE_KEY])) {
			purchaseHistory = data[SAVE_KEY]
		} else {
			purchaseHistory = [] as PurchaseInfo[]
		}
		this.purchaseHistory.set(player, purchaseHistory)
	}

	onDataSave(player: Player): SaveableDataObject {
		const purchases = this.purchaseHistory.get(player)
		this.purchaseHistory.delete(player)
		return {
			key: SAVE_KEY,
			value: purchases
		}
	}
}
