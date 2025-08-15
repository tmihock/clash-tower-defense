export type Role = "Outlaw" | "Marshall" | "Choosing"
export type ChoosableRole = Exclude<Role, "Choosing">

export interface FolderWith<T extends Instance> extends Folder {
	GetChildren(): T[]
	FindFirstChild(name: string): T | undefined
}
