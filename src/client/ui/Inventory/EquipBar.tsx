import React from "@rbxts/react"
import { TowerName } from "shared/config/TowerConfig"
import { EquipSlot } from "./EquipSlot"
import { EquipBar } from "shared/networking"
import { Atom } from "@rbxts/charm"
import { useInventory } from "./InventoryContext"

export interface EquipBarProps {
	initial: Atom<EquipBar>
	selectedAtom: Atom<TowerName>
	onClick: (slot: number, currentValue: TowerName) => void
}

// The equip bar with 4 slots
export function EquipBarUI({ selectedAtom, onClick }: EquipBarProps) {
	const { equipped } = useInventory()

	return (
		<frame
			Size={new UDim2(0, 300, 0, 50)}
			Position={new UDim2(0.5, -150, 1, -100)}
			BackgroundTransparency={1}
			key="EquipBar"
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				Padding={new UDim(0, 8)}
			/>
			{equipped.map((tower, i) => (
				<EquipSlot
					key={i}
					index={i}
					selectedAtom={selectedAtom}
					tower={tower}
					onClick={(tower: TowerName) => onClick(i, tower)}
				/>
			))}
		</frame>
	)
}
