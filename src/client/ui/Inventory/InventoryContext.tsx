import { atom, Atom } from "@rbxts/charm"
import React, { useState } from "@rbxts/react"
import { useAtom } from "@rbxts/react-charm"
import { TowerName } from "shared/config/TowerConfig"
import { EquipBar } from "shared/networking"

interface InventoryContextValue {
	inventoryOpen: Atom<boolean>
	unlockedItems: Set<TowerName>
	equipped: TowerName[]
	selectTower: (tower: TowerName) => void
	selectedTower: TowerName
	placeInSlot: (i: number) => void
	equipBarAtom: Atom<EquipBar>
}

const InventoryContext = React.createContext<InventoryContextValue | undefined>(undefined)

export const useInventory = () => {
	const ctx = React.useContext(InventoryContext)
	if (!ctx) throw "useInventory must be used within an InventoryProvider"
	return ctx
}
export function InventoryProvider({
	children,
	value
}: {
	children: React.ReactNode
	value: {
		unlocked: Atom<Set<TowerName>>
		inventoryOpen: Atom<boolean>
		equipBarAtom: Atom<EquipBar>
	}
}) {
	const equipBarAtom = value.equipBarAtom
	const unlockedItems = useAtom(value.unlocked)
	const [equipped, setEquipped] = useState<TowerName[]>(["None", "None", "None", "None"])
	const [selectedTower, setSelectedTower] = useState<TowerName>("None")

	const selectTower = (tower: TowerName) => setSelectedTower(tower)

	const placeInSlot = (slotIndex: number) => {
		if (selectedTower !== "None") {
			const newEquipped = [...equipped]
			newEquipped[slotIndex] = selectedTower
			setEquipped(newEquipped)
			setSelectedTower("None") // clear after placing
			equipBarAtom(prev => {
				const newBar = [...prev]
				newBar[slotIndex] = selectedTower
				return newBar
			})
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
				placeInSlot,
				equipBarAtom
			}}
		>
			{children}
		</InventoryContext.Provider>
	)
}
