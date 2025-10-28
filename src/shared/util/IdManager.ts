/**
 * Increments up to max, then goes back to 0, doesn't reuse IDs that aren't released.
 */
export class IdManager {
	private currentId = 0
	private activeIds = new Set<number>()

	constructor(private readonly maxId: number = 10000) {
		this.maxId = math.max(1, maxId) // must be ≥1
	}

	public nextId(): number {
		let attempts = 0

		while (attempts < this.maxId) {
			// If currentId is unused, return it
			if (!this.activeIds.has(this.currentId)) {
				const id = this.currentId
				this.activeIds.add(id)

				// move to next id for next call
				this.currentId++
				if (this.currentId > this.maxId) this.currentId = 1

				return id
			}

			// advance and wrap if needed
			this.currentId++
			if (this.currentId > this.maxId) this.currentId = 1

			attempts++
		}

		error(`[IdManager] Ran out of available IDs (max ${this.maxId})`)
	}

	public release(id: number) {
		if (id <= 0 || id > this.maxId) return
		this.activeIds.delete(id)
	}
}
