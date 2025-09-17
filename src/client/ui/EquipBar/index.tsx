import React, {useState} from "@rbxts/react"
import { createPortal } from "react-roblox";
import { TowerName } from "shared/config/TowerConfig";
import {Players} from "@rbxts/services"
import { EquipSlot } from "./EquipSlot";
import { EquipBar } from "shared/networking";

function nextTower(tower: TowerName): TowerName {
	return "Barbarian"
}

interface Props {
	initial: EquipBar,
	onClick: (slot: number, currentValue: TowerName) => void
}

// The equip bar with 4 slots
export function EquipBarUI({initial, onClick}: Props) {
  const [equipped, setEquipped] = useState<TowerName[]>(initial);

  const handleClick = (index: number) => {
    // Example behavior: toggle between empty and sample tower
    const newEquipped = [...equipped];
    newEquipped[index] = nextTower(newEquipped[index])
    // setEquipped(newEquipped);

	onClick(index, equipped[index])
  };

  return (
	<screengui ResetOnSpawn={false} key="EquipBar">
    <frame
      Size={new UDim2(0, 400, 0, 100)}
      Position={new UDim2(0.5, -200, 1, -120)}
      BackgroundTransparency={1}
    >
      <uilistlayout
        FillDirection={Enum.FillDirection.Horizontal}
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        Padding={new UDim(0, 8)}
      />
      {equipped.map((tower, i) => (
        <EquipSlot key={i} tower={tower} onClick={() => handleClick(i)} />
      ))}
    </frame>
	</screengui>
  );
}
