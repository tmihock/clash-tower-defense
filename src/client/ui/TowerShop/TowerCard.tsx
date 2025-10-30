import { Atom } from "@rbxts/charm"
import { useAtom } from "@rbxts/react-charm"
import { TowerConfig, TowerName } from "shared/config/TowerConfig"
import React, { useState, useEffect } from "@rbxts/react"

type FeedbackState = "success" | "failure" | "idle"

interface TowerCardProps {
	towerName: TowerName
	expAtom: Atom<number>
	moneyAtom: Atom<number>
	onPurchase: (towerName: TowerName) => void
}

export function TowerCard({ towerName, expAtom, moneyAtom, onPurchase }: TowerCardProps) {
	const exp = useAtom(expAtom)
	const money = useAtom(moneyAtom)
	const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle")

	const tower = TowerConfig[towerName]
	const canAfford = money >= tower.price
	const isUnlocked = exp >= tower.expReq
	const canBuy = canAfford && isUnlocked

	// Reset feedback after delay
	useEffect(() => {
		if (feedbackState === "idle") return

		const timeout = task.delay(0.3, () => {
			setFeedbackState("idle")
		})

		return () => {
			task.cancel(timeout)
		}
	}, [feedbackState])

	const handleClick = () => {
		if (canBuy) {
			onPurchase(towerName)
			setFeedbackState("success")
		} else {
			setFeedbackState("failure")
		}
	}

	const getButtonColor = () => {
		if (feedbackState === "success") return Color3.fromRGB(50, 255, 50)
		if (feedbackState === "failure") return Color3.fromRGB(255, 50, 50)
		return canBuy ? Color3.fromRGB(100, 200, 100) : Color3.fromRGB(80, 80, 80)
	}

	return (
		<frame
			Size={new UDim2(1, -20, 0, 100)}
			BackgroundColor3={Color3.fromRGB(60, 60, 60)}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, 8)} />

			{/* Tower Image Placeholder */}
			<frame
				Size={new UDim2(0, 80, 0, 80)}
				Position={new UDim2(0, 10, 0, 10)}
				BackgroundColor3={Color3.fromRGB(100, 100, 100)}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
				<textlabel
					Size={new UDim2(1, 0, 1, 0)}
					BackgroundTransparency={1}
					Text={tostring(tower.id)}
					TextSize={24}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					Font={Enum.Font.GothamBold}
				/>
			</frame>

			{/* Tower Info */}
			<frame
				Size={new UDim2(1, -180, 1, 0)}
				Position={new UDim2(0, 100, 0, 0)}
				BackgroundTransparency={1}
			>
				<textlabel
					Size={new UDim2(1, 0, 0, 25)}
					Position={new UDim2(0, 0, 0, 10)}
					BackgroundTransparency={1}
					Text={towerName}
					TextSize={18}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					Font={Enum.Font.GothamBold}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
				<textlabel
					Size={new UDim2(1, 0, 0, 20)}
					Position={new UDim2(0, 0, 0, 40)}
					BackgroundTransparency={1}
					Text={`💰 ${tower.price}`}
					TextSize={16}
					TextColor3={canAfford ? Color3.fromRGB(100, 255, 100) : Color3.fromRGB(255, 100, 100)}
					Font={Enum.Font.Gotham}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>
				{!isUnlocked && (
					<textlabel
						Size={new UDim2(1, 0, 0, 20)}
						Position={new UDim2(0, 0, 0, 65)}
						BackgroundTransparency={1}
						Text={`🔒 Requires ${tower.expReq} EXP`}
						TextSize={14}
						TextColor3={Color3.fromRGB(255, 200, 100)}
						Font={Enum.Font.Gotham}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				)}
			</frame>

			{/* Buy Button */}
			<textbutton
				Size={new UDim2(0, 60, 0, 40)}
				Position={new UDim2(1, -70, 0.5, -20)}
				BackgroundColor3={getButtonColor()}
				BorderSizePixel={0}
				Text={canBuy ? "BUY" : "---"}
				TextSize={16}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				Font={Enum.Font.GothamBold}
				AutoButtonColor={canBuy}
				Event={{
					MouseButton1Click: handleClick
				}}
			>
				<uicorner CornerRadius={new UDim(0, 6)} />
			</textbutton>
		</frame>
	)
}
