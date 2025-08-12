export type Role = "Outlaw" | "Marshall" | "Choosing"
export type ChoosableRole = Exclude<Role, "Choosing">
