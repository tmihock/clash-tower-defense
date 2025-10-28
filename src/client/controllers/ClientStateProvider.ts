import { Controller, Modding, OnInit, OnStart } from "@flamework/core"
import { Atom, atom } from "@rbxts/charm"
import { Events } from "client/networking"
import { $terrify } from "rbxts-transformer-t-new"
import type { PlayerState, SyncKeys } from "server/services/PlayerStateProvider"
import { TowerName } from "shared/config/TowerConfig"

const SYNC_KEYS = Modding.inspect<SyncKeys[]>()

const tSyncKey = $terrify<SyncKeys>()

@Controller({})
export class ClientStateProvider implements OnInit {
	public selectedTower = atom<TowerName>("None")

	public playerState = {} as {
		[K in SyncKeys]: Atom<PlayerState[K]>
	}

	constructor() {
		for (const key of SYNC_KEYS) {
			;(this.playerState as Record<string, Atom<unknown>>)[key] = atom<unknown>(undefined)
		}
	}

	onInit() {
		Events.playerStateChanged.connect((key, state, prev) => {
			if (!tSyncKey(key)) return
			;(this.playerState[key] as Atom<any>)(state)
		})
	}
}
