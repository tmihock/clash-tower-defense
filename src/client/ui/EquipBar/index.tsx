import React, { useState } from "@rbxts/react"
import { createPortal } from "react-roblox"
import { TowerName } from "shared/config/TowerConfig"
import { Players } from "@rbxts/services"
import { EquipSlot } from "./EquipSlot"
import { EquipBar } from "shared/networking"
import { Atom } from "@rbxts/charm"

function nextTower(tower: TowerName): TowerName {
	return "Barbarian"
}

interface Props {
	initial: EquipBar
	selectedAtom: Atom<TowerName>
	onClick: (slot: number, currentValue: TowerName) => void
}

// The equip bar with 4 slots
export function EquipBarUI({ selectedAtom, initial, onClick }: Props) {
	const [equipped, setEquipped] = useState<TowerName[]>(initial)

	const handleClick = (index: number) => {
		const newEquipped = [...equipped]
		newEquipped[index] = nextTower(newEquipped[index])
		// setEquipped(newEquipped);

		onClick(index, equipped[index])
	}

	return (
		<screengui ResetOnSpawn={false} key="EquipBar">
			<frame
				Size={new UDim2(0, 300, 0, 50)}
				Position={new UDim2(0.5, -150, 1, -100)}
				BackgroundTransparency={1}
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
		</screengui>
	)
}
