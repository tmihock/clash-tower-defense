import { Flamework } from "@flamework/core"
import { $print } from "rbxts-transform-debug"

Flamework.addPaths("src/client/classes")
Flamework.addPaths("src/client/controllers")
Flamework.addPaths("src/client/components")

Flamework.ignite()
$print("Flamework client ignited!")
