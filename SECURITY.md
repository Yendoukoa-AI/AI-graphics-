# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |
| 1.0.x   | :white_check_mark: |

## Integrity and Authenticity

To ensure the security of the Global DesignAI Studio platform, we implement strict integrity checks for all release artifacts.

### SHA-256 Checksums
Every release package is accompanied by a `.sha256` checksum file. This allows users to verify that the file has not been tampered with or corrupted during transit.

### Verification Process
Before deploying or using a release artifact, users are encouraged to run the provided verification script:
```bash
python3 scripts/verify_integrity.py <artifact_name>
```

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.
