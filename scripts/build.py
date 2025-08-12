import os
import subprocess
import sys

def main():
	# Allows use on any os's file systems
	fix_lighting = os.path.join("scripts", "fixLighting.py")
	save_models = os.path.join("scripts", "save.luau")

	try:
		# Run rbxtsc
		subprocess.run("./node_modules/.bin/rbxtsc", shell=True, check=True)
		print(".ts files compiled.")

		# idk if the error still happens
		subprocess.run([sys.executable, fix_lighting], check=True)

		# Save models to .rbxmx files
		subprocess.run(["lune", "run", save_models], check=True)
		print("Models saved to folder.")

		# Fix error from rojo version or some shit
	
		# Run rojo build
		subprocess.run(["rojo", "build", "-o", "build.rbxlx", "default.project.json"], check=True)

	except subprocess.CalledProcessError as e:
		print(f"Error occurred: {e}")
		sys.exit(1)

if __name__ == "__main__":
	main()
