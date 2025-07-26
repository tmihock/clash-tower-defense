/**
 * Every service must verify that data is correct and that they are giving the correct data
 * Always typecheck and check for nil
 * Every service can access any saved data
 */

import { Service, OnStart, OnInit } from "@flamework/core"
import { DataStoreService, Players } from "@rbxts/services"
import { OnPlayerAdded, OnPlayerRemoving } from "./PlayerService"
import { Modding } from "@flamework/core"
import { t } from "@rbxts/t"
import { $print } from "rbxts-transform-debug"
import { $terrify } from "rbxts-transformer-t-new"

const DATA_STORE_NAME = "PlayerData"
const DATA_STORE = DataStoreService.GetDataStore(DATA_STORE_NAME)

const tIsRecord = $terrify<Record<string, unknown>>()

export interface SaveableDataObject<T = unknown> {
	key: string
	value: T
}

/**
 * Other services responsibility to validate data
 */
export interface OnDataLoad {
	onDataLoad(player: Player, data: Record<string, unknown>): void
}

/**
 * Retrieves data from service and saves
 */
export interface OnDataSave {
	onDataSave(player: Player): SaveableDataObject
}

export interface DataIO extends OnDataSave, OnDataLoad {}

function getKey(player: Player) {
	return `Player_${player.UserId}`
}

@Service({
	loadOrder: 0
})
export class DataService implements OnStart {
	private onLoadListeners = new Set<OnDataLoad>()
	private onSaveListeners = new Set<OnDataSave>()

	onStart() {
		Modding.onListenerAdded<OnDataLoad>(o => this.onLoadListeners.add(o))
		Modding.onListenerRemoved<OnDataLoad>(o => this.onLoadListeners.delete(o))

		Modding.onListenerAdded<OnDataSave>(o => this.onSaveListeners.add(o))
		Modding.onListenerRemoved<OnDataSave>(o => this.onSaveListeners.delete(o))

		Modding.onListenerAdded<DataIO>(o => this.onLoadListeners.add(o))
		Modding.onListenerRemoved<DataIO>(o => this.onLoadListeners.delete(o))
		Modding.onListenerAdded<DataIO>(o => this.onSaveListeners.add(o))
		Modding.onListenerRemoved<DataIO>(o => this.onSaveListeners.delete(o))

		game.BindToClose(() => {
			Players.GetPlayers().forEach(player => {
				this.saveData(player)
			})
			// save people
		})

		Players.GetPlayers().forEach(p => this.loadData(p))
		Players.PlayerAdded.Connect(p => this.loadData(p))
		Players.PlayerRemoving.Connect(p => this.saveData(p))
	}

	private loadData(player: Player): void {
		new Promise<Record<string, unknown>>((resolve, reject) => {
			let data = undefined as unknown
			try {
				;[data] = DATA_STORE.GetAsync(getKey(player))
			} catch (e) {
				reject(e)
			}
			if (tIsRecord(data)) {
				$print(`Loaded Data for: ${player.Name}`, data)
				resolve(data)
			} else {
				resolve({} as Record<string, unknown>)
			}
		})
			.then(data => {
				this.onLoadListeners.forEach(onDataLoad => {
					task.spawn(() => onDataLoad.onDataLoad(player, data))
				})
			})
			.catch(err => {
				player.Kick(`Data failed to load: ${err}`)
				warn(err)
			})
	}

	/**
	 * Runs all onDataSave lifecycle events
	 * @param player Player to save data to
	 */
	private saveData(player: Player) {
		const finalData = new Map<string, unknown>()
		this.onSaveListeners.forEach(onDataSave => {
			const dataObject = onDataSave.onDataSave(player)
			finalData.set(dataObject.key, dataObject.value)
		})

		new Promise((resolve, reject) => {
			resolve(DATA_STORE.SetAsync(getKey(player), finalData))
			$print(`Saved Data for: ${player.Name}`, finalData)
		}).catch(error)
	}
}
