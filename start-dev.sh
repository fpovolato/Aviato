#!/bin/bash

echo "🚀 Starting Aviato Development Environment..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Controlla se Docker è in esecuzione
if ! docker info > /dev/null 2>&1; then
    print_error "Docker non è in esecuzione. Avvia Docker e riprova."
    exit 1
fi

# Avvia MongoDB
print_status "Avvio MongoDB..."
docker-compose up mongo -d

# Aspetta che MongoDB sia pronto
print_status "Attendo che MongoDB sia pronto..."
sleep 5

# Controlla se i certificati esistono
if [ ! -f "certs/localhost-key.pem" ] || [ ! -f "certs/localhost.pem" ]; then
    print_warning "Certificati SSL non trovati. Generazione certificati..."
    mkdir -p certs
    openssl genrsa -out certs/localhost-key.pem 2048
    openssl req -new -x509 -key certs/localhost-key.pem -out certs/localhost.pem -days 365 -subj "/C=IT/ST=Italy/L=Milan/O=Aviato/CN=localhost"
    print_status "Certificati SSL generati!"
fi

# Avvia il backend
print_status "Avvio Backend HTTPS..."
cd backend
MONGO_URI=mongodb://localhost:27017/backenddb node index.js &
BACKEND_PID=$!

# Aspetta che il backend sia pronto
print_status "Attendo che il Backend sia pronto..."
sleep 5

# Testa il backend
if curl -k -s https://localhost:3443/api/airlines > /dev/null; then
    print_status "Backend HTTPS funzionante su https://localhost:3443"
else
    print_error "Backend non risponde. Controlla i log."
    exit 1
fi

# Avvia la dashboard (se richiesto)
read -p "Vuoi avviare anche la dashboard? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Avvio Dashboard..."
    cd ../dashboard
    npm start &
    DASHBOARD_PID=$!
    print_status "Dashboard avviata su http://localhost:4200"
fi

print_status "Ambiente di sviluppo avviato!"
echo
echo "📋 Informazioni:"
echo "   Backend HTTPS: https://localhost:3443"
echo "   Dashboard: http://localhost:4200"
echo "   MongoDB: localhost:27017"
echo
echo "🧪 Per testare le funzionalità:"
echo "   cd backend && node test-users.js"
echo
echo "🛑 Per fermare: Ctrl+C"

# Funzione di cleanup
cleanup() {
    print_status "Fermando servizi..."
    kill $BACKEND_PID 2>/dev/null
    if [ ! -z "$DASHBOARD_PID" ]; then
        kill $DASHBOARD_PID 2>/dev/null
    fi
    exit 0
}

# Intercetta Ctrl+C
trap cleanup SIGINT

# Mantieni lo script in esecuzione
wait
