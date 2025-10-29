import { Workspace } from "@rbxts/services"

export function SharedClock() {
	return Workspace.GetServerTimeNow()
}
