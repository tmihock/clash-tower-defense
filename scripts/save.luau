--[[ 

Reads .rbxlx file and saves .rbxm instances to /models folder


]]--
local roblox = require("@lune/roblox")
local fs = require("@lune/fs")

local file = fs.readFile("build.rbxlx")
local game = roblox.deserializePlace(file)

local services: {string} = {
	"MaterialService",
	"ReplicatedStorage",
	"ReplicatedFirst",
	"ServerStorage",
	"Workspace",
	"Teams",
	"Lighting",
	"StarterGui",
	"StarterPlayer" -- Fix
}

local ignoreRepStorage = { "TS", "rbxts_include" }
local rs = game:GetService("ReplicatedStorage")

-- Ignores files outed from rbxts 
for _, childName in ipairs(ignoreRepStorage) do 
	local child = rs:FindFirstChild(childName)
	if (child) then
		child:Destroy()
	end
end

-- game:GetService("StarterPlayer").FindFirstChild("StarterPlayerScripts").Destroy()

fs.removeDir("models")
fs.writeDir("models")

for _, serviceName in ipairs(services) do
	local service = game:GetService(serviceName)
	fs.writeFile(`models/{service.Name}.rbxmx`, roblox.serializeModel({ service }, true))
end

print("Saved models")
