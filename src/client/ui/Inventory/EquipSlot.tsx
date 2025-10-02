import { TowerName } from "shared/config/TowerConfig"
import React, { useContext } from "@rbxts/react"
import { atom, Atom } from "@rbxts/charm"
import { useAtom } from "@rbxts/react-charm"
import { useInventory } from "."

interface Props {
	index: number
	tower: TowerName
	onClick: () => void
	selectedAtom: Atom<TowerName>
}

export function EquipSlot({ selectedAtom, index, tower, onClick }: Props) {
	const selectedTower = useAtom(selectedAtom)

	const isSelected = selectedTower !== "None" && selectedTower === tower

	const { inventoryOpen, placeInSlot } = useInventory()

	const invOpen = useAtom(inventoryOpen)

	return (
		<imagebutton
			Size={new UDim2(0, 80, 0, 80)}
			BorderColor3={isSelected ? Color3.fromRGB(255, 255, 150) : Color3.fromRGB(0, 0, 0)}
			BorderSizePixel={2}
			Event={{
				MouseButton1Click: () => {
					if (!invOpen) {
						onClick()
					} else {
						placeInSlot(index)
					}
				}
			}}
		>
			{/* Tower name in center */}
			{tower !== "None" && (
				<textlabel
					Size={new UDim2(1, 0, 1, 0)}
					BackgroundTransparency={1}
					Text={tower}
					TextColor3={Color3.fromRGB(0, 0, 0)}
				/>
			)}

			{/* Index number in top-right */}
			<textlabel
				Size={new UDim2(0, 20, 0, 20)}
				Position={new UDim2(1, -22, 0, 2)} // top-right with small padding
				BackgroundTransparency={1}
				Text={tostring(index + 1)}
				TextColor3={Color3.fromRGB(0, 0, 0)}
				TextXAlignment="Right"
				TextYAlignment="Top"
				Font="SourceSansBold"
				TextSize={16}
			/>
		</imagebutton>
	)
}
