import React, { useContext, useState } from "@rbxts/react"
import { TowerName } from "shared/config/TowerConfig"
import { EquipSlot } from "./EquipSlot"
import { EquipBar } from "shared/networking"
import { Atom } from "@rbxts/charm"
import { useInventory } from "."

function nextTower(tower: TowerName): TowerName {
	return "Barbarian"
}

export interface EquipBarProps {
	initial: EquipBar
	selectedAtom: Atom<TowerName>
	onClick: (slot: number, currentValue: TowerName) => void
}

// The equip bar with 4 slots
export function EquipBarUI({ selectedAtom, onClick }: EquipBarProps) {
	const { equipped } = useInventory()

	const handleClick = (index: number) => {
		const newEquipped = [...equipped]
		newEquipped[index] = nextTower(newEquipped[index])
		// setEquipped(newEquipped);

		onClick(index, equipped[index])
	}

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
					onClick={() => handleClick(i)}
				/>
			))}
		</frame>
	)
}
