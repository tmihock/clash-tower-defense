import { Service } from "@flamework/core"
import { atom } from "@rbxts/charm"

@Service({})
export class ServerStateProvider {
	public readonly e = atom(2)
}
