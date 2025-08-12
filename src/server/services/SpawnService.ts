/**
 * Handles player spawning
 * Players dont auto respawn, they might be changing roles or something
 */
import { Service, OnStart } from "@flamework/core"

@Service({})
export class SpawnService implements OnStart {
	onStart() {}
}
