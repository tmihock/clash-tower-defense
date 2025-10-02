import { atom, Atom } from "@rbxts/charm"
import React, { useState } from "@rbxts/react"
import { useAtom } from "@rbxts/react-charm"
import { PlaceableTowerName, TowerName } from "shared/config/TowerConfig"
import { EquipBar } from "shared/networking"
import { EquipBarProps, EquipBarUI } from "./EquipBar"
import { UnlockInventory } from "./UnlockInventory"

export interface Props {
	visibleAtom: Atom<boolean>
	inventoryAtom: Atom<Set<TowerName>>

	equipBarProps: EquipBarProps
}

const InventoryContext = React.createContext({
	inventoryOpen: atom(false),
	unlockedItems: new Set<TowerName>(),
	equipped: new Array<TowerName>(),
	selectTower: (towers: TowerName) => {},
	selectedTower: "None" as TowerName,
	placeInSlot: (i: number) => {}
})

export const useInventory = () => React.useContext(InventoryContext)

function InventoryProvider({
	children,
	value
}: {
	children: React.ReactNode
	value: { unlocked: Atom<Set<TowerName>>; inventoryOpen: Atom<boolean> }
}) {
	const unlockedItems = useAtom(value.unlocked)

	const [equipped, setEquipped] = React.useState<TowerName[]>(["None", "None", "None", "None"])

	const [selectedTower, setSelectedTower] = useState<TowerName>("None")

	const selectTower = (tower: TowerName) => setSelectedTower(tower)

	const placeInSlot = (slotIndex: number) => {
		if (selectedTower !== "None") {
			const newEquipped = [...equipped]
			newEquipped[slotIndex] = selectedTower
			setEquipped(newEquipped)
			setSelectedTower("None") // clear after placing
		}
	}

	const { inventoryOpen } = value

	return (
		<InventoryContext.Provider
			value={{
				inventoryOpen,
				unlockedItems,
				equipped,
				selectedTower,
				selectTower,
				placeInSlot
			}}
		>
			{children}
		</InventoryContext.Provider>
	)
}

export function Inventory({ visibleAtom, inventoryAtom, equipBarProps }: Props) {
	const visible = useAtom(visibleAtom)

	return (
		<InventoryProvider
			value={{ unlocked: inventoryAtom, inventoryOpen: visibleAtom }}
			children={
				<screengui ResetOnSpawn={false} Enabled={visible} key="Inventory">
					<EquipBarUI {...equipBarProps} />
					<UnlockInventory visibleAtom={visibleAtom} inventoryAtom={inventoryAtom} />
				</screengui>
			}
		/>
	)
}
