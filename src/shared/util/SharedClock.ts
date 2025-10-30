import { Workspace } from "@rbxts/services"

/**
 * Returns the server's Unix time in seconds, this is the same between server and client.
 *
 * @returns The estimated Unix timestamp on the server.
 */
export function SharedClock() {
	return Workspace.GetServerTimeNow()
}
