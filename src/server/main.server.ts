import { Flamework } from "@flamework/core"
import { $print } from "rbxts-transform-debug"
import { Players } from "@rbxts/services"

Players.CharacterAutoLoads = false

Flamework.addPaths("src/server/classes")
Flamework.addPaths("src/server/services")
Flamework.addPaths("src/server/components")

Flamework.ignite()
$print("Flamework server ignited!")
