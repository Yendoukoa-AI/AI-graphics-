import os
import hashlib
import sys

def calculate_sha256(filepath):
    """Calculate the SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    try:
        with open(filepath, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except FileNotFoundError:
        return None

def verify_artifact(artifact_path, checksum_path):
    """Verify an artifact against its checksum file."""
    if not os.path.exists(artifact_path):
        print(f"Error: Artifact {artifact_path} not found.")
        return False
    if not os.path.exists(checksum_path):
        print(f"Error: Checksum file {checksum_path} not found.")
        return False

    with open(checksum_path, 'r') as f:
        line = f.readline().strip()
        expected_hash = line.split()[0]

    actual_hash = calculate_sha256(artifact_path)

    if actual_hash == expected_hash:
        print(f"Verification successful: {artifact_path} matches checksum.")
        return True
    else:
        print(f"Verification FAILED: {artifact_path} does NOT match checksum!")
        print(f"Expected: {expected_hash}")
        print(f"Actual:   {actual_hash}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 verify_integrity.py <artifact_path> [checksum_path]")
        sys.exit(1)

    artifact_path = sys.argv[1]
    checksum_path = sys.argv[2] if len(sys.argv) > 2 else f"{artifact_path}.sha256"

    if verify_artifact(artifact_path, checksum_path):
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
