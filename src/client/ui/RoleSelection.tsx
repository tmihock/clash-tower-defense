import React from "@rbxts/react"
import { ChoosableRole } from "shared/types"

interface RoleSelectionProps {
	onChoose: (role: ChoosableRole) => void
}

export function RoleSelection({ onChoose }: RoleSelectionProps) {
	return (
		<screengui ResetOnSpawn={false} IgnoreGuiInset={true} key="RoleSelection">
			<frame
				Size={UDim2.fromScale(0.4, 0.3)}
				Position={UDim2.fromScale(0.3, 0.35)}
				BackgroundColor3={Color3.fromRGB(40, 40, 40)}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
				<textlabel
					Size={UDim2.fromScale(1, 0.3)}
					BackgroundTransparency={1}
					Text="Choose Your Role"
					TextScaled={true}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					Font={Enum.Font.SourceSansBold}
				/>

				<textbutton
					Size={UDim2.fromScale(0.35, 0.35)}
					Position={UDim2.fromScale(0.1, 0.5)}
					BackgroundColor3={Color3.fromRGB(80, 80, 80)}
					Text="Outlaw"
					TextScaled={true}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					Font={Enum.Font.SourceSansBold}
					Event={{
						MouseButton1Click: () => onChoose("Outlaw"),
					}}
				>
					<uicorner CornerRadius={new UDim(0, 6)} />
				</textbutton>

				<textbutton
					Size={UDim2.fromScale(0.35, 0.35)}
					Position={UDim2.fromScale(0.55, 0.5)}
					BackgroundColor3={Color3.fromRGB(80, 80, 80)}
					Text="Marshall"
					TextScaled={true}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					Font={Enum.Font.SourceSansBold}
					Event={{
						MouseButton1Click: () => onChoose("Marshall"),
					}}
				>
					<uicorner CornerRadius={new UDim(0, 6)} />
				</textbutton>
			</frame>
		</screengui>
	)
}
