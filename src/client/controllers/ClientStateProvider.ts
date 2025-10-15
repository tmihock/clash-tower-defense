import { Controller, Modding, OnStart } from "@flamework/core"
import { Atom, atom } from "@rbxts/charm"
import { Events } from "client/networking"
import { $terrify } from "rbxts-transformer-t-new"
import type { PlayerState, SyncKeys } from "server/services/PlayerStateProvider"

const SYNC_KEYS = Modding.inspect<SyncKeys[]>()

const tSyncKey = $terrify<SyncKeys>()

@Controller({})
export class ClientStateProvider implements OnStart {
	public state: {
		[K in SyncKeys]: Atom<PlayerState[K]>
	}

	constructor() {
		this.state = {} as any
		for (const key of SYNC_KEYS) {
			this.state[key] = atom<PlayerState[typeof key]>() as Atom<PlayerState[typeof key]>
		}
	}

	onStart() {
		Events.playerStateChanged.connect((key, state, prev) => {
			if (!tSyncKey(key)) return
			this.state[key](state as PlayerState[typeof key])
		})
	}
}
