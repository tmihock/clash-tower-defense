import { Controller, OnStart } from "@flamework/core"
import { atom } from "@rbxts/charm"
import { TowerName } from "shared/config/TowerConfig"

/**
 * Used to stop circular dependencies when controllers only need to access eachothers state
 * ONLY stores state, doesn't edit it
 * Controllers should import eachother directly if possible
 */

@Controller({})
export class ClientStateProvider {
	public readonly selectedTower = atom<TowerName>("None")
	public readonly unlockedInventory = atom<Set<TowerName>>(new Set())
	public readonly money = atom(0)
	public readonly exp = atom(0)
}
