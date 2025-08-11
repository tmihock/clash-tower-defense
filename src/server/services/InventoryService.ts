import { Service, OnInit, OnStart } from "@flamework/core"
import { DataIO, SaveableDataObject } from "./DataService"
import { $terrify } from "rbxts-transformer-t-new"
import { AvatarEditorService, CollectionService, ReplicatedStorage } from "@rbxts/services"
import { OnPlayerAdded } from "./PlayerService"
import { $assert } from "rbxts-transform-debug"
import { KEEP_INVENTORY_BETWEEN_SESSIONS, KEEP_INVENTORY_ON_DEATH } from "shared/constants"
import { ItemName } from "shared/enum"

const SAVE_KEY = "inventory"
const itemFolder = ReplicatedStorage.Items

const tHasInv = $terrify<{
	[SAVE_KEY]: ItemInfo[]
}>()

export interface ItemInfo {
	name: string
	attributes: Record<string, AttributeValue>
}

@Service({})
export class InventoryService implements DataIO {
	private loadedPlayers = new Set<Player>()
	private playerBackpacks = new Map<Player, Backpack>() // Backpack instance
	private backpackSaves = new Map<Player, Folder>() // Folder while character is not loaded
	private playerHeldTools = new Map<Player, Tool | undefined>() // last held tool, only overridden, use getHeld to get the current held tool

	// make store
	public giveItem(player: Player, name: ItemName): void
	public giveItem(player: Player, item: ItemInfo): void
	public giveItem(player: Player, arg: string | ItemInfo) {
		const loaded = this.loadedPlayers.has(player)
		const backpack = player.FindFirstChildOfClass("Backpack")
		const saveFolder = this.backpackSaves.get(player)

		const name = typeIs(arg, "string") ? arg : arg.name
		const attributes = typeIs(arg, "string")
			? ({} as Record<string, AttributeValue>)
			: arg.attributes

		const toolTemplate = itemFolder.FindFirstChild(name)
		if (!toolTemplate || !toolTemplate.IsA("Tool")) {
			error(`Item ${name} not found in ReplicatedStorage`)
		}

		const clone = toolTemplate.Clone()
		for (const [k, v] of pairs(attributes)) {
			clone.SetAttribute(k, v)
		}

		let activeFolder = backpack || saveFolder
		if (!loaded) activeFolder = saveFolder // If method caller is onDataLoad

		if (activeFolder) {
			clone.Parent = activeFolder
			const tag = clone.GetAttribute("tag")
			if (tag && typeIs(tag, "string")) CollectionService.AddTag(tag) // Creates component
		} else {
			error(`No backpack or save folder found for player ${player.Name}`)
		}
	}

	public removeItem(player: Player, item: Tool): void {
		if (this.playerOwnsItem(player, item)) {
			item.Destroy()
		} else {
			print(item.GetFullName())
		}
	}

	public playerOwnsItem(player: Player, item: Tool): boolean {
		const backpack = this.playerBackpacks.get(player)
		if (!backpack) return false
		const backpackItems = backpack.GetChildren()
		const backpackStorage = this.backpackSaves.get(player)
		if (!backpackStorage) return false
		const storageItems = backpackStorage.GetChildren()

		return (
			backpackItems.includes(item) ||
			storageItems.includes(item) ||
			item.Parent === player.Character
		)
	}

	/**
	 * Returns true if a tool of name `name` is in either Backpack or player's character
	 * Assumes there isn't another instance with same name but isnt a tool
	 */
	public playerHasItemOfNameInInventory(player: Player, name: ItemName): boolean {
		const char = player.Character
		if (!char) return false

		const item = this.playerBackpacks.get(player)?.FindFirstChild(name) ?? char.FindFirstChild(name)

		return item?.IsA("Tool") || false
	}
	/**
	 * Returns all items the player owns, including those in their backpack, stored items, and held tools.
	 */
	public getOwnedItems(player: Player): Tool[] {
		const backpackItems = this.playerBackpacks.get(player)?.GetChildren() ?? []
		const storedItems = this.backpackSaves.get(player)?.GetChildren() ?? []
		const heldTool = this.getHeld(player)

		const allTools = [...backpackItems, ...storedItems]
		if (heldTool && !allTools.includes(heldTool)) {
			allTools.push(heldTool)
		}
		return allTools.filter(t => t.IsA("Tool")) as Tool[]
	}

	/**
	 * ONLY returns the tool currently held by the player.
	 * If the player is leaving, returns undefined
	 */
	public getHeld(player: Player): Tool | undefined {
		const lastHeld = this.playerHeldTools.get(player)
		if (lastHeld && lastHeld.Parent === player.Character) {
			return lastHeld
		}
		return undefined
	}

