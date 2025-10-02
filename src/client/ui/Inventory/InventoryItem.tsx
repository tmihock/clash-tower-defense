// InventoryItem.tsx
import React, { useCallback } from "@rbxts/react"
import { TowerName } from "shared/config/TowerConfig"
import { useInventory } from "./InventoryContext"

interface Props {
	tower: TowerName
	unlocked: boolean
}

export function InventoryItem({ tower, unlocked }: Props) {
	const { selectTower, selectedTower } = useInventory()
	const isSelected = selectedTower !== "None" && selectedTower === tower

	const onClick = useCallback(() => {
		if (unlocked) {
			if (!isSelected) {
				selectTower(tower)
			} else {
				selectTower("None")
			}
		}
	}, [unlocked, selectedTower, tower, selectTower])

	return (
		<imagebutton
			Size={UDim2.fromOffset(100, 120)}
			BackgroundTransparency={0}
			BorderSizePixel={2}
			BorderColor3={isSelected ? Color3.fromRGB(255, 255, 150) : Color3.fromRGB(0, 0, 0)}
			Event={{ MouseButton1Click: onClick }}
		>
			{/* Tower name in center */}
			<textlabel
				Size={UDim2.fromScale(1, 0.15)}
				Position={UDim2.fromScale(0, 0.85)}
				BackgroundTransparency={1}
				Text={tower}
				TextColor3={unlocked ? Color3.fromRGB(20, 20, 20) : Color3.fromRGB(140, 8, 8)}
				TextScaled={true}
				Font="SourceSansBold"
			/>

			{/* Preview slot */}
			<viewportframe
				Size={UDim2.fromOffset(80, 80)}
				Position={UDim2.fromScale(0.5, 0.1)}
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={0.5}
				BackgroundColor3={Color3.fromRGB(25, 25, 25)}
			>
				{/* TODO: insert tower preview model */}
			</viewportframe>

			{/* Locked overlay */}
			{!unlocked && (
				<textlabel
					Text="Locked"
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					TextColor3={Color3.fromRGB(255, 0, 0)}
					TextScaled={true}
					Font="SourceSansBold"
				/>
			)}
		</imagebutton>
	)
}
