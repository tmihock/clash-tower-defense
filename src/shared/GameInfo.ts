import { Controller, Service } from "@flamework/core"

export const PlaceIds: Record<number, GameMode> = {
	[100]: "Lobby",
	[101]: "d"
}

export type GameMode = "Lobby" | "d"

export const Gamemode = PlaceIds[game.PlaceId]

export interface OnLobbyStart {
	onLobbyStart(): void
}

export interface OnGameStart {
	onGameStart(): void
}

@Controller({})
@Service({})
export class GameInfo implements OnStart, OnInit {}
