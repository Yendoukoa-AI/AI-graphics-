#!/bin/bash

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"

echo "Certificates generated in certs/ directory."
