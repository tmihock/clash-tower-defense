const loadingPlayers = new Set<Player>()

function waitForChildAsync(instance: Instance, childName: string): Promise<Instance> {
	return new Promise(resolve => {
		const child = instance.WaitForChild(childName)
		resolve(child)
	})
}

export function loadCharacterAsync(player: Player, waitFor?: string[]): Promise<Model> {
	return new Promise(resolve => {
		// Prevent double loads
		if (loadingPlayers.has(player)) {
			player.CharacterAdded.Wait() // just wait for current load to finish
			resolve(player.Character!)
			return
		}

		loadingPlayers.add(player)

		// Load character manually
		player.LoadCharacter()

		const onCharacter = (char: Model) => {
			const waitPromises = (waitFor ?? []).map(child => waitForChildAsync(char, child))
			Promise.all(waitPromises).then(() => {
				loadingPlayers.delete(player)
				resolve(char)
			})
		}

		if (player.Character) {
			onCharacter(player.Character)
		} else {
			player.CharacterAdded.Once(onCharacter)
		}
	})
}