	private getToolsInInstance(folder: Instance): Tool[] {
		return folder.GetChildren().filter(item => item.IsA("Tool")) as Tool[]
	}

	/**
	 * Sets up connections for when the player's character spawns or despawns.
	 * - Tracks backpack
	 * - Restores saved tools
	 * - Monitors tool equip/unequip
	 * - Handles death behavior
	 */
	private keepInventory(player: Player) {
		player.CharacterAdded.Connect(character => {
			task.wait()
			const backpack = player.WaitForChild("Backpack") as Backpack
			this.playerBackpacks.set(player, backpack)

			this.restoreToolsToBackpack(player)
			this.monitorEquippedTools(player, character)
			if (KEEP_INVENTORY_ON_DEATH) {
				this.handleDeathStorage(player, character)
			}
		})
	}

	/**
	 * Moves previously saved tools from the player's private storage folder
	 * into their Backpack once their character has spawned.
	 */
	private restoreToolsToBackpack(player: Player) {
		task.defer(() => {
			const storage = this.backpackSaves.get(player)
			const backpack = this.playerBackpacks.get(player)
			if (!(storage && backpack)) return
			this.getToolsInInstance(storage).forEach(tool => {
				tool.Parent = backpack
			})
		})
	}

	/**
	 * Tracks which tool the player is currently holding.
	 * This uses ChildAdded/ChildRemoved on the Character to detect Tool equip/unequip events.
	 */
	private monitorEquippedTools(player: Player, character: Model) {
		// Listen for tools being equipped/unequipped
		character.ChildAdded.Connect(child => {
			if (!child.IsA("Tool")) return

			this.playerHeldTools.set(player, child)
		})

		// Initial check
		const tool = character.FindFirstChildOfClass("Tool")
		if (tool && tool.IsA("Tool")) {
			this.playerHeldTools.set(player, tool)
		} else {
			this.playerHeldTools.delete(player)
		}
	}

	/**
	 * When the player dies, saves their held tool and backpack contents into their storage folder.
	 */
	private handleDeathStorage(player: Player, character: Model) {
		const humanoid = character.WaitForChild("Humanoid") as Humanoid

		humanoid.Died.Connect(() => {
			const storage = this.backpackSaves.get(player)
			if (!storage) return

			// Save held tool
			const held = this.playerHeldTools.get(player)
			if (held) held.Clone().Parent = storage

			// Save backpack tools
			const backpack = player.FindFirstChildOfClass("Backpack")
			if (backpack) {
				this.getToolsInInstance(backpack).forEach(tool => {
					tool.Clone().Parent = storage
				})
			}
		})
	}

	/**
	 * Creates player's `BackpackStorage` folder used
	 * to hold items when their character is dead or hasn't spawned.
	 */
	private setupBackpackStorage(player: Player) {
		if (this.backpackSaves.has(player)) return
		const backpackStorage = new Instance("Folder")
		this.backpackSaves.set(player, backpackStorage)
		backpackStorage.Name = "BackpackStorage"
		backpackStorage.Parent = player
	}

	onDataLoad(player: Player, data: Record<string, unknown>) {
		this.setupBackpackStorage(player)
		this.keepInventory(player)

		if (!KEEP_INVENTORY_BETWEEN_SESSIONS) {
			this.loadedPlayers.add(player)
			return
		}

		let inv
		if (tHasInv(data)) {
			inv = data[SAVE_KEY] as ItemInfo[]
		} else {
			inv = [] as ItemInfo[]
		}

		Promise.all(inv.map(item => this.giveItem(player, item))).await() // Give all items asynchronously, and wait for them to finish
		this.loadedPlayers.add(player)
	}

	onDataSave(player: Player): SaveableDataObject<ItemInfo[]> {
		const inventory = this.serializeInventory(player)
		this.playerBackpacks.delete(player)
		this.backpackSaves.delete(player)
		this.playerHeldTools.delete(player)
		this.loadedPlayers.delete(player)

		if (!KEEP_INVENTORY_BETWEEN_SESSIONS) {
			return {
				key: SAVE_KEY,
				value: []
			}
		} else {
			return {
				key: SAVE_KEY,
				value: inventory
			}
		}
	}

	private serializeInventory(player: Player): ItemInfo[] {
		const owned = this.getOwnedItems(player)

		const lastHeld = this.playerHeldTools.get(player)
		if (lastHeld && !owned.includes(lastHeld)) {
			owned.push(lastHeld)
		}

		return owned.map(tool => this.serializeTool(tool))
	}

	private serializeTool(tool: Tool): ItemInfo {
		return {
			name: tool.Name,
			attributes: tool.GetAttributes() as unknown as Record<string, AttributeValue>
		}
	}
}
