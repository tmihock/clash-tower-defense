import { TowerName } from "shared/config/TowerConfig";
import React from "@rbxts/react"

interface Props {
	tower: TowerName,
	onClick: () => void
}

// One slot in the equip bar
export function EquipSlot({ tower, onClick }: Props) {
  return (
	<imagebutton
	  Size={new UDim2(0, 80, 0, 80)}
	  BackgroundColor3={tower ? Color3.fromRGB(80, 170, 80) : Color3.fromRGB(200, 200, 200)}
	  BorderSizePixel={2}
	  Event={{
		MouseButton1Click: onClick,
	  }}
	>
	  {tower !== "None" && (
		<textlabel
		  Size={new UDim2(1, 0, 1, 0)}
		  BackgroundTransparency={1}
		  Text={tower}
		  TextColor3={Color3.fromRGB(0, 0, 0)}
		/>
	  )}
	</imagebutton>
  );
}