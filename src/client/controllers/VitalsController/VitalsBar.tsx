import React from "@rbxts/react"
import { useMotion } from "@rbxts/pretty-react-hooks"
import { MAX_VITAL } from "shared/constants"

interface VitalsBarProps {
	value: number
	color: Color3
	position: UDim2
	size?: UDim2
}

export const VitalsBar: React.FC<VitalsBarProps> = ({ 
	value, 
	color, 
	position, 
	size = UDim2.fromOffset(20, 200) 
}) => {
	// Create animated motion for the fill scale
	const [fillScale, fillScaleMotion] = useMotion(math.clamp(value / MAX_VITAL, 0.05, 1))

	// Update fill scale when value changes
	React.useEffect(() => {
		const newFillScale = math.clamp(value / MAX_VITAL, 0.05, 1)
		fillScaleMotion.spring(newFillScale, {
			frequency: 0.1,
			damping: 1
		})
	}, [value, fillScaleMotion])

	return (
		<frame
			Size={size}
			Position={position}
			AnchorPoint={new Vector2(0, 1)}
			BackgroundColor3={Color3.fromRGB(60, 60, 60)}
		>
			<frame
				Size={fillScale.map(scale => UDim2.fromScale(1, scale))}
				Position={fillScale.map(scale => UDim2.fromScale(0, 1 - scale))}
				AnchorPoint={new Vector2(0, 0)}
				BackgroundColor3={color}
			/>
		</frame>
	)
} 