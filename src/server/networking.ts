import { Networking } from "@flamework/networking"
import { Dependency } from "@flamework/core"
import { GlobalEvents, GlobalFunctions } from "shared/networking"

export const Events = GlobalEvents.createServer({})
export const Functions = GlobalFunctions.createServer({})
