import { Component } from "@flamework/components"
import {
	ClientToServer,
	SharedComponent,
	SharedComponentNetwork
} from "@rbxts/shared-components-flamework"

interface State {
	ammo: number
}

@Component()
export class GunShared extends SharedComponent<State> {
	protected state = {
		ammo: 0
	}

	protected remotes = {
		shootBullet: SharedComponentNetwork.event<ClientToServer, [player: Player]>(),
		shootPlayer: SharedComponentNetwork.event<ClientToServer, [player: Player]>()
	}
}
