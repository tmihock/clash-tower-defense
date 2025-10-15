interface Workspace extends Model {
	Enemies: Folder
	Map: Folder & {
		spawnPosition: PVInstance

		Baseplate: Part
		Rig: Model & {
			LeftLowerArm: MeshPart & {
				LeftLowerArm: WrapTarget
				OriginalSize: Vector3Value
				LeftElbowRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				LeftElbow: Motor6D
				AvatarPartScaleType: StringValue
				LeftWristRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
			}
			Animate: LocalScript & {
				point: StringValue & {
					PointAnim: Animation
				}
				climb: StringValue & {
					ClimbAnim: Animation
				}
				cheer: StringValue & {
					CheerAnim: Animation
				}
				dance3: StringValue & {
					Animation2: Animation & {
						Weight: NumberValue
					}
					Animation3: Animation & {
						Weight: NumberValue
					}
					Animation1: Animation & {
						Weight: NumberValue
					}
				}
				toolnone: StringValue & {
					ToolNoneAnim: Animation
				}
				dance: StringValue & {
					Animation2: Animation & {
						Weight: NumberValue
					}
					Animation3: Animation & {
						Weight: NumberValue
					}
					Animation1: Animation & {
						Weight: NumberValue
					}
				}
				ScaleDampeningPercent: NumberValue
				fall: StringValue & {
					FallAnim: Animation
				}
				laugh: StringValue & {
					LaughAnim: Animation
				}
				idle: StringValue & {
					Animation2: Animation & {
						Weight: NumberValue
					}
					Animation1: Animation & {
						Weight: NumberValue
					}
				}
				jump: StringValue & {
					JumpAnim: Animation
				}
				sit: StringValue & {
					SitAnim: Animation
				}
				run: StringValue & {
					RunAnim: Animation
				}
				swim: StringValue & {
					Swim: Animation
				}
				mood: StringValue & {
					Animation1: Animation
				}
				wave: StringValue & {
					WaveAnim: Animation
				}
				PlayEmote: BindableFunction
				toollunge: StringValue & {
					ToolLungeAnim: Animation
				}
				toolslash: StringValue & {
					ToolSlashAnim: Animation
				}
				swimidle: StringValue & {
					SwimIdle: Animation
				}
				dance2: StringValue & {
					Animation2: Animation & {
						Weight: NumberValue
					}
					Animation3: Animation & {
						Weight: NumberValue
					}
					Animation1: Animation & {
						Weight: NumberValue
					}
				}
				walk: StringValue & {
					WalkAnim: Animation
				}
			}
			RightHand: MeshPart & {
				RightGripAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightWrist: Motor6D
				RightWristRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightHand: WrapTarget
				OriginalSize: Vector3Value
				AvatarPartScaleType: StringValue
			}
			HumanoidRootPart: Part & {
				RootRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				OriginalSize: Vector3Value
				RootAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
			}
			Shirt: Shirt
			Pants: Pants
			RightLowerLeg: MeshPart & {
				RightAnkleRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				OriginalSize: Vector3Value
				RightKneeRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightLowerLeg: WrapTarget
				RightKnee: Motor6D
				AvatarPartScaleType: StringValue
			}
			LeftUpperLeg: MeshPart & {
				LeftHipRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				LeftHip: Motor6D
				OriginalSize: Vector3Value
				AvatarPartScaleType: StringValue
				LeftUpperLeg: WrapTarget
				LeftKneeRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
			}
			LeftLowerLeg: MeshPart & {
				LeftKnee: Motor6D
				OriginalSize: Vector3Value
				LeftLowerLeg: WrapTarget
				AvatarPartScaleType: StringValue
				LeftAnkleRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				LeftKneeRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
			}
			LowerTorso: MeshPart & {
				WaistCenterAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				LeftHipRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				Root: Motor6D
				LowerTorso: WrapTarget
				OriginalSize: Vector3Value
				RootRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightHipRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				AvatarPartScaleType: StringValue
				WaistRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				WaistBackAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				WaistFrontAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
			}
			Head: MeshPart & {
				HatAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				OriginalSize: Vector3Value
				NeckRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				FaceFrontAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				face: Decal
				Neck: Motor6D
				HairAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				Head: WrapTarget
				FaceCenterAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				AvatarPartScaleType: StringValue
			}
			UpperTorso: MeshPart & {
				RightCollarAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				BodyBackAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				NeckRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				LeftCollarAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				Waist: Motor6D
				UpperTorso: WrapTarget
				OriginalSize: Vector3Value
				AvatarPartScaleType: StringValue
				RightShoulderRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				BodyFrontAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				WaistRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				LeftShoulderRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				NeckAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
			}
			["Body Colors"]: BodyColors
			["Pal Hair"]: Accessory & {
				Handle: MeshPart & {
					HairAttachment: Attachment & {
						OriginalPosition: Vector3Value
					}
					OriginalSize: Vector3Value
					AccessoryWeld: Weld
				}
			}
			LeftUpperArm: MeshPart & {
				LeftShoulderRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				OriginalSize: Vector3Value
				LeftShoulderAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				LeftElbowRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				LeftShoulder: Motor6D
				LeftUpperArm: WrapTarget
				AvatarPartScaleType: StringValue
			}
			RightLowerArm: MeshPart & {
				RightLowerArm: WrapTarget
				OriginalSize: Vector3Value
				RightElbowRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightWristRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightElbow: Motor6D
				AvatarPartScaleType: StringValue
			}
			LeftHand: MeshPart & {
				OriginalSize: Vector3Value
				LeftHand: WrapTarget
				LeftWrist: Motor6D
				LeftGripAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				AvatarPartScaleType: StringValue
				LeftWristRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
			}
			RightFoot: MeshPart & {
				RightAnkleRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				OriginalSize: Vector3Value
				RightAnkle: Motor6D
				RightFootAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightFoot: WrapTarget
				AvatarPartScaleType: StringValue
			}
			RightUpperArm: MeshPart & {
				RightShoulder: Motor6D
				OriginalSize: Vector3Value
				RightElbowRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightUpperArm: WrapTarget
				RightShoulderRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightShoulderAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				AvatarPartScaleType: StringValue
			}
			LeftFoot: MeshPart & {
				OriginalSize: Vector3Value
				LeftAnkle: Motor6D
				LeftFoot: WrapTarget
				AvatarPartScaleType: StringValue
				LeftAnkleRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				LeftFootAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
			}
			RightUpperLeg: MeshPart & {
				OriginalSize: Vector3Value
				RightHipRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightKneeRigAttachment: Attachment & {
					OriginalPosition: Vector3Value
				}
				RightHip: Motor6D
				RightUpperLeg: WrapTarget
				AvatarPartScaleType: StringValue
			}
			Humanoid: Humanoid & {
				BodyDepthScale: NumberValue
				BodyHeightScale: NumberValue
				BodyTypeScale: NumberValue
				Status: Status
				BodyProportionScale: NumberValue
				Animator: Animator
				BodyWidthScale: NumberValue
				HumanoidDescription: HumanoidDescription & {
					AccessoryDescription: AccessoryDescription
				}
				HeadScale: NumberValue
			}
		}
	}
	Camera: Camera
	Towers: Folder
	Spawns: Folder & {
		SpawnLocation: SpawnLocation
	}
	Live: Folder
	Preview: Folder
	tPos: Part
	TRACK: Model & {
		towers: Folder
		enemies: Folder
		waypoints: Folder & {
			["1"]: Part
			["3"]: Part
			["2"]: Part
		}
	}
}
