/**
 * TODO: When nobody in the server is choosing a team, hide Choosing team from leaderboard
 */
import { Service, OnStart } from "@flamework/core"
import { Events } from "server/networking"
import { Teams } from "@rbxts/services"
import { Role } from "shared/types"
import { InventoryService } from "./InventoryService"
import { STARTER_ITEMS_MARSHALL, STARTER_ITEMS_OUTLAW } from "shared/constants"

@Service({})
export class RoleSerivce implements OnStart {
	constructor(private inventoryService: InventoryService) {}

	onStart() {
		Events.chooseRole.connect((p, r) => this.setRole(p, r))
		Events.startChoosing.connect(p => this.startChoosing(p))
	}

	private startChoosing(player: Player) {
		this.setRole(player, "Choosing")
		this.inventoryService.clearInventory(player)
		const char = player.Character
		if (char) {
			char.Destroy()
		}
		// Pan camera around and stuff (menu)
	}

	private setRole(player: Player, role: Role) {
		const oldTeam = player.Team
		const newTeam = (Teams as RobloxTeams)[role]
		if (oldTeam === newTeam) return
		player.Team = newTeam

		switch (role) {
			case "Outlaw":
				this.inventoryService.giveItems(player, STARTER_ITEMS_OUTLAW)
				break
			case "Marshall":
				this.inventoryService.giveItems(player, STARTER_ITEMS_MARSHALL)
				break
			case "Choosing":
		}
	}
}
