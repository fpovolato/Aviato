#!/bin/bash

# Script per generare certificati SSL per sviluppo locale

echo "🔐 Generating SSL certificates for local development..."

# Crea la cartella certs se non esiste
mkdir -p certs

# Genera la chiave privata
openssl genrsa -out certs/localhost-key.pem 2048

# Genera il certificato
openssl req -new -x509 -key certs/localhost-key.pem -out certs/localhost.pem -days 365 -subj "/C=IT/ST=Italy/L=Milan/O=Aviato/CN=localhost"

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates location: ./certs/"
echo "🔑 Private key: certs/localhost-key.pem"
echo "📜 Certificate: certs/localhost.pem"
