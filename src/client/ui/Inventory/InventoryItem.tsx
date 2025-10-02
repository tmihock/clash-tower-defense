import { Atom } from "@rbxts/charm"
import React from "@rbxts/react"
import { TowerName } from "shared/config/TowerConfig"
import { useInventory } from "."

interface Props {
	tower: TowerName
	unlocked: boolean
}

export function InventoryItem({ tower, unlocked }: Props) {
	const { selectTower, selectedTower } = useInventory()

	const isSelected = selectedTower !== "None" && selectedTower === tower

	return (
		<frame
			Size={UDim2.fromOffset(120, 140)}
			BackgroundColor3={unlocked ? Color3.fromRGB(40, 120, 40) : Color3.fromRGB(80, 80, 80)}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, 8)} />

			<viewportframe
				Size={UDim2.fromOffset(100, 100)}
				Position={UDim2.fromScale(0.5, 0.1)}
				AnchorPoint={new Vector2(0.5, 0)}
				BackgroundTransparency={unlocked ? 0 : 0.4}
				BackgroundColor3={Color3.fromRGB(25, 25, 25)}
			>
				<uicorner CornerRadius={new UDim(0, 6)} />
				{/* TODO: insert tower preview model here */}
			</viewportframe>

			<textbutton
				Text={tower}
				Size={new UDim2(1, 0, 0, 30)}
				Position={UDim2.fromScale(0, 1)}
				AnchorPoint={new Vector2(0, 1)}
				TextScaled={true}
				BackgroundTransparency={1}
				TextColor3={unlocked ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(150, 150, 150)}
				Event={{ MouseButton1Click: () => selectTower(tower) }}
			/>

			{!unlocked && (
				<textlabel
					Text="Locked"
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					TextColor3={Color3.fromRGB(255, 80, 80)}
					TextScaled={true}
				/>
			)}
		</frame>
	)
}
