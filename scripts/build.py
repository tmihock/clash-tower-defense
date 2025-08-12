import os
import subprocess
import sys

def main():
	# Allows use on any os's file systems
	python_script = os.path.join("scripts", "fixLighting.py")
	lua_script = os.path.join("scripts", "save.luau")

	try:
		# Run rbxtsc
		subprocess.run("./node_modules/.bin/rbxtsc", shell=True, check=True)
		print(".ts files compiled.")

		# idk if the error still happens
		# Run python3 with the correct script path
		# subprocess.run([sys.executable,	 python_script], check=True)

		# Run lune with the correct script path
		subprocess.run(["lune", "run", lua_script], check=True)
		print("Models saved to folder.")

		# Run rojo build
		subprocess.run(["rojo", "build", "-o", "build.rbxlx", "default.project.json"], check=True)

	except subprocess.CalledProcessError as e:
		print(f"Error occurred: {e}")
		sys.exit(1)

if __name__ == "__main__":
	main()
