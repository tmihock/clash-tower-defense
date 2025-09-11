export interface FolderWith<T extends Instance> extends Folder {
	GetChildren(): T[]
	FindFirstChild(name: string): T | undefined
}

export type clock = number
