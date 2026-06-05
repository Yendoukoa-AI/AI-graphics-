import os
import json
import tarfile
import subprocess
import hashlib

def generate_sha256(filename):
    sha256_hash = hashlib.sha256()
    with open(filename, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

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

    # Generate SHA-256 checksum
    checksum = generate_sha256(filename)
    checksum_filename = f"{filename}.sha256"
    with open(checksum_filename, "w") as f:
        f.write(f"{checksum}  {filename}\n")

    print(f"Checksum generated in {checksum_filename}: {checksum}")

if __name__ == "__main__":
    main()
