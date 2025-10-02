// UnlockInventory.tsx
import { Atom } from "@rbxts/charm"
import { useAtom } from "@rbxts/react-charm"
import { PlaceableTowerName, TowerConfig, TowerName } from "shared/config/TowerConfig"
import React from "@rbxts/react"
import { InventoryItem } from "./InventoryItem"
import { useInventory } from "./InventoryContext"

const ALL_TOWERS = [] as PlaceableTowerName[]
for (const [towerName, info] of pairs(TowerConfig)) {
	if (towerName !== "None") ALL_TOWERS[info.id - 1] = towerName
}
print(ALL_TOWERS)

export interface Props {
	inventoryAtom: Atom<Set<TowerName>>
}

export function UnlockInventory({ inventoryAtom }: Props) {
	const { inventoryOpen } = useInventory()
	const inventory = useAtom(inventoryAtom)
	const visible = useAtom(inventoryOpen)

	return (
		<scrollingframe
			Visible={visible}
			Size={UDim2.fromScale(0.8, 0.7)}
			Position={UDim2.fromScale(0.1, 0.15)}
			CanvasSize={new UDim2(0, 0, 0, 0)}
			ScrollBarThickness={6}
			BorderSizePixel={0}
			BackgroundTransparency={0.5}
			key="ScrollingFrame"
		>
			<uipadding
				PaddingBottom={new UDim(0, 10)}
				PaddingTop={new UDim(0, 10)}
				PaddingLeft={new UDim(0, 10)}
				PaddingRight={new UDim(0, 10)}
				key="UiPadding"
			/>

			<uigridlayout
				CellSize={UDim2.fromOffset(100, 120)}
				CellPadding={UDim2.fromOffset(10, 10)}
				SortOrder="Name"
				key="UiGridLayout"
			/>

			{ALL_TOWERS.map((tower, index) => (
				<InventoryItem key={`${index}`} tower={tower} unlocked={inventory.has(tower)} />
			))}
		</scrollingframe>
	)
}
