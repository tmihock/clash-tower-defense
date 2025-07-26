export function scaleModelToFit(model: Model, targetPart: BasePart) {
	const [modelCFrame, modelSize] = model.GetBoundingBox()

	const targetSize = targetPart.Size
	const scale = new Vector3(
		targetSize.X / modelSize.X,
		targetSize.Y / modelSize.Y,
		targetSize.Z / modelSize.Z
	)

	const baseCFrame = targetPart.CFrame

	// Loop through all BaseParts in the model
	model.GetDescendants().forEach(descendant => {
		if (descendant.IsA("BasePart")) {
			const relativeCFrame = modelCFrame.ToObjectSpace(descendant.CFrame)
			const newRelativePosition = relativeCFrame.Position.mul(scale)

			descendant.Size = descendant.Size.mul(scale)
			descendant.CFrame = baseCFrame.mul(
				CFrame.fromMatrix(
					newRelativePosition,
					relativeCFrame.RightVector,
					relativeCFrame.UpVector,
					relativeCFrame.LookVector
				)
			)
		}
	})
}
