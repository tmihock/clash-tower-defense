import { Atom } from "@rbxts/charm"
import React from "@rbxts/react"
import { useAtom } from "@rbxts/react-charm"
import { TowerName } from "shared/config/TowerConfig"

interface Props {
	hoveredTower: Atom<TowerName>
	visibleAtom: Atom<boolean>
	mousePosAtom: Atom<Vector2>
}

export function TooltipUI({ hoveredTower, visibleAtom, mousePosAtom }: Props) {
	const visible = useAtom(visibleAtom)
	const tower = useAtom(hoveredTower)
	const { X, Y } = useAtom(mousePosAtom)

	return (
		<screengui ResetOnSpawn={false} key="ToolTipGUI" IgnoreGuiInset={true} Enabled={visible}>
			<frame
				key="TooltipContainer"
				AnchorPoint={new Vector2(0, 0)}
				Position={UDim2.fromOffset(X + 10, Y + 5)}
				Size={UDim2.fromOffset(75, 40)}
				BackgroundTransparency={1}
				ZIndex={10}
			>
				<textlabel
					key="TooltipText"
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					Text={tower}
					TextColor3={new Color3(0.61, 0.32, 0.32)}
					TextStrokeColor3={new Color3(0, 0, 0)}
					TextStrokeTransparency={0}
					TextScaled={true}
					ZIndex={11}
					RichText={false}
				/>
			</frame>
		</screengui>
	)
}
