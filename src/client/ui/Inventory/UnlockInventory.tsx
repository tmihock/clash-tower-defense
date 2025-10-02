import { Atom, atom } from "@rbxts/charm"
import { useAtom } from "@rbxts/react-charm"
import { PlaceableTowerName, TowerConfig, TowerName } from "shared/config/TowerConfig"
import React from "@rbxts/react"
import { InventoryItem } from "./InventoryItem"
import { Flamework } from "@flamework/core"

const ALL_TOWERS = [] as PlaceableTowerName[]

for (const [towerName, e] of pairs(TowerConfig)) {
	if (towerName !== "None") ALL_TOWERS.push(towerName)
}

export interface Props {
	visibleAtom: Atom<boolean>
	inventoryAtom: Atom<Set<TowerName>>
}
export function UnlockInventory({ visibleAtom, inventoryAtom }: Props) {
	const visible = useAtom(visibleAtom)
	const inventory = useAtom(inventoryAtom)

	return (
		<screengui ResetOnSpawn={false} Enabled={visible} key="Inventory">
			<frame
				Size={UDim2.fromScale(0.8, 0.7)}
				Position={UDim2.fromScale(0.1, 0.15)}
				BackgroundColor3={Color3.fromRGB(20, 20, 20)}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, 12)} />

				<scrollingframe
					Size={UDim2.fromScale(1, 1)}
					CanvasSize={new UDim2(0, 0, 0, 0)} // autosized by UIGridLayout
					ScrollBarThickness={6}
					BackgroundTransparency={1}
				>
					<uigridlayout
						CellSize={UDim2.fromOffset(130, 150)}
						CellPadding={UDim2.fromOffset(10, 10)}
						SortOrder="LayoutOrder"
					/>

					{ALL_TOWERS.map((tower, index) => (
						<InventoryItem
							key={`tower-${tower}-${index}`}
							tower={tower}
							unlocked={inventory.has(tower)}
						/>
					))}
				</scrollingframe>
			</frame>
		</screengui>
	)
}
