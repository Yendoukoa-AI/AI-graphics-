import os
import json
import tarfile
import subprocess

def main():
    # Load package.json for version
    with open('package.json', 'r') as f:
        pkg = json.load(f)

    version = pkg.get('version', 'unknown')
    filename = f'release-v{version}.tar.gz'

    print(f"Building project and creating {filename}...")

    # Run build
    subprocess.run(['npm', 'run', 'build'], check=True)

    # Define files to include (only if they exist)
    to_include = [
        'dist/',
        'server/',
        'package.json',
        'package-lock.json',
        'README.md',
        'LICENSE'
    ]

    with tarfile.open(filename, "w:gz") as tar:
        for item in to_include:
            if os.path.exists(item):
                tar.add(item)
                print(f"Added {item}")
            else:
                print(f"Skipping {item} (not found)")

    print(f"Successfully created {filename}")

if __name__ == "__main__":
    main()
