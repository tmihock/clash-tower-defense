import { atom, Atom } from "@rbxts/charm"
import React, { useState } from "@rbxts/react"
import { useAtom } from "@rbxts/react-charm"
import { TowerName } from "shared/config/TowerConfig"
import { EquipBarProps, EquipBarUI } from "./EquipBar"
import { UnlockInventory } from "./UnlockInventory"
import { InventoryProvider } from "./InventoryContext"

export interface Props {
	visibleAtom: Atom<boolean>
	inventoryAtom: Atom<TowerName[]>

	equipBarProps: EquipBarProps
}

export function Inventory({ visibleAtom, inventoryAtom, equipBarProps }: Props) {
	return (
		<InventoryProvider
			value={{
				unlocked: inventoryAtom,
				inventoryOpen: visibleAtom,
				equipBarAtom: equipBarProps.initial
			}}
			children={
				<screengui ResetOnSpawn={false} Enabled={true} key="Inventory">
					<EquipBarUI {...equipBarProps} />
					<UnlockInventory inventoryAtom={inventoryAtom} />
				</screengui>
			}
		/>
	)
}
