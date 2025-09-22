import { CollectionService } from "@rbxts/services"

export function findFirstAncestorWithTag(instance: Instance, tag: string): Instance | undefined {
	let current: Instance | undefined = instance

	while (current !== undefined && current !== game) {
		if (CollectionService.HasTag(current, tag)) {
			return current
		}
		current = current.Parent
	}

	return undefined
}
