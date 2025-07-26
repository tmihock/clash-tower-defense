import { ClientReceiver } from "@flamework/networking/out/events/types"
import React, { useEffect, useState } from "@rbxts/react"
import { MAX_VITAL } from "shared/constants"
import { Vitals } from "shared/types"
import { VitalsBar } from "./VitalsBar"

interface VitalsUIProps {
	initialHunger: number
	initialThirst: number
	initialTemperature: number
	event: ClientReceiver<[vital: keyof Vitals, value: number]>
}

function getTemperatureColor(temp: number): Color3 {
	const normalized = math.clamp(temp / MAX_VITAL, 0, 1)
	// Blue (0, 0, 255) to Red (255, 0, 0)
	const red = math.floor(normalized * 255)
	const blue = math.floor((1 - normalized) * 255)
	return Color3.fromRGB(red, 0, blue)
}

export const VitalsUI: React.FC<VitalsUIProps> = ({ 
	initialHunger, 
	initialThirst, 
	initialTemperature, 
	event 
}) => {
	const [hunger, setHunger] = useState(initialHunger)
	const [thirst, setThirst] = useState(initialThirst)
	const [temperature, setTemperature] = useState(initialTemperature)

	useEffect(() => {
		const disconnect = event.connect((vital, value) => {
			switch (vital) {
				case "hunger":
					setHunger(value)
					break
				case "thirst":
					setThirst(value)
					break
				case "temperature":
					setTemperature(value)
					break
			}
		})

		return () => disconnect.Disconnect()
	}, [event])

	return (
		<screengui ResetOnSpawn={false} key="Vitals">
			{/* Hunger Bar */}
			<VitalsBar
				value={hunger}
				color={Color3.fromRGB(200, 100, 100)}
				position={UDim2.fromOffset(10, -30).add(UDim2.fromScale(0, 1))}
			/>

			{/* Thirst Bar */}
			<VitalsBar
				value={thirst}
				color={Color3.fromRGB(100, 100, 200)}
				position={UDim2.fromOffset(40, -30).add(UDim2.fromScale(0, 1))}
			/>

			{/* Temperature Bar */}
			<VitalsBar
				value={temperature}
				color={getTemperatureColor(temperature)}
				position={UDim2.fromOffset(70, -30).add(UDim2.fromScale(0, 1))}
			/>
		</screengui>
	)
}
