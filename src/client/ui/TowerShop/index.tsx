import { TowerConfig, TowerName } from "shared/config/TowerConfig"
import React from "@rbxts/react"
import { Modding } from "@flamework/core"
import { useAtom } from "@rbxts/react-charm"
import { Atom } from "@rbxts/charm"
import { TowerCard } from "./TowerCard"

const towerNames = Modding.inspect<Exclude<TowerName, "None">[]>()

export interface TowerShopProps {
	visibleAtom: Atom<boolean>

	expAtom: Atom<number>
	moneyAtom: Atom<number>
	onPurchase: (towerName: TowerName) => void
}

export function TowerShop({ visibleAtom, expAtom, moneyAtom, onPurchase }: TowerShopProps) {
	const visible = useAtom(visibleAtom)

	return (
		<screengui key="TowerShop" ResetOnSpawn={false} Enabled={visible}>
			<scrollingframe
				Size={new UDim2(0, 300, 0, 500)}
				Position={new UDim2(0, 10, 0, 10)}
				BackgroundColor3={Color3.fromRGB(40, 40, 40)}
				BorderSizePixel={0}
				CanvasSize={new UDim2(0, 0, 0, towerNames.size() * 120 + 10)}
				ScrollBarThickness={8}
			>
				<uilistlayout
					Padding={new UDim(0, 10)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
				/>
				<uipadding
					PaddingTop={new UDim(0, 10)}
					PaddingLeft={new UDim(0, 10)}
					PaddingRight={new UDim(0, 10)}
				/>

				{towerNames.map(towerName => {
					const tower = TowerConfig[towerName]

					return (
						<TowerCard
							key={towerName}
							towerName={towerName}
							moneyAtom={moneyAtom}
							expAtom={expAtom}
							onPurchase={onPurchase}
						/>
					)
				})}
			</scrollingframe>
		</screengui>
	)
}
