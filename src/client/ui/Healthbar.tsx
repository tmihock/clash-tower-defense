import React, { useEffect, useState } from "@rbxts/react"
import { useMotion } from "@rbxts/pretty-react-hooks"
import { Events } from "client/networking"
import { MAX_HEALTH } from "shared/constants"
import { Atom } from "@rbxts/charm"
import { useAtom } from "@rbxts/react-charm"

interface Props {
	healthAtom: Atom<number>
}

export function HealthBar({ healthAtom }: Props) {
	const health = useAtom(healthAtom)
	const [displayHealth, setDisplayHealth] = useState(health)

	// Create animated motion for the fill scale
	const [fillScale, fillScaleMotion] = useMotion(math.clamp(health / 100, 0.05, 1))

	useEffect(() => {
		const disconnect = Events.healthChanged.connect(value => {
			setDisplayHealth(value)
			// Animate to new fill scale over 1 second
			const newFillScale = math.clamp(value / MAX_HEALTH, 0.05, 1)
			fillScaleMotion.spring(newFillScale, {
				frequency: 0.1, // Controls speed (higher = faster)
				damping: 1 // Controls bounce (1 = no bounce, 0 = lots of bounce)
			})
		})

		return () => disconnect.Disconnect()
	}, [health])

	return (
		<screengui ResetOnSpawn={false} key="HealthBar">
			<frame
				Size={UDim2.fromOffset(20, 200)}
				Position={UDim2.fromOffset(10, -30).add(UDim2.fromScale(0, 1))} // bottom left corner
				AnchorPoint={new Vector2(0, 1)}
				BackgroundColor3={Color3.fromRGB(60, 60, 60)}
			>
				<frame
					Size={fillScale.map(scale => UDim2.fromScale(1, scale))}
					Position={fillScale.map(scale => UDim2.fromScale(0, 1 - scale))}
					AnchorPoint={new Vector2(0, 0)}
					BackgroundColor3={Color3.fromRGB(200, 100, 100)}
				/>
			</frame>
		</screengui>
	)
}
